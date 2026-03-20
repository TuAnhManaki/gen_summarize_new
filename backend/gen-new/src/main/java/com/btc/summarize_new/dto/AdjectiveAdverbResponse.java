package com.btc.summarize_new.dto;

import java.util.List;

import com.btc.summarize_new.model.data.Example;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdjectiveAdverbResponse {
	private Long id;

	private String adjective;
	private String adverb;

	private String adjectiveMeaning;
	private String adverbMeaning;

	private Example Example;

	private List<Example> adjectiveExamples;
	private List<Example> adverbExamples;

	private String note;
}
