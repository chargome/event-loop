import React from "react";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
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
      <h2 className="text-xl font-medium mb-4">Me</h2>
      <SignedOut>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Please sign in <SignInButton />
        </p>
      </SignedOut>
      <SignedIn>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">Failed to load</p>
        ) : (
          <pre className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </SignedIn>
    </div>
  );
}
