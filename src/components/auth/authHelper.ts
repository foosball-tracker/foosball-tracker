export type EnvironmentType = "local" | "deploy-preview" | "production";

const normalizeSiteUrl = (value?: string) => {
  if (!value) return window.location.origin;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

export const getRedirectUrl = () => {
  const environment = import.meta.env.VITE_CONTEXT ?? "local";
  switch (environment) {
    case "production":
      return normalizeSiteUrl(import.meta.env.VITE_URL);
    case "deploy-preview":
      return normalizeSiteUrl(import.meta.env.VITE_DEPLOY_PRIME_URL);
    case "local":
      return "http://localhost:5173";
  }
};
