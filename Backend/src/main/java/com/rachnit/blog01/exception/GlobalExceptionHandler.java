package com.rachnit.blog01.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.rachnit.blog01.dto.error.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;


@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Handle validation errors (@Valid failures)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e, 
                                                         HttpServletRequest request) {
        Map<String, Object> details = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            details.put(error.getField(), error.getDefaultMessage());
        }
        
        ErrorResponse errorResponse = new ErrorResponse(
            400, 
            "Validation failed", 
            request.getRequestURI(), 
            details
        );
        
        return ResponseEntity.status(400).body(errorResponse);
    }

    // Handle authentication failures
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException e, 
                                                             HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
            401, 
            "Invalid credentials", 
            request.getRequestURI()
        );
        
        return ResponseEntity.status(401).body(errorResponse);
    }

    // Handle business logic errors (our custom RuntimeExceptions)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e, 
                                                               HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
            400, 
            e.getMessage(), 
            request.getRequestURI()
        );
        
        return ResponseEntity.status(400).body(errorResponse);
    }

    // Catch-all for unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e, 
                                                               HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
            500, 
            "Internal server error", 
            request.getRequestURI()
        );
        
        return ResponseEntity.status(500).body(errorResponse);
    }
}