import { useQuery } from "@tanstack/react-query";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
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
          <div className="card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Join Your Team's Events
              </h2>
              <p className="text-lg text-base-content/70 mb-8 max-w-lg mx-auto leading-relaxed">
                Sign in to see what amazing activities your colleagues are
                organizing. From sports to social events, discover opportunities
                to connect and have fun together.
              </p>

              <div className="space-y-4">
                <SignInButton>
                  <button className="btn btn-lg btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-12 shadow-lg hover:shadow-xl">
                    🚀 Sign In to View Events
                  </button>
                </SignInButton>

                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <div className="badge badge-lg bg-gradient-to-r from-primary/20 to-secondary/20 text-base-content/80 border-base-300">
                    🏓 Padel
                  </div>
                  <div className="badge badge-lg bg-gradient-to-r from-secondary/20 to-accent/20 text-base-content/80 border-base-300">
                    🧗 Climbing
                  </div>
                  <div className="badge badge-lg bg-gradient-to-r from-accent/20 to-primary/20 text-base-content/80 border-base-300">
                    🏋️ Crossfit
                  </div>
                  <div className="badge badge-lg bg-gradient-to-r from-primary/20 to-accent/20 text-base-content/80 border-base-300">
                    🍻 Social
                  </div>
                </div>
              </div>
            </div>
          </div>
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
