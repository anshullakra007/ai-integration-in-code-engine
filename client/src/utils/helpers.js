export function formatMs(ms) {
  if (ms == null || ms < 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatMemory(kb) {
  if (kb == null) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function statusLabel(status) {
  switch (status) {
    case "ACCEPTED":
      return "Accepted";
    case "COMPILATION_ERROR":
      return "Compile Error";
    case "RUNTIME_ERROR":
      return "Runtime Error";
    case "TIME_LIMIT_EXCEEDED":
      return "Time Limit Exceeded";
    case "ERROR":
      return "Error";
    default:
      return status || "—";
  }
}

export function isErrorStatus(status) {
  return status && status !== "ACCEPTED";
}
