import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { EventsDisplay } from "../components/EventsDisplay";
import { useOffice } from "../contexts/OfficeContext";

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
  isRegistered?: boolean;
  attendees?: Array<{
    id: number;
    name: string | null;
    avatar_url: string | null;
  }>;
  goingCount?: number;
};

export function EventsListPage() {
  const { getToken } = useAuth();
  const { selectedOffice } = useOffice();

  console.log("EventsListPage selectedOffice:", selectedOffice); // Debug log

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", selectedOffice],
    queryFn: async () => {
      console.log("Fetching events for office:", selectedOffice); // Debug log
      const token = await getToken();
      const url = new URL(`${API_URL}/events`);
      url.searchParams.set("office", selectedOffice);
      console.log("API URL:", url.toString()); // Debug log
      const res = await fetch(url.toString(), {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return (await res.json()) as { events: Event[] };
    },
  });

  const events = data?.events ?? [];
  return (
    <EventsDisplay
      events={events}
      isLoading={isLoading}
      error={error}
      showTitle={true}
    />
  );
}
