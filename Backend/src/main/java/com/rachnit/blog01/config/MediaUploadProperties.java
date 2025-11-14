package com.rachnit.blog01.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "media.upload")
public class MediaUploadProperties {

    private long maxImageSize;
    private long maxVideoSize;
    private int maxVideoDuration;
    private List<String> allowedImageTypes;
    private List<String> allowedVideoTypes;

    public MediaUploadProperties() {}

    // Getters and Setters
    public long getMaxImageSize() {
        return maxImageSize;
    }

    public void setMaxImageSize(long maxImageSize) {
        this.maxImageSize = maxImageSize;
    }

    public long getMaxVideoSize() {
        return maxVideoSize;
    }

    public void setMaxVideoSize(long maxVideoSize) {
        this.maxVideoSize = maxVideoSize;
    }

    public int getMaxVideoDuration() {
        return maxVideoDuration;
    }

    public void setMaxVideoDuration(int maxVideoDuration) {
        this.maxVideoDuration = maxVideoDuration;
    }

    public List<String> getAllowedImageTypes() {
        return allowedImageTypes;
    }

    public void setAllowedImageTypes(List<String> allowedImageTypes) {
        this.allowedImageTypes = allowedImageTypes;
    }

    public List<String> getAllowedVideoTypes() {
        return allowedVideoTypes;
    }

    public void setAllowedVideoTypes(List<String> allowedVideoTypes) {
        this.allowedVideoTypes = allowedVideoTypes;
    }

    // HELPER METHODS
    public boolean isAllowedImageType(String contentType) {
        if (contentType == null) return false;
        return allowedImageTypes.contains(contentType.toLowerCase());
    }

    public boolean isAllowedVideoType(String contentType) {
        if (contentType == null) return false;
        return allowedVideoTypes.contains(contentType.toLowerCase());
    }

    public boolean isAllowedType(String contentType) {
        return (
            isAllowedImageType(contentType) || isAllowedVideoType(contentType)
        );
    }

    public long getMaxSizeForType(String contentType) {
        if (contentType == null) return 0;

        if (isAllowedImageType(contentType)) {
            return maxImageSize;
        } else if (isAllowedVideoType(contentType)) {
            return maxVideoSize;
        }
        return 0;
    }

    public String formatBytes(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else {
            return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
        }
    }

    public String getAllowedTypesString() {
        return (
            String.join(", ", allowedImageTypes) +
            ", " +
            String.join(", ", allowedVideoTypes)
        );
    }

    public String getExtensionFromContentType(String contentType) {
        if (contentType == null) return "";

        switch (contentType.toLowerCase()) {
            case "image/jpeg":
                return "jpg";
            case "image/png":
                return "png";
            case "image/gif":
                return "gif";
            case "image/webp":
                return "webp";
            case "video/mp4":
                return "mp4";
            case "video/webm":
                return "webm";
            case "video/quicktime":
                return "mov";
            default:
                return "";
        }
    }
}
