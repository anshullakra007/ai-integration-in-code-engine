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
    private final Executor executor;

    public CodeController(DockerSandboxService sandboxService, @Qualifier("sandboxExecutor") Executor executor) {
        this.sandboxService = sandboxService;
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
            
            if (result.getStatus() == ExecutionResult.Status.TIME_LIMIT_EXCEEDED) {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.REQUEST_TIMEOUT).body(result);
            }
            
            return org.springframework.http.ResponseEntity.ok(result);
        }, executor);
    }

}