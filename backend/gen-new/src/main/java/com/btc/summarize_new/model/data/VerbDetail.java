package com.btc.summarize_new.model.data;

import java.util.List;
import lombok.Data;

@Data
public class VerbDetail {

	private String context; // mô tả ngữ cảnh

	private List<Example> examples;

	private List<VerbExercise> exercises;

}
