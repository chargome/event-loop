import React from "react";
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

const rootRoute = createRootRoute({
  component: () => (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Event Loop</h1>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Events</Link>
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

const routeTree = rootRoute.addChildren([indexRoute]);

export function App() {
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
