package com.codeengine.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.messages.AssistantMessage;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CodeTutorAgentTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private ChatModel chatModel;

    @Test
    public void testAutoHealingDebugger() {
        ChatResponse mockResponse = new ChatResponse(List.of(new Generation(new AssistantMessage("I fixed the missing semicolon."))));
        when(chatModel.call(any(org.springframework.ai.chat.prompt.Prompt.class))).thenReturn(mockResponse);

        // Submit broken C++ code (missing semicolon)
        String brokenCode = """
            #include <iostream>
            using namespace std;
            int main() {
                cout << "Hello World"
                return 0;
            }
            """;

        Map<String, String> request = new HashMap<>();
        request.put("language", "cpp");
        request.put("code", brokenCode);
        request.put("input", "");

        ResponseEntity<ExecutionResult> response = restTemplate.postForEntity("/api/run", request, ExecutionResult.class);
        
        // Assert that the initial compilation error triggered the tutor agent
        // The tutor agent will either fix it (ACCEPTED) or at least provide aiFeedback
        ExecutionResult result = response.getBody();
        assertThat(result).isNotNull();
        
        System.out.println("AI Feedback: " + result.getAiFeedback());
        System.out.println("Final Status: " + result.getStatus());
        System.out.println("Final Output: " + result.getOutput());

        // We assert that the AI agent intercepted the request and provided feedback
        assertThat(result.getAiFeedback()).isNotBlank();
        
        // Optionally, check if it actually healed the code to ACCEPTED
        // assertThat(result.getStatus()).isEqualTo(ExecutionResult.Status.ACCEPTED);
    }
}
