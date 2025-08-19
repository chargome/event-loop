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
import { MePage } from "./MePage";
import { DarkModeToggle } from "../components/DarkModeToggle";

const rootRoute = createRootRoute({
  component: () => (
    <div className="container py-6">
      <header className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Event Loop</h1>
        <nav className="flex items-center gap-4 ml-auto">
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Events
          </Link>
          <Link
            to="/me"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Me
          </Link>
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

const meRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/me",
  component: MePage,
});

const routeTree = rootRoute.addChildren([indexRoute, meRoute]);

export function App() {
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
