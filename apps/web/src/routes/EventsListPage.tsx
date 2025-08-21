import { useQuery } from "@tanstack/react-query";
import { useAuth, SignedIn, SignedOut } from "@clerk/clerk-react";
import { EventsDisplay } from "../components/EventsDisplay";
import { RestrictedSignIn } from "../components/RestrictedSignIn";
import { useOffice } from "../contexts/OfficeContext";
import { config } from "../config";

const API_URL = import.meta.env.VITE_API_URL || config.API_URL;

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
  const { getToken, isSignedIn } = useAuth();
  const { selectedOffice } = useOffice();

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", selectedOffice],
    queryFn: async () => {
      if (!isSignedIn) throw new Error("Not authenticated");
      const token = await getToken();
      const url = new URL(`${API_URL}/events`);
      url.searchParams.set("office", selectedOffice);
      const res = await fetch(url.toString(), {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return (await res.json()) as { events: Event[] };
    },
    enabled: isSignedIn,
  });

  return (
    <div className="space-y-6">
      <SignedOut>
        <div className="mx-auto max-w-2xl">
          <RestrictedSignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <EventsDisplay
          events={data?.events ?? []}
          isLoading={isLoading}
          error={error}
          showTitle={true}
        />
      </SignedIn>
    </div>
  );
}
