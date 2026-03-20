package com.btc.summarize_new.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class AuthResponse {
	private String accessToken;
	private String refreshToken;
    private String role;
}
