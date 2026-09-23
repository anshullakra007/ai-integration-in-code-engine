package com.codeengine.api;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class CodeTutorAgent {

    private final ChatClient chatClient;

    public CodeTutorAgent(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
            .defaultSystem("You are an expert developer and 'Auto-Healing' debugger. "
                + "When a user's code execution fails, you will receive the broken code, the error logs, and the input (if any). "
                + "Your task is to instantly analyze the error and provide the fixed code. "
                + "IMPORTANT FORMAT: You must reply exactly in this format:\n\n"
                + "### The Error\n"
                + "(Briefly explain why it crashed)\n\n"
                + "### The Fix\n"
                + "(Briefly explain what you changed to fix it)\n\n"
                + "```\n"
                + "(The entire corrected code here)\n"
                + "```")
            .build();
    }

    public ExecutionResult healCode(String language, String code, String input, ExecutionResult failedResult) {
        String userPrompt = String.format("Language: %s\n"
            + "Code:\n%s\n\n"
            + "Input:\n%s\n\n"
            + "Execution Error:\n%s\n\n"
            + "Please fix this code and use the 'executeCode' tool to verify it works.", 
            language, code, input, failedResult.getError());

        String aiResponse = chatClient.prompt()
            .user(userPrompt)
            .call()
            .content();

        failedResult.setAiFeedback(aiResponse);
        return failedResult;
    }
}
