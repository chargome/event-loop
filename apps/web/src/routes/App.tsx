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
} from "@tanstack/react-router";
import { EventsPage } from "./EventsPage";
import { EventsListPage } from "./EventsListPage";
import { MePage } from "./MePage";
import { NewEventPage } from "./NewEventPage";
import { EventDetailPage } from "./EventDetailPage";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { UiButton } from "../components/UiButton";

const rootRoute = createRootRoute({
  component: () => (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <header className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Event Loop</h1>
        <nav className="flex items-center gap-4 ml-auto">
          <Link to="/" className="text-primary hover:underline">
            Home
          </Link>
          <Link to="/events" className="text-primary hover:underline">
            Events
          </Link>
          <Link to="/me" className="text-primary hover:underline">
            Me
          </Link>
          <SignedIn>
            <UiButton asChild variant="secondary" size="sm">
              <Link to="/events/new">New Event</Link>
            </UiButton>
          </SignedIn>
          <DarkModeToggle />
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      <main className="mt-6">
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EventsPage,
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
