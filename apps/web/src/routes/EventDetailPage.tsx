import React from "react";
import { useParams } from "@tanstack/react-router";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UiButton } from "../components/UiButton";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export function EventDetailPage() {
  const params = useParams({ from: "/events/$id" as any }) as { id: string };
  const id = Number(params.id);
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = React.useState<number | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as {
        event: any;
        goingCount: number;
        attendees: Array<{
          id: number;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        }>;
      };
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to register");
      return res.json();
    },
    onMutate: () => setLoadingId(id),
    onSettled: () => setLoadingId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event", id] }),
  });

  if (isLoading) return <p>Loading…</p>;
  if (error || !data) return <p>Not found</p>;
  const e = data.event;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-2xl font-semibold">{e.title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {new Date(e.startsAt).toLocaleString()} @ {e.location ?? "TBD"}
      </div>
      {e.description ? (
        <p className="whitespace-pre-wrap">{e.description}</p>
      ) : null}
      <div className="text-sm">
        Attendees: {data.goingCount}
        {e.capacity ? ` / ${e.capacity}` : " (no capacity)"}
      </div>

      {/* Attendees List */}
      {data.attendees && data.attendees.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Who's going</h3>
          <div className="space-y-2">
            {data.attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-base-200"
              >
                {attendee.avatar_url ? (
                  <img
                    src={attendee.avatar_url}
                    alt={attendee.name || attendee.email}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {(attendee.name || attendee.email)[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">
                    {attendee.name || attendee.email}
                  </div>
                  {attendee.name && (
                    <div className="text-xs text-base-content/60">
                      {attendee.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SignedOut>
        <p className="text-sm text-gray-600">
          Please sign in to register. <SignInButton />
        </p>
      </SignedOut>
      <SignedIn>
        {e.signupMode === "external" && e.externalUrl ? (
          <UiButton asChild variant="secondary" size="sm">
            <a href={e.externalUrl} target="_blank" rel="noreferrer">
              Sign up externally
            </a>
          </UiButton>
        ) : (
          <UiButton
            size="sm"
            variant="primary"
            loading={registerMutation.isPending && loadingId === id}
            onClick={() => registerMutation.mutate()}
          >
            {registerMutation.isPending && loadingId === id
              ? "Registering"
              : "Register"}
          </UiButton>
        )}
      </SignedIn>
    </div>
  );
}
