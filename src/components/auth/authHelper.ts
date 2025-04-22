export type EnvironmentType = "local" | "deploy-preview" | "production";
export const getRedirectUrl = () => {
  const environment = import.meta.env.VITE_CONTEXT ?? "local";
  switch (environment) {
    case "production":
      return `https://${import.meta.env.VITE_URL}`;
    case "deploy-preview":
      return `https://${import.meta.env.VITE_DEPLOY_PRIME_URL}`;
    case "local":
      return "http://localhost:5173";
  }
};
