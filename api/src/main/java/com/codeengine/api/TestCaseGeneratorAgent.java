package com.codeengine.api;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestCaseGeneratorAgent {

    private final ChatClient chatClient;

    public TestCaseGeneratorAgent(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
            .defaultSystem("You are a competitive programming judge. Your job is to read user algorithm submissions "
                + "and generate precisely 3 tricky adversarial edge cases (e.g., empty arrays, integer overflows, negative numbers, extreme values). "
                + "You must figure out the input format from the user's code and provide the exact standard input (stdin) strings "
                + "needed to test those edge cases. Your output must strictly be a JSON array of strings.")
            .build();
    }

    public List<String> generateEdgeCases(String language, String code) {
        String prompt = String.format("Language: %s\n"
            + "User Code:\n%s\n\n"
            + "Generate 3 edge-case inputs for this code. Each string in the JSON array should be the full standard input (stdin) for one test case.",
            language, code);

        return chatClient.prompt()
            .user(prompt)
            .call()
            .entity(new ParameterizedTypeReference<List<String>>() {});
    }
}
