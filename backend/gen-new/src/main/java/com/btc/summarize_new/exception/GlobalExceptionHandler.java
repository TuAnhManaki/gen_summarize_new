package com.btc.summarize_new.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.btc.summarize_new.model.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Lỗi sai Email hoặc Mật khẩu (Do AuthenticationManager ném ra)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Email hoặc mật khẩu không chính xác!",
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    // 2. Lỗi Email đã tồn tại khi Register (Do RuntimeException bạn ném ra)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        // Bạn có thể check message để trả về code phù hợp
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex.getMessage().contains("Email already exists")) {
            status = HttpStatus.CONFLICT;
        }

        ErrorResponse error = new ErrorResponse(
                status.value(),
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, status);
    }

    // 3. Lỗi không có quyền truy cập (Access Denied - 403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Bạn không có quyền thực hiện hành động này!",
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    // 4. Lỗi "Trùm cuối" (Các lỗi không xác định khác)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Có lỗi hệ thống xảy ra: " + ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}