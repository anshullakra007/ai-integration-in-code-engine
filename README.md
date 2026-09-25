# CodeEngine

CodeEngine is a fast, secure, and smart code execution platform. It allows users to write and run C++, Java, and Python code directly in their browser. Everything runs securely inside isolated Docker environments, meaning it is safe, fast, and scalable.

## The Problem It Solves

Running code submitted by users on the internet is usually very dangerous. A normal web server cannot safely run random code because people could write infinite loops, use up all the server memory, or run malicious commands. 

CodeEngine solves this by acting as a highly secure sandbox. It puts every piece of code into a temporary, restricted box (a Docker container). It handles massive amounts of traffic smoothly and returns the output to the user almost instantly.

## Core Features

* **Multi-Language Support**: Compiles and runs Java, C++, and Python code.
* **In-Editor AI Assistant**: Get instant logic breakdowns, time complexity optimizations, and error fixes directly inside the editor using the Gemini API.
* **Extreme Security**: Every execution happens inside an isolated, temporary container with strict memory and CPU limits.
* **High Performance**: Uses an asynchronous processing system to juggle thousands of concurrent requests without slowing down.

## How the AI is Integrated

We integrated Google's Gemini AI directly into the client-side frontend to serve as a built-in, lightning-fast "Code Tutor". 

Because the AI panel lives in the React client alongside the Monaco Editor, it can grab your code and the output from the Docker sandbox without adding any backend processing overhead.

You have three quick actions available right in the editor:
- **Explain My Code**: Gets a concise 3-bullet breakdown of the logic in the current file.
- **Debug Error**: When code execution fails, the client automatically grabs the compiler/runtime error from the terminal output and asks Gemini how to fix it.
- **Optimize**: Asks Gemini for Big-O algorithmic complexity tips.

### Improvements for Users:
- **Zero Debugging Frustration**: Beginners no longer get stuck on confusing syntax errors.
- **Real-Time Learning**: The AI explains logic and optimizations directly in a chat drawer next to your code.
- **Safe & Simple Architecture**: No complex autonomous agents running on the backend. Just direct, fast, single-turn prompts from the frontend to the Gemini API.

## System Architecture

```mermaid
graph TD
    Client[React Frontend] -->|HTTP POST JSON| API[Spring Boot REST API]
    API --> Controller[CodeController]
    Controller -->|CompletableFuture Async| ThreadPool[Bounded ThreadPoolExecutor]
    
    subgraph "Docker Sandbox Core"
        ThreadPool --> Service[DockerSandboxService]
        Service --> Pool[Pre-warmed Container Pool]
        
        Pool --> Cpp[C++ GCC Container]
        Pool --> Java[Java OpenJDK Container]
        Pool --> Python[Python 3 Container]
        
        Cpp -.->|docker exec via stdin| CompileRun[Compile & Run]
        Java -.->|docker exec via stdin| CompileRun
        Python -.->|docker exec via stdin| CompileRun
    end
    
    CompileRun -->|Time/Memory Tracking| Result[ExecutionResult]
    Result --> API
    API -->|HTTP 200/408| Client
    
    Client -.->|REST API Call| Gemini[Gemini API]
    Gemini -.->|Explain/Debug/Optimize| Client
```

## Security & Sandboxing

Running untrusted user code natively is incredibly risky. This engine prevents that and ensures zero resource leakage through a very strict setup:

- **Pre-warmed Container Pool**: The system keeps idle containers ready at all times. Code is injected and run instantly. This avoids running anything directly on the host computer while skipping the slow startup times of new containers.
- **Strict Resource Limits**: Each container is tightly restricted so someone cannot exhaust the system's memory or crash the host with massive arrays.
- **Network Blackholing**: Container internet access is totally disabled. This stops the sandbox from being used for malicious network attacks.

## Quick Start

### 1. Requirements
- Docker and Docker Compose installed
- Maven and Java 21

### 2. Start the Stack
Bring up the frontend and backend simultaneously using Docker Compose:
```bash
docker-compose up -d --build
```

### 3. Usage
Navigate to `http://localhost:8080`, pick your language in the Code Editor, and run your code. To try the AI integration, click the "AI Assistant" button in the top navigation bar to open the chat drawer. You'll need to enter a free Gemini API key to activate it locally.