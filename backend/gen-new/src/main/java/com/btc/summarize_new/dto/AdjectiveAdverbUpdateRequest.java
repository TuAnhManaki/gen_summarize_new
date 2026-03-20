package com.btc.summarize_new.dto;

import java.util.List;

import com.btc.summarize_new.model.data.Example;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdjectiveAdverbUpdateRequest {

	private String adjective;
	private String adverb;

	private String adjectiveMeaning;
	private String adverbMeaning;

	private Example Example;

	private List<Example> adjectiveExamples;
	private List<Example> adverbExamples;

	private String note;
}
