package com.btc.summarize_new.model.data;
import java.util.List;
import lombok.Data;

@Data
public class Exercise {
	private String type; // FILL_BLANK | MULTIPLE_CHOICE
	private String question;
	private List<String> options; // null nếu fill blank
	private List<String> explains; // Giai thich ket qua
	private String answer;
}
