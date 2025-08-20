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
import { EditEventPage } from "./EditEventPage";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { UiButton } from "../components/UiButton";
import { OfficeSelector } from "../components/OfficeSelector";
import donutIcon from "../../assets/donut.png";

const rootRoute = createRootRoute({
  component: () => {
    const location = useLocation();
    const isLandingPage = location.pathname === "/";

    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Unconventional Donut Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-200/30 to-base-300/20"></div>
        {/* Unconventional donut layers - works in both light and dark mode */}
        <div className="absolute inset-0 opacity-[0.12] mix-blend-normal dark:mix-blend-screen">
          {/* Mega donut - giant center piece */}
          <img
            src={donutIcon}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] object-contain animate-spin"
            style={{
              animationDuration: "200s",
              filter:
                "hue-rotate(45deg) saturate(0.7) brightness(0.8) contrast(1.2)",
            }}
          />
        </div>

        <div className="absolute inset-0 opacity-[0.08] mix-blend-normal dark:mix-blend-overlay">
          {/* Corner donuts with different rotations */}
          <img
            src={donutIcon}
            alt=""
            className="absolute -top-20 -right-20 w-96 h-96 object-contain animate-spin"
            style={{
              animationDuration: "60s",
              transform: "rotate(45deg) scale(1.2)",
              filter: "hue-rotate(120deg) brightness(0.9) contrast(1.1)",
            }}
          />
          <img
            src={donutIcon}
            alt=""
            className="absolute -bottom-20 -left-20 w-80 h-80 object-contain animate-spin"
            style={{
              animationDuration: "45s",
              animationDirection: "reverse",
              transform: "rotate(-30deg) scaleX(-1)",
              filter: "hue-rotate(240deg)",
            }}
          />
          <img
            src={donutIcon}
            alt=""
            className="absolute -top-10 -left-10 w-64 h-64 object-contain animate-spin"
            style={{
              animationDuration: "80s",
              transform: "rotate(15deg) scale(0.8)",
              filter: "hue-rotate(180deg)",
            }}
          />
          <img
            src={donutIcon}
            alt=""
            className="absolute -bottom-10 -right-10 w-72 h-72 object-contain animate-spin"
            style={{
              animationDuration: "70s",
              animationDirection: "reverse",
              transform: "rotate(-45deg) scaleY(-1)",
              filter: "hue-rotate(300deg)",
            }}
          />
        </div>

        <div className="absolute inset-0 opacity-[0.06] mix-blend-normal dark:mix-blend-soft-light">
          {/* Floating medium donuts with bounce */}
          <img
            src={donutIcon}
            alt=""
            className="absolute top-1/4 left-1/5 w-40 h-40 object-contain animate-bounce"
            style={{
              animationDelay: "0s",
              animationDuration: "4s",
              transform: "rotate(30deg)",
              filter: "hue-rotate(60deg)",
            }}
          />
          <img
            src={donutIcon}
            alt=""
            className="absolute top-3/4 right-1/5 w-36 h-36 object-contain animate-bounce"
            style={{
              animationDelay: "2s",
              animationDuration: "5s",
              transform: "rotate(-60deg) scaleX(-1)",
              filter: "hue-rotate(160deg)",
            }}
          />
          <img
            src={donutIcon}
            alt=""
            className="absolute top-1/3 right-1/3 w-28 h-28 object-contain animate-pulse"
            style={{
              animationDuration: "3s",
              transform: "rotate(90deg)",
              filter: "hue-rotate(270deg)",
            }}
          />
          <img
            src={donutIcon}
            alt=""
            className="absolute top-2/3 left-1/3 w-32 h-32 object-contain animate-pulse"
            style={{
              animationDelay: "1.5s",
              animationDuration: "2.5s",
              transform: "rotate(-90deg) scaleY(-1)",
              filter: "hue-rotate(90deg)",
            }}
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            {!isLandingPage && (
              <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <Link
                      to="/"
                      className="flex items-center gap-3 text-3xl font-bold text-base-content hover:opacity-80 transition-opacity"
                    >
                      <div className="relative">
                        {/* Subtle glow for header logo */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-sm"></div>
                        <img
                          src={donutIcon}
                          alt="Event Loop"
                          className="relative w-10 h-10 object-contain animate-pulse"
                          style={{ animationDuration: "2s" }}
                        />
                      </div>
                      <span className="bg-gradient-to-r from-base-content/95 to-base-content/80 bg-clip-text text-transparent">
                        EventLoop
                      </span>
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
                      <UiButton variant="primary" size="sm">
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
                  <Link to="/events/new">
                    <UiButton variant="primary" size="sm">
                      ✨ New Event
                    </UiButton>
                  </Link>
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

const editEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$id/edit",
  component: EditEventPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventsRoute,
  meRoute,
  newEventRoute,
  eventDetailRoute,
  editEventRoute,
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
