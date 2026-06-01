export type EnvironmentType = "local" | "deploy-preview" | "production";

export const getRedirectUrl = () => {
  const environment = import.meta.env.VITE_CONTEXT ?? "local";
  switch (environment) {
    case "production":
      return `https://${import.meta.env.VITE_URL}`;
    case "deploy-preview":
      return `https://${import.meta.env.VITE_DEPLOY_PRIME_URL}`;
    case "local":
      return globalThis.window === undefined
        ? "http://localhost:4174"
        : globalThis.window.location.origin;
  }
};

export function getAuthRouteUrl(path = "/login") {
  return new URL(path, getRedirectUrl()).toString();
}

function parseUrlParams(params: URLSearchParams) {
  return {
    type: params.get("type"),
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
  };
}

export function isRecoveryRedirect() {
  if (globalThis.window === undefined) {
    return false;
  }

  const url = new URL(globalThis.window.location.href);
  const searchState = parseUrlParams(url.searchParams);
  const hashState = parseUrlParams(new URLSearchParams(url.hash.replace(/^#/, "")));

  return (
    searchState.type === "recovery" ||
    hashState.type === "recovery" ||
    Boolean(hashState.accessToken && hashState.refreshToken)
  );
}

export function clearAuthRedirectState() {
  if (globalThis.window === undefined) {
    return;
  }

  const url = new URL(globalThis.window.location.href);
  url.hash = "";
  url.searchParams.delete("type");
  globalThis.window.history.replaceState({}, document.title, url.toString());
}
