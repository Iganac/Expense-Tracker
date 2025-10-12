package com.expensetracker.backend.config;

import com.expensetracker.backend.exception.ConflictException;
import com.expensetracker.backend.exception.NotFoundException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    record ErrorBody(Instant timestamp, int status, String error, String message, String path) {
    }

    private ResponseEntity<ErrorBody> body(HttpStatus s, String msg, String path) {
        return ResponseEntity.status(s).body(new ErrorBody(Instant.now(), s.value(), s.getReasonPhrase(), msg, path));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorBody> notFound(NotFoundException ex, HttpServletRequest req) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorBody> conflict(ConflictException ex, HttpServletRequest req) {
        return body(HttpStatus.CONFLICT, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> badRequest(MethodArgumentNotValidException ex, HttpServletRequest req) {
        var msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage()).collect(Collectors.joining("; "));
        return body(HttpStatus.BAD_REQUEST, msg, req.getRequestURI());
    }
}
