
package com.quizrank.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404 - Resource Not Found
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound(
            NoSuchElementException e) {

        return response(HttpStatus.NOT_FOUND, e.getMessage());
    }

    // 400 - Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(
            IllegalArgumentException e) {

        return response(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    // Custom HTTP Status
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(
            ResponseStatusException e) {

        HttpStatus status = HttpStatus.valueOf(
                e.getStatusCode().value()
        );

        return response(
                status,
                e.getReason() == null
                        ? "Request failed"
                        : e.getReason()
        );
    }

    // 400 - Validation Error
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(
            MethodArgumentNotValidException e) {

        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err ->
                        err.getField() + ": " + err.getDefaultMessage()
                )
                .orElse("Invalid request data");

        return response(HttpStatus.BAD_REQUEST, message);
    }

    // 409 - Database Conflict
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> conflict(
            DataIntegrityViolationException e) {

        return response(
                HttpStatus.CONFLICT,
                "This record already exists or violates a database constraint. Refresh and try again."
        );
    }

    // 413 - PDF File Size Exceeded
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> fileSizeExceeded(
            MaxUploadSizeExceededException e) {

        return response(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "PDF file size cannot exceed 10MB."
        );
    }

    // 500 - Other Internal Server Errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> other(
            Exception e) {

        // Full exception details should be logged server-side,
        // not returned to clients.

        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error. Check backend console logs."
        );
    }

    // Common Response Method
    private ResponseEntity<Map<String, String>> response(
            HttpStatus status,
            String message) {

        Map<String, String> body = new LinkedHashMap<>();

        body.put(
                "error",
                message == null ? "Request failed" : message
        );

        return ResponseEntity.status(status).body(body);
    }
}
