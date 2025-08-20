import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { EventsList } from "../components/EventsList";

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

export function EventsListPage() {
  const { getToken } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return (await res.json()) as { events: Event[] };
    },
  });

  const events = data?.events ?? [];
  return (
    <EventsList
      events={events}
      isLoading={isLoading}
      error={error}
      showTitle={true}
    />
  );
}
