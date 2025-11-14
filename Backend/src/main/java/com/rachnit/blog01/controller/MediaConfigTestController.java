package com.rachnit.blog01.controller;

import com.rachnit.blog01.config.MediaUploadProperties;
import com.rachnit.blog01.service.CloudinaryService;
import com.rachnit.blog01.util.MediaValidator;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/test")
public class MediaConfigTestController {

    @Autowired
    private MediaUploadProperties uploadProperties;

    @Autowired
    private MediaValidator mediaValidator;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${cloudinary.cloud-name:NOT_SET}")
    private String cloudName;

    @Value("${cloudinary.api-key:NOT_SET}")
    private String apiKey;

    @GetMapping("/media-config")
    public Map<String, Object> getMediaConfig() {
        Map<String, Object> config = new HashMap<>();

        // Cloudinary config (hide secret for security)
        config.put("cloudinaryCloudName", cloudName);
        config.put("cloudinaryApiKey", apiKey);
        config.put(
            "cloudinaryConfigured",
            !cloudName.equals("NOT_SET") && !cloudName.isEmpty()
        );

        // Media upload limits
        config.put(
            "maxImageSize",
            uploadProperties.formatBytes(uploadProperties.getMaxImageSize())
        );
        config.put("maxImageSizeBytes", uploadProperties.getMaxImageSize());
        config.put(
            "maxVideoSize",
            uploadProperties.formatBytes(uploadProperties.getMaxVideoSize())
        );
        config.put("maxVideoSizeBytes", uploadProperties.getMaxVideoSize());
        config.put(
            "maxVideoDuration",
            uploadProperties.getMaxVideoDuration() + " seconds"
        );

        // Allowed types
        config.put(
            "allowedImageTypes",
            uploadProperties.getAllowedImageTypes()
        );
        config.put(
            "allowedVideoTypes",
            uploadProperties.getAllowedVideoTypes()
        );
        config.put("allAllowedTypes", uploadProperties.getAllowedTypesString());

        return config;
    }

    @PostMapping("/validate-file")
    public ResponseEntity<Map<String, Object>> validateFile(
        @RequestParam("file") MultipartFile file
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            mediaValidator.validateMediaFile(file);

            response.put("valid", true);
            response.put("message", "File validation passed");
            response.put("fileName", file.getOriginalFilename());
            response.put(
                "safeFileName",
                mediaValidator.getSafeFileName(file.getOriginalFilename())
            );
            response.put("contentType", file.getContentType());
            response.put(
                "mediaType",
                mediaValidator.getMediaType(file.getContentType())
            );
            response.put("size", file.getSize());
            response.put(
                "sizeFormatted",
                uploadProperties.formatBytes(file.getSize())
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("valid", false);
            response.put("error", e.getMessage());
            response.put(
                "fileName",
                file != null ? file.getOriginalFilename() : "null"
            );
            response.put(
                "contentType",
                file != null ? file.getContentType() : "null"
            );
            response.put("size", file != null ? file.getSize() : 0);

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/upload-to-cloudinary")
    public ResponseEntity<Map<String, Object>> uploadToCloudinary(
        @RequestParam("file") MultipartFile file
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Upload to Cloudinary
            String cloudinaryUrl = cloudinaryService.uploadMedia(file);

            response.put("success", true);
            response.put("message", "File uploaded successfully to Cloudinary");
            response.put("fileName", file.getOriginalFilename());
            response.put("contentType", file.getContentType());
            response.put(
                "mediaType",
                mediaValidator.getMediaType(file.getContentType())
            );
            response.put("size", file.getSize());
            response.put(
                "sizeFormatted",
                uploadProperties.formatBytes(file.getSize())
            );
            response.put("cloudinaryUrl", cloudinaryUrl);

            // Test extraction methods
            String publicId = cloudinaryService.extractPublicId(cloudinaryUrl);
            String resourceType = cloudinaryService.getResourceTypeFromUrl(
                cloudinaryUrl
            );

            response.put("publicId", publicId);
            response.put("resourceType", resourceType);
            response.put(
                "isCloudinaryUrl",
                cloudinaryService.isCloudinaryUrl(cloudinaryUrl)
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "Validation failed: " + e.getMessage());
            response.put(
                "fileName",
                file != null ? file.getOriginalFilename() : "null"
            );

            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            // Upload error
            response.put("success", false);
            response.put("error", "Upload failed: " + e.getMessage());
            response.put(
                "fileName",
                file != null ? file.getOriginalFilename() : "null"
            );
            return ResponseEntity.status(500).body(response);
        }
    }
}
