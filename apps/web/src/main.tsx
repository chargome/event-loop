import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";

import { App } from "./routes/App";
import { OfficeProvider } from "./contexts/OfficeContext";
import { EnvCheck } from "./components/EnvCheck";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root")!);
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

root.render(
  <React.StrictMode>
    <EnvCheck>
      <ClerkProvider publishableKey={publishableKey ?? ""}>
        <QueryClientProvider client={queryClient}>
          <OfficeProvider>
            <App />
          </OfficeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </EnvCheck>
  </React.StrictMode>
);
