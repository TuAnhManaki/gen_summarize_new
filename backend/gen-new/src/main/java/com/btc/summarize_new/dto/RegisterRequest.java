package com.btc.summarize_new.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequest {
    private String email;
    private String fullname;
    private String password;
}
