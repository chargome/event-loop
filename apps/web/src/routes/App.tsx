import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import {
  Link,
  Outlet,
  Router,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import { LandingPage } from "./LandingPage";
import { EventsListPage } from "./EventsListPage";
import { MePage } from "./MePage";
import { NewEventPage } from "./NewEventPage";
import { EventDetailPage } from "./EventDetailPage";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { UiButton } from "../components/UiButton";
import { OfficeSelector } from "../components/OfficeSelector";

const rootRoute = createRootRoute({
  component: () => {
    const location = useLocation();
    const isLandingPage = location.pathname === "/";

    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-300/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {!isLandingPage && (
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <Link
                    to="/"
                    className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    Event Loop
                  </Link>
                  <nav className="hidden sm:flex items-center gap-1">
                    <Link
                      to="/events"
                      className="px-3 py-1.5 rounded-lg text-base-content/80 hover:text-primary hover:bg-primary/10 transition-all font-medium [&.active]:bg-primary/20 [&.active]:text-primary"
                      activeProps={{ className: "active" }}
                    >
                      Events
                    </Link>
                    <Link
                      to="/me"
                      className="px-3 py-1.5 rounded-lg text-base-content/80 hover:text-primary hover:bg-primary/10 transition-all font-medium [&.active]:bg-primary/20 [&.active]:text-primary"
                      activeProps={{ className: "active" }}
                    >
                      Me
                    </Link>
                  </nav>
                </div>

                <div className="flex items-center gap-3">
                  <nav className="flex sm:hidden items-center gap-1">
                    <Link
                      to="/events"
                      className="px-3 py-1.5 rounded-lg text-base-content/80 hover:text-primary hover:bg-primary/10 transition-all font-medium [&.active]:bg-primary/20 [&.active]:text-primary"
                      activeProps={{ className: "active" }}
                    >
                      Events
                    </Link>
                    <Link
                      to="/me"
                      className="px-3 py-1.5 rounded-lg text-base-content/80 hover:text-primary hover:bg-primary/10 transition-all font-medium [&.active]:bg-primary/20 [&.active]:text-primary"
                      activeProps={{ className: "active" }}
                    >
                      Me
                    </Link>
                  </nav>

                  <OfficeSelector />
                  <SignedIn>
                    <UiButton asChild variant="primary" size="sm">
                      <Link to="/events/new">✨ New Event</Link>
                    </UiButton>
                  </SignedIn>
                  <DarkModeToggle />
                  <SignedOut>
                    <SignInButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </header>
          )}

          {isLandingPage && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
              <OfficeSelector />
              <SignedIn>
                <UiButton asChild variant="primary" size="sm">
                  <Link to="/events/new">✨ New Event</Link>
                </UiButton>
              </SignedIn>
              <DarkModeToggle />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          )}

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: EventsListPage,
});

const meRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/me",
  component: MePage,
});

const newEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/new",
  component: NewEventPage,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$id",
  component: EventDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventsRoute,
  meRoute,
  newEventRoute,
  eventDetailRoute,
]);

export function App() {
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
