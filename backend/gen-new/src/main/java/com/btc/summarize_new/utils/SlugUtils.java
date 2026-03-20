package com.btc.summarize_new.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

// chuyển "Danh Mục Của Tôi" thành "danh-muc-cua-toi".
public class SlugUtils {
    public static String makeSlug(String input) {
        if (input == null) return "";
        String nowhitespace = input.replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9-]", "");
    }
}
