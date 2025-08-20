import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";

import { App } from "./routes/App";
import { OfficeProvider } from "./contexts/OfficeContext";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root")!);
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;
if (!publishableKey) {
  console.warn(
    "VITE_CLERK_PUBLISHABLE_KEY is not set. Auth UI will not function."
  );
}

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey ?? ""}>
      <QueryClientProvider client={queryClient}>
        <OfficeProvider>
          <App />
        </OfficeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
