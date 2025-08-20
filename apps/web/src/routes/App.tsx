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
        {/* Floating particles with independent movement */}
        <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.2]">
          {/* Floating particles with custom animations */}
          <div
            className="absolute w-3 h-3 bg-primary/60 rounded-full"
            style={{
              top: "20%",
              left: "15%",
              animation: "float1 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-2 h-2 bg-secondary/70 rounded-full"
            style={{
              top: "60%",
              right: "25%",
              animation: "float2 6s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute w-2.5 h-2.5 bg-accent/50 rounded-full"
            style={{
              top: "35%",
              right: "10%",
              animation: "float3 10s ease-in-out infinite 2s",
            }}
          />
          <div
            className="absolute w-2 h-2 bg-primary/50 rounded-full"
            style={{
              bottom: "30%",
              left: "20%",
              animation: "float4 7s ease-in-out infinite 0.5s",
            }}
          />
          <div
            className="absolute w-3 h-3 bg-secondary/40 rounded-full"
            style={{
              bottom: "15%",
              right: "35%",
              animation: "float5 9s ease-in-out infinite 1.5s",
            }}
          />
          <div
            className="absolute w-2 h-2 bg-accent/60 rounded-full"
            style={{
              top: "75%",
              left: "40%",
              animation: "float6 5s ease-in-out infinite 2.2s",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
            style={{
              top: "10%",
              left: "60%",
              animation: "float7 11s ease-in-out infinite 3s",
            }}
          />
          <div
            className="absolute w-2.5 h-2.5 bg-secondary/30 rounded-full"
            style={{
              top: "45%",
              left: "5%",
              animation: "float8 6.5s ease-in-out infinite 0.8s",
            }}
          />
          <div
            className="absolute w-2 h-2 bg-accent/45 rounded-full"
            style={{
              bottom: "40%",
              right: "15%",
              animation: "float9 8.5s ease-in-out infinite 1.8s",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-primary/35 rounded-full"
            style={{
              top: "85%",
              right: "50%",
              animation: "float10 7.5s ease-in-out infinite 2.5s",
            }}
          />
          <div
            className="absolute w-2 h-2 bg-secondary/55 rounded-full"
            style={{
              top: "50%",
              left: "80%",
              animation: "float11 9.5s ease-in-out infinite 1.2s",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-accent/35 rounded-full"
            style={{
              bottom: "60%",
              left: "70%",
              animation: "float12 6.8s ease-in-out infinite 3.2s",
            }}
          />
          <div
            className="absolute w-2 h-2 bg-primary/45 rounded-full"
            style={{
              top: "25%",
              right: "60%",
              animation: "float13 7.2s ease-in-out infinite 0.3s",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-secondary/50 rounded-full"
            style={{
              bottom: "25%",
              left: "50%",
              animation: "float14 8.8s ease-in-out infinite 2.8s",
            }}
          />
          <div
            className="absolute w-2.5 h-2.5 bg-accent/40 rounded-full"
            style={{
              top: "55%",
              left: "30%",
              animation: "float15 6.2s ease-in-out infinite 1.7s",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-primary/30 rounded-full"
            style={{
              top: "90%",
              left: "85%",
              animation: "float16 9.2s ease-in-out infinite 3.5s",
            }}
          />
        </div>

        {/* Custom keyframes for independent particle movement */}
        <style>{`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10px, -15px) scale(1.1); }
            50% { transform: translate(-5px, -25px) scale(0.9); }
            75% { transform: translate(-15px, -10px) scale(1.05); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-20px, 10px) scale(1.2); }
            66% { transform: translate(15px, -20px) scale(0.8); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            20% { transform: translate(8px, -12px) scale(1.1); }
            40% { transform: translate(-12px, 8px) scale(0.9); }
            60% { transform: translate(18px, 15px) scale(1.15); }
            80% { transform: translate(-8px, -18px) scale(0.95); }
          }
          @keyframes float4 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-25px, -30px) scale(1.3); }
          }
          @keyframes float5 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            30% { transform: translate(12px, 8px) scale(0.8); }
            70% { transform: translate(-18px, 12px) scale(1.2); }
          }
          @keyframes float6 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-10px, 15px) scale(1.1); }
            75% { transform: translate(20px, -10px) scale(0.9); }
          }
          @keyframes float7 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            40% { transform: translate(15px, -20px) scale(1.2); }
            80% { transform: translate(-10px, 25px) scale(0.8); }
          }
          @keyframes float8 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            35% { transform: translate(-15px, -8px) scale(1.1); }
            65% { transform: translate(8px, 20px) scale(0.9); }
          }
          @keyframes float9 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(22px, -15px) scale(1.25); }
          }
          @keyframes float10 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-8px, 12px) scale(0.9); }
            50% { transform: translate(18px, -8px) scale(1.1); }
            75% { transform: translate(-12px, -15px) scale(1.05); }
          }
          @keyframes float11 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            45% { transform: translate(-20px, 18px) scale(1.15); }
            90% { transform: translate(12px, -22px) scale(0.85); }
          }
          @keyframes float12 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            30% { transform: translate(25px, -12px) scale(1.2); }
            60% { transform: translate(-15px, 20px) scale(0.9); }
          }
          @keyframes float13 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            40% { transform: translate(-18px, 14px) scale(1.1); }
            80% { transform: translate(12px, -18px) scale(0.9); }
          }
          @keyframes float14 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -25px) scale(1.15); }
            50% { transform: translate(-10px, 15px) scale(0.85); }
            75% { transform: translate(15px, 10px) scale(1.05); }
          }
          @keyframes float15 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-22px, -8px) scale(1.25); }
            66% { transform: translate(18px, 22px) scale(0.8); }
          }
          @keyframes float16 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-30px, 20px) scale(1.3); }
          }
        `}</style>

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
