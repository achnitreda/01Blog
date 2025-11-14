package com.rachnit.blog01.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rachnit.blog01.config.MediaUploadProperties;
import com.rachnit.blog01.util.MediaValidator;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final MediaValidator mediaValidator;

    public CloudinaryService(
        Cloudinary cloudinary,
        MediaValidator mediaValidator,
        MediaUploadProperties uploadProperties
    ) {
        this.cloudinary = cloudinary;
        this.mediaValidator = mediaValidator;
    }

    public String uploadMedia(MultipartFile file) {
        // 1. Validate file
        mediaValidator.validateMediaFile(file);

        // 2. Determine media type (image or video)
        String contentType = file.getContentType();
        String mediaType = mediaValidator.getMediaType(contentType);

        // 3. Upload to Cloudinary
        try {
            if (mediaType.equals("image")) {
                return uploadImage(file);
            } else {
                return uploadVideo(file);
            }
        } catch (IOException e) {
            System.err.println("Upload failed: " + e.getMessage());
            throw new RuntimeException(
                "Failed to upload file to Cloudinary: " + e.getMessage(),
                e
            );
        }
    }

    private String uploadImage(MultipartFile file) throws IOException {
        // Generate unique public ID
        String publicId = generatePublicId(file.getOriginalFilename());

        // Upload options
        @SuppressWarnings("rawtypes")
        Map uploadParams = ObjectUtils.asMap(
            "resource_type",
            "image",
            "public_id",
            publicId,
            "folder",
            "blog-posts/images",
            "use_filename",
            false,
            "unique_filename",
            true,
            "overwrite",
            false
        );

        // Perform upload
        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinary
            .uploader()
            .upload(file.getBytes(), uploadParams);

        // Extract secure URL
        String secureUrl = (String) uploadResult.get("secure_url");
        String cloudinaryPublicId = (String) uploadResult.get("public_id");

        System.out.println("Image uploaded successfully");
        System.out.println("   URL: " + secureUrl);
        System.out.println("   Public ID: " + cloudinaryPublicId);

        return secureUrl;
    }

    private String uploadVideo(MultipartFile file) throws IOException {
        // Generate unique public ID
        String publicId = generatePublicId(file.getOriginalFilename());

        // Upload options
        @SuppressWarnings("rawtypes")
        Map uploadParams = ObjectUtils.asMap(
            "resource_type",
            "video",
            "public_id",
            publicId,
            "folder",
            "blog-posts/videos",
            "use_filename",
            false,
            "unique_filename",
            true,
            "overwrite",
            false
        );

        // Perform upload
        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinary
            .uploader()
            .upload(file.getBytes(), uploadParams);

        // Extract secure URL
        String secureUrl = (String) uploadResult.get("secure_url");
        String cloudinaryPublicId = (String) uploadResult.get("public_id");

        System.out.println("Video uploaded successfully");
        System.out.println("   URL: " + secureUrl);
        System.out.println("   Public ID: " + cloudinaryPublicId);

        return secureUrl;
    }

    public void deleteMedia(String publicId, String resourceType) {
        try {
            @SuppressWarnings("rawtypes")
            Map deleteParams = ObjectUtils.asMap("resource_type", resourceType);

            @SuppressWarnings("rawtypes")
            Map deleteResult = cloudinary
                .uploader()
                .destroy(publicId, deleteParams);
            String result = (String) deleteResult.get("result");

            if ("ok".equals(result)) {
                System.out.println("Media deleted successfully");
            } else {
                System.out.println("Media deletion returned: " + result);
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to delete media: " + e.getMessage());
        }
    }

    /**
     * Generate unique public ID for Cloudinary
     * Format: timestamp_uuid_filename
     */
    private String generatePublicId(String originalFileName) {
        // Get safe filename
        String safeFileName = mediaValidator.getSafeFileName(originalFileName);

        // Remove extension
        int lastDotIndex = safeFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            safeFileName = safeFileName.substring(0, lastDotIndex);
        }

        // Generate unique ID: timestamp_uuid_filename
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        return timestamp + "_" + uuid + "_" + safeFileName;
    }

    /**
     * Extract public ID from Cloudinary URL
     * Example URL: https://res.cloudinary.com/demo/image/upload/v123456/folder/publicId.jpg
     * Returns: folder/publicId
     */
    public String extractPublicId(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return null;
        }

        try {
            // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{publicId}.{ext}
            // We need to extract: {folder}/{publicId}

            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            String afterUpload = parts[1];

            // Remove version (v123456/)
            String[] versionParts = afterUpload.split("/", 2);
            if (versionParts.length < 2) {
                return null;
            }

            String pathWithExtension = versionParts[1];

            // Remove file extension
            int lastDotIndex = pathWithExtension.lastIndexOf('.');
            if (lastDotIndex > 0) {
                return pathWithExtension.substring(0, lastDotIndex);
            }

            return pathWithExtension;
        } catch (Exception e) {
            System.err.println(
                "Failed to extract public ID from URL: " + e.getMessage()
            );
            return null;
        }
    }

    /**
     * Get resource type from Cloudinary URL
     * Returns "image" or "video"
     */
    public String getResourceTypeFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return null;
        }

        if (cloudinaryUrl.contains("/image/upload/")) {
            return "image";
        } else if (cloudinaryUrl.contains("/video/upload/")) {
            return "video";
        }

        return null;
    }

    public boolean isCloudinaryUrl(String url) {
        return url != null && url.contains("res.cloudinary.com");
    }
}
