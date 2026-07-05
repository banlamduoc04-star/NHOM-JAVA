package com.seal.hackathon.dto;

import java.time.LocalDateTime;

public record ApiError(String errorCode, String message, LocalDateTime timestamp) {
    public static ApiError of(String code, String message) {
        return new ApiError(code, message, LocalDateTime.now());
    }
}
