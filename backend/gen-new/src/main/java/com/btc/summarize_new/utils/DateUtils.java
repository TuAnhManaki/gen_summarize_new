package com.btc.summarize_new.utils;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateUtils {

    // Lối tắt 1: Parse chuẩn RSS (RFC 1123)
    public static LocalDateTime parseRssDate(String pubDateStr) {
        if (pubDateStr == null || pubDateStr.isEmpty()) return LocalDateTime.now();
        try {
            // Định dạng chuẩn: "EEE, dd MMM yyyy HH:mm:ss Z"
            ZonedDateTime zdt = ZonedDateTime.parse(pubDateStr, DateTimeFormatter.RFC_1123_DATE_TIME);
            return zdt.toLocalDateTime();
        } catch (DateTimeParseException e) {
            return null; // Trả về null để chuyển sang phương án dự phòng
        }
    }

    // Lối tắt 2: Parse chuẩn thẻ Meta HTML (ISO 8601)
    public static LocalDateTime parseMetaDate(String metaDateStr) {
        if (metaDateStr == null || metaDateStr.isEmpty()) return LocalDateTime.now();
        try {
            // Định dạng chuẩn: "2026-03-19T10:15:00+07:00"
            ZonedDateTime zdt = ZonedDateTime.parse(metaDateStr);
            return zdt.toLocalDateTime();
        } catch (DateTimeParseException e) {
            return LocalDateTime.now(); // Fallback cuối cùng là thời điểm hiện tại
        }
    }
}