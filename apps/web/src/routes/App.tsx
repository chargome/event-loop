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

const rootRoute = createRootRoute({
  component: () => (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Event Loop</h1>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Events</Link>
        <Link to="/me">Me</Link>
        <span style={{ marginLeft: "auto" }}>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </span>
      </nav>
      <hr />
      <Outlet />
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
