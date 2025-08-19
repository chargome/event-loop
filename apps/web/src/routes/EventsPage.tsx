import React from "react";
import { useQuery } from "@tanstack/react-query";

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
};

export function EventsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return (await res.json()) as { events: Event[] };
    },
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Failed to load events</p>;

  const events = data?.events ?? [];
  return (
    <div>
      <h2>Events</h2>
      {events.length === 0 ? (
        <p>No events yet</p>
      ) : (
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <strong>{e.title}</strong> —{" "}
              {new Date(e.startsAt).toLocaleString()} @ {e.location ?? "TBD"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
