package com.rachnit.blog01.util;

import com.rachnit.blog01.config.MediaUploadProperties;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class MediaValidator {

    private final MediaUploadProperties uploadProperties;

    private static final List<String> DANGEROUS_EXTENSIONS = Arrays.asList(
        "exe",
        "bat",
        "cmd",
        "sh",
        "jar",
        "war",
        "dll",
        "so",
        "dylib",
        "class",
        "js",
        "php",
        "jsp",
        "asp",
        "aspx",
        "py",
        "rb",
        "pl"
    );

    public MediaValidator(MediaUploadProperties uploadProperties) {
        this.uploadProperties = uploadProperties;
    }

    public void validateMediaFile(MultipartFile file) {
        validateFileExists(file);

        String contentType = file.getContentType();
        validateContentType(contentType);

        validateFileSize(file, contentType);

        validateFileName(file.getOriginalFilename());

        validateFileExtension(file.getOriginalFilename(), contentType);
    }

    private void validateFileExists(MultipartFile file) {
        if (file == null) {
            throw new IllegalArgumentException("No file provided");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() == 0) {
            throw new IllegalArgumentException("File size is 0 bytes");
        }
    }

    private void validateContentType(String contentType) {
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "File type cannot be determined"
            );
        }

        contentType = contentType.toLowerCase().trim();

        if (!uploadProperties.isAllowedType(contentType)) {
            throw new IllegalArgumentException(
                "File type '" +
                    contentType +
                    "' is not allowed. " +
                    "Allowed types: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM, MOV)"
            );
        }
    }

    private void validateFileSize(MultipartFile file, String contentType) {
        long fileSize = file.getSize();
        long maxSize = uploadProperties.getMaxSizeForType(contentType);

        if (fileSize > maxSize) {
            String fileType = uploadProperties.isAllowedImageType(contentType)
                ? "image"
                : "video";
            throw new IllegalArgumentException(
                "File too large. Maximum " +
                    fileType +
                    " size: " +
                    uploadProperties.formatBytes(maxSize) +
                    ", your file: " +
                    uploadProperties.formatBytes(fileSize)
            );
        }
    }

    private void validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IllegalArgumentException("File name is empty");
        }

        if (fileName.contains("..")) {
            throw new IllegalArgumentException(
                "Invalid file name: path traversal detected"
            );
        }

        if (fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException(
                "Invalid file name: path separators not allowed"
            );
        }

        // Check for null bytes (security issue)
        if (fileName.contains("\0")) {
            throw new IllegalArgumentException(
                "Invalid file name: null bytes detected"
            );
        }

        if (fileName.length() > 255) {
            throw new IllegalArgumentException(
                "File name too long (max 255 characters)"
            );
        }

        String extension = getFileExtension(fileName);
        if (
            extension != null &&
            DANGEROUS_EXTENSIONS.contains(extension.toLowerCase())
        ) {
            throw new IllegalArgumentException(
                "File extension '" +
                    extension +
                    "' is not allowed for security reasons"
            );
        }
    }

    private void validateFileExtension(String fileName, String contentType) {
        String extension = getFileExtension(fileName);
        if (extension == null || extension.isEmpty()) {
            throw new IllegalArgumentException("File has no extension");
        }

        String expectedExtension = uploadProperties.getExtensionFromContentType(
            contentType
        );

        extension = extension.toLowerCase();

        boolean isValid = false;
        switch (contentType.toLowerCase()) {
            case "image/jpeg":
                isValid = extension.equals("jpg") || extension.equals("jpeg");
                break;
            case "image/png":
                isValid = extension.equals("png");
                break;
            case "image/gif":
                isValid = extension.equals("gif");
                break;
            case "image/webp":
                isValid = extension.equals("webp");
                break;
            case "video/mp4":
                isValid = extension.equals("mp4");
                break;
            case "video/webm":
                isValid = extension.equals("webm");
                break;
            case "video/quicktime":
                isValid = extension.equals("mov") || extension.equals("qt");
                break;
            default:
                isValid = false;
        }

        if (!isValid) {
            throw new IllegalArgumentException(
                "File extension '." +
                    extension +
                    "' does not match content type '" +
                    contentType +
                    "'. Expected: ." +
                    expectedExtension
            );
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }

        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == fileName.length() - 1) {
            return null;
        }
        return fileName.substring(lastDotIndex + 1);
    }

    public String getSafeFileName(String originalFileName) {
        if (originalFileName == null || originalFileName.isEmpty()) {
            return "unnamed";
        }

        String extension = getFileExtension(originalFileName);
        String nameWithoutExtension = originalFileName;

        if (extension != null) {
            nameWithoutExtension = originalFileName.substring(
                0,
                originalFileName.length() - extension.length() - 1
            );
        }

        // Remove special characters, keep only alphanumeric, dash, underscore
        String safeName = nameWithoutExtension
            .replaceAll("[^a-zA-Z0-9-_]", "_")
            .replaceAll("_{2,}", "_") // Replace multiple underscores with single
            .toLowerCase();

        if (safeName.length() > 50) {
            safeName = safeName.substring(0, 50);
        }

        if (extension != null && !extension.isEmpty()) {
            safeName = safeName + "." + extension.toLowerCase();
        }

        return safeName;
    }

    public String getMediaType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Content type is null");
        }

        contentType = contentType.toLowerCase().trim();

        if (uploadProperties.isAllowedImageType(contentType)) {
            return "image";
        } else if (uploadProperties.isAllowedVideoType(contentType)) {
            return "video";
        }

        throw new IllegalArgumentException(
            "Unknown media type: " + contentType
        );
    }
}
