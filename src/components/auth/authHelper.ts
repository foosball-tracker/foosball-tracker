export const getRedirectUrl = () => {
  const environment: "local" | "preview" | "production" =
    import.meta.env.VITE_VERCEL_TARGET_ENV ?? "local";
  switch (environment) {
    case "production":
      return `https://${import.meta.env.VITE_VERCEL_PROJECT_PRODUCTION_URL}`;
    case "preview":
      return `https://${import.meta.env.VITE_VERCEL_BRANCH_URL}`;
    case "local":
      return "http://localhost:5173";
  }
};
