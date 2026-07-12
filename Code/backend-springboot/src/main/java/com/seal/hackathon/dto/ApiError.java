package com.seal.hackathon.dto;

import java.time.LocalDateTime;

/**
 * DTO dùng để trả về thông tin lỗi cho client.
 *  errorCode Mã lỗi của hệ thống
 *  message   Thông báo lỗi
 *  timestamp Thời điểm phát sinh lỗi
 */
public record ApiError(
        String errorCode,
        String message,
        LocalDateTime timestamp
) {
    /**
     * Tạo nhanh đối tượng ApiError với thời gian hiện tại.
     *  Mã lỗi
     *  Nội dung lỗi
     *  ApiError
     */
    public static ApiError of(String code, String message) {
        return new ApiError(
                code,
                message,
                LocalDateTime.now()
        );
    }
}