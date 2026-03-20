package com.btc.summarize_new.model.data;

import java.util.List;

import lombok.Data;

@Data
public class VerbExercise {

    private String question;

    private List<String> options;

    private String answer;
    
    private String explanation;

}
