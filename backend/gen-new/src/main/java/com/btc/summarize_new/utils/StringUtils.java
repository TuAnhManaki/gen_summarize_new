package com.btc.summarize_new.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class StringUtils {
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "chua-phan-loai";
        }
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-"); // Xóa các dấu gạch ngang liền nhau
    }
}
