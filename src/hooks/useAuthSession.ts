import { useAuth } from "~/components/auth/AuthProvider.tsx";

export function useAuthSession() {
  return useAuth();
}
