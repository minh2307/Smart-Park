package com.gateos.common.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class QRCodeUtilTest {

    @Test
    void shouldGenerateQRCodeImage_WithDefaultDimensions() {
        // Arrange
        String content = "https://gateos.com/ticket/GOS-123456";

        // Act
        byte[] qrCodeBytes = QRCodeUtil.generateQRCodeImage(content);

        // Assert
        assertNotNull(qrCodeBytes);
        assertTrue(qrCodeBytes.length > 0);
    }

    @Test
    void shouldGenerateQRCodeImage_WithCustomDimensions() {
        // Arrange
        String content = "https://gateos.com/ticket/GOS-654321";
        int width = 150;
        int height = 150;

        // Act
        byte[] qrCodeBytes = QRCodeUtil.generateQRCodeImage(content, width, height);

        // Assert
        assertNotNull(qrCodeBytes);
        assertTrue(qrCodeBytes.length > 0);
    }

    @Test
    void shouldThrowException_WhenContentIsNull() {
        // Arrange
        String content = null;

        // Act & Assert
        assertThrows(NullPointerException.class, () -> {
            QRCodeUtil.generateQRCodeImage(content);
        });
    }

    @Test
    void shouldThrowException_WhenDimensionsAreInvalid() {
        // Arrange
        String content = "https://gateos.com/ticket/GOS-123";
        int width = -100;
        int height = 100;

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            QRCodeUtil.generateQRCodeImage(content, width, height);
        });
    }
}
