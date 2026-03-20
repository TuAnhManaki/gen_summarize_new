package com.btc.summarize_new.model.data;

import java.util.List;

import lombok.Data;

@Data
public class GrammarSection {

	private String type;
	private String title;
	private String icon;
	private String iconColor;
	private String formula;

	private List<Example> examples;
	private List<String> noteItems;
}
