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
    <div className="mx-auto max-w-4xl">
      <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300">
        <div className="card-body space-y-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {e.title}
          </h2>
          <div className="flex flex-wrap gap-4 text-base-content/70">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span>{new Date(e.startsAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>{e.location ?? "TBD"}</span>
            </div>
          </div>

          {e.description && (
            <div className="card bg-base-200/50 border border-base-300">
              <div className="card-body py-4">
                <p className="whitespace-pre-wrap text-base-content/80">
                  {e.description}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-lg">
              {data.goingCount} attendees
              {e.capacity ? ` / ${e.capacity}` : ""}
            </span>
            {!e.capacity && (
              <span className="text-sm text-base-content/60">
                (unlimited capacity)
              </span>
            )}
          </div>

          {/* Attendees List */}
          {data.attendees && data.attendees.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span>👥</span>
                Who's going ({data.attendees.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-base-200/50 to-base-300/30 border border-base-300/50"
                  >
                    {attendee.avatar_url ? (
                      <img
                        src={attendee.avatar_url}
                        alt={attendee.name || attendee.email}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/20">
                        <span className="text-sm font-bold text-primary">
                          {(attendee.name || attendee.email)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {attendee.name || attendee.email}
                      </div>
                      {attendee.name && (
                        <div className="text-xs text-base-content/60 truncate">
                          {attendee.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="divider"></div>

          {/* Action Buttons */}
          <SignedOut>
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2">Join the Event! 🎉</h3>
              <p className="text-base-content/70 mb-4">
                Sign in to register for this event
              </p>
              <SignInButton />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex gap-3 justify-center">
              {e.signupMode === "external" && e.externalUrl ? (
                <UiButton asChild variant="secondary" size="sm">
                  <a href={e.externalUrl} target="_blank" rel="noreferrer">
                    🔗 Sign up externally
                  </a>
                </UiButton>
              ) : (
                <UiButton
                  size="sm"
                  variant="primary"
                  loading={registerMutation.isPending && loadingId === id}
                  onClick={() => registerMutation.mutate()}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none"
                >
                  {registerMutation.isPending && loadingId === id
                    ? "✨ Registering..."
                    : "🚀 Register for Event"}
                </UiButton>
              )}
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
