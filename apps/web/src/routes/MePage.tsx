import React from "react";
import {
  useAuth,
  SignedIn,
  SignedOut,
  SignInButton,
  UserProfile,
} from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export function MePage() {
  const { getToken } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/me`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch me");
      return (await res.json()) as { userId: string };
    },
  });

  return (
    <div>
      <SignedOut>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Please sign in <SignInButton />
        </p>
      </SignedOut>
      <SignedIn>
        <div className="flex justify-center mt-20">
          <UserProfile />
        </div>
      </SignedIn>
    </div>
  );
}
