import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { UiButton } from "./UiButton";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

type Event = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  capacity: number | null;
  createdBy: number;
  createdAt: string;
  signupMode?: "internal" | "external";
  externalUrl?: string | null;
};

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
  error?: unknown;
  showTitle?: boolean;
}

export function EventsList({
  events,
  isLoading = false,
  error = null,
  showTitle = true,
}: EventsListProps) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [registeredIds, setRegisteredIds] = React.useState<Set<number>>(
    new Set()
  );

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to register");
      return res.json();
    },
    onMutate: (id) => setActiveId(id),
    onSuccess: (_data, id) => {
      setRegisteredIds((prev) => new Set(prev).add(id));
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onSettled: () => setActiveId(null),
  });

  if (isLoading) return <div className="text-base-content">Loading…</div>;
  if (error) return <div className="text-error">Failed to load events</div>;

  return (
    <div className="space-y-4">
      {showTitle && (
        <h2 className="text-2xl font-semibold text-base-content">Events</h2>
      )}

      <SignedOut>
        <div className="text-base-content/70">
          Please sign in to view events. <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        {events.length === 0 ? (
          <div className="text-base-content/70">No events yet</div>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-base-300 bg-base-100 p-4 hover:bg-base-200/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base-content">
                    <Link
                      to="/events/$id"
                      params={{ id: String(e.id) }}
                      className="hover:underline hover:text-primary"
                    >
                      {e.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-base-content/60">
                      {new Date(e.startsAt).toLocaleString()}
                    </span>
                    {e.signupMode === "external" && e.externalUrl ? (
                      <UiButton asChild variant="secondary" size="sm">
                        <a
                          href={e.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Sign up externally
                        </a>
                      </UiButton>
                    ) : registeredIds.has(e.id) ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="size-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.06l-3.5-3.75a.75.75 0 111.096-1.024l2.91 3.121 6.96-8.819a.75.75 0 011.018-.14z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Registered
                      </span>
                    ) : (
                      <UiButton
                        size="sm"
                        variant="primary"
                        loading={
                          activeId === e.id && registerMutation.isPending
                        }
                        onClick={() => registerMutation.mutate(e.id)}
                      >
                        {activeId === e.id && registerMutation.isPending
                          ? "Registering"
                          : "Register"}
                      </UiButton>
                    )}
                  </div>
                </div>
                <div className="text-sm text-base-content/70 mt-1">
                  @{e.location ?? "TBD"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SignedIn>
    </div>
  );
}
