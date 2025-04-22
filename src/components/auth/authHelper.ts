export const getRedirectUrl = () => {
  console.log("env", import.meta.env);
  const environment: "local" | "deploy-preview" | "production" =
    import.meta.env.VITE_CONTEXT ?? "local";
  switch (environment) {
    case "production":
      return `https://${import.meta.env.VITE_URL}`;
    case "deploy-preview":
      return `https://${import.meta.env.VITE_DEPLOY_PRIME_URL}`;
    case "local":
      return "http://localhost:5173";
  }
};
