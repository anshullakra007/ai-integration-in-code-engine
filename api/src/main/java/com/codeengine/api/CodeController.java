package com.codeengine.api;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

/**
 * REST Controller responsible for handling incoming code execution requests.
 * 
 * To ensure high availability and prevent thread exhaustion under heavy load,
 * this controller leverages CompletableFuture to asynchronously process requests
 * using a custom bounded ThreadPoolExecutor. This guarantees that the main
 * Tomcat HTTP threads are never blocked by long-running Docker operations.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CodeController {


    private final DockerSandboxService sandboxService;
    private final CodeTutorAgent codeTutorAgent;
    private final TestCaseGeneratorAgent testCaseGeneratorAgent;
    private final Executor executor;

    public CodeController(DockerSandboxService sandboxService, CodeTutorAgent codeTutorAgent, TestCaseGeneratorAgent testCaseGeneratorAgent, @Qualifier("sandboxExecutor") Executor executor) {
        this.sandboxService = sandboxService;
        this.codeTutorAgent = codeTutorAgent;
        this.testCaseGeneratorAgent = testCaseGeneratorAgent;
        this.executor = executor;
    }

    /**
     * Executes the submitted code in a secure Docker sandbox.
     * 
     * @param payload A JSON map containing the 'language' (cpp, java, python),
     *                'code' (source code to execute), and 'input' (stdin data).
     * @return A CompletableFuture resolving to the execution metrics and stdout/stderr output.
     */
    @PostMapping("/run")
    public CompletableFuture<org.springframework.http.ResponseEntity<ExecutionResult>> runCode(@RequestBody Map<String, String> payload) {
        String language = payload.get("language");
        String code = payload.getOrDefault("code", payload.get("sourceCode"));
        String input = payload.get("input");

        return CompletableFuture.supplyAsync(() -> {
            ExecutionResult result = sandboxService.executeCode(language, code, input);
            
            if (result.getStatus() != ExecutionResult.Status.ACCEPTED && result.getStatus() != ExecutionResult.Status.ERROR) {
                // Trigger Auto-Healing Debugger
                try {
                    result = codeTutorAgent.healCode(language, code, input, result);
                } catch (Exception e) {
                    System.err.println("Auto-heal failed: " + e.getMessage());
                    result.setAiFeedback("AI Auto-Heal failed: " + e.getMessage());
                }
            }

            if (result.getStatus() == ExecutionResult.Status.TIME_LIMIT_EXCEEDED) {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.REQUEST_TIMEOUT).body(result);
            }
            
            return org.springframework.http.ResponseEntity.ok(result);
        }, executor);
    }

    /**
     * Edge-Case Generator flow for competitive programming.
     */
    @PostMapping("/submit")
    public CompletableFuture<org.springframework.http.ResponseEntity<BatchExecutionResult>> submitCode(@RequestBody Map<String, String> payload) {
        String language = payload.get("language");
        String code = payload.getOrDefault("code", payload.get("sourceCode"));
        String initialInput = payload.get("input");

        return CompletableFuture.supplyAsync(() -> {
            long batchStart = System.nanoTime();
            
            java.util.List<String> inputs = new java.util.ArrayList<>();
            if (initialInput != null && !initialInput.isEmpty()) {
                inputs.add(initialInput);
            }
            
            try {
                java.util.List<String> edgeCases = testCaseGeneratorAgent.generateEdgeCases(language, code);
                if (edgeCases != null) {
                    inputs.addAll(edgeCases);
                }
            } catch (Exception e) {
                System.err.println("Failed to generate edge cases: " + e.getMessage());
            }

            java.util.List<CompletableFuture<ExecutionResult>> futures = inputs.stream()
                .map(input -> CompletableFuture.supplyAsync(() -> {
                    try {
                        ExecutionResult res = sandboxService.executeCode(language, code, input);
                        if (res.getStatus() != ExecutionResult.Status.ACCEPTED && res.getStatus() != ExecutionResult.Status.ERROR) {
                            res = codeTutorAgent.healCode(language, code, input, res);
                        }
                        return res;
                    } catch (Exception e) {
                        return ExecutionResult.error("Server error: " + e.getMessage());
                    }
                }, executor))
                .toList();

            java.util.List<ExecutionResult> results = futures.stream()
                .map(CompletableFuture::join)
                .toList();

            BatchExecutionResult batchResult = new BatchExecutionResult();
            batchResult.setTestCaseResults(results);
            
            int passed = (int) results.stream().filter(r -> r.getStatus() == ExecutionResult.Status.ACCEPTED).count();
            batchResult.setPassedTests(passed);
            batchResult.setTotalTests(results.size());
            batchResult.setTotalBatchTimeMs((System.nanoTime() - batchStart) / 1_000_000);
            
            if (passed == results.size() && !results.isEmpty()) {
                batchResult.setSummary("All test cases passed!");
            } else {
                batchResult.setSummary(String.format("%d out of %d test cases passed.", passed, results.size()));
            }

            return org.springframework.http.ResponseEntity.ok(batchResult);
        });
    }

    /**
     * Dedicated Auto-Heal endpoint for testing.
     */
    @PostMapping("/code/auto-heal")
    public CompletableFuture<org.springframework.http.ResponseEntity<ExecutionResult>> autoHeal(@RequestBody Map<String, String> payload) {
        String language = payload.get("language");
        String code = payload.getOrDefault("code", payload.get("sourceCode"));
        String errorOutput = payload.get("errorOutput");

        return CompletableFuture.supplyAsync(() -> {
            try {
                ExecutionResult fakeFailedResult = ExecutionResult.error(errorOutput);
                ExecutionResult healedResult = codeTutorAgent.healCode(language, code, "", fakeFailedResult);
                return org.springframework.http.ResponseEntity.ok(healedResult);
            } catch (Exception e) {
                System.err.println("Dedicated auto-heal endpoint failed: " + e.getMessage());
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ExecutionResult.error("Auto-Heal service failed: " + e.getMessage()));
            }
        });
    }
}