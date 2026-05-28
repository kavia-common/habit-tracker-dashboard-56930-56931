/**
 * PUBLIC_INTERFACE
 * Environment configuration for backend connectivity.
 */
export function getEnvConfig() {
  const apiBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:8000";

  const wsUrl =
    process.env.REACT_APP_WS_URL ||
    apiBase.replace(/^http/, "ws") + "/ws";

  const frontendUrl =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

  const logLevel = process.env.REACT_APP_LOG_LEVEL || "info";

  return {
    apiBase,
    wsUrl,
    frontendUrl,
    logLevel,
  };
}
