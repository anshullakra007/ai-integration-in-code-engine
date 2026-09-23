package com.codeengine.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import java.util.function.Function;

@Configuration
public class CodeExecutionTool {

    private final DockerSandboxService sandboxService;

    public CodeExecutionTool(DockerSandboxService sandboxService) {
        this.sandboxService = sandboxService;
    }

    public record CodeExecutionRequest(String language, String sourceCode, String input) {}

    @Bean
    @Description("Executes user source code in an isolated Docker sandbox. The 'language' parameter must be 'java', 'cpp', or 'python'. The 'sourceCode' parameter should contain the full syntactically correct code to compile and run. The 'input' parameter is optional standard input to feed to the program. Returns an ExecutionResult containing the compilation and execution status, stdout, stderr, and memory usage.")
    public Function<CodeExecutionRequest, ExecutionResult> executeCode() {
        return request -> sandboxService.executeCode(
            request.language(),
            request.sourceCode(),
            request.input()
        );
    }
}
