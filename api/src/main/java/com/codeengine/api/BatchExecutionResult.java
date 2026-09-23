package com.codeengine.api;

import java.util.List;

public class BatchExecutionResult {
    private List<ExecutionResult> testCaseResults;
    private String summary;
    private long totalBatchTimeMs;
    private int passedTests;
    private int totalTests;

    public BatchExecutionResult() {}

    public List<ExecutionResult> getTestCaseResults() {
        return testCaseResults;
    }

    public void setTestCaseResults(List<ExecutionResult> testCaseResults) {
        this.testCaseResults = testCaseResults;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public long getTotalBatchTimeMs() {
        return totalBatchTimeMs;
    }

    public void setTotalBatchTimeMs(long totalBatchTimeMs) {
        this.totalBatchTimeMs = totalBatchTimeMs;
    }

    public int getPassedTests() {
        return passedTests;
    }

    public void setPassedTests(int passedTests) {
        this.passedTests = passedTests;
    }

    public int getTotalTests() {
        return totalTests;
    }

    public void setTotalTests(int totalTests) {
        this.totalTests = totalTests;
    }
}
