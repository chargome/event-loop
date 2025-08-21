import { useEffect, useState } from "react";

const REQUIRED_ENV_VARS = {
  VITE_CLERK_PUBLISHABLE_KEY: "Clerk publishable key for authentication",
  VITE_API_URL: "API URL for backend connection",
};

interface EnvIssue {
  key: string;
  description: string;
  value?: string;
}

export function EnvCheck({ children }: { children: React.ReactNode }) {
  const [envIssues, setEnvIssues] = useState<EnvIssue[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const issues: EnvIssue[] = [];

    Object.entries(REQUIRED_ENV_VARS).forEach(([key, description]) => {
      const value = import.meta.env[key];
      if (!value || value.trim() === "") {
        issues.push({ key, description, value });
      }
    });

    setEnvIssues(issues);
    setIsChecking(false);

    // Log env status for debugging
    console.log("Environment variables check:", {
      buildTimeCheck: (globalThis as any).__BUILD_TIME_ENV_CHECK__,
      runtimeEnvVars: import.meta.env,
      viteVars: Object.keys(import.meta.env).filter((k) =>
        k.startsWith("VITE_")
      ),
      issues: issues.length,
      missing: issues.map((i) => i.key),
    });
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (envIssues.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-8">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error text-2xl">
              ⚙️ Configuration Required
            </h2>

            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Missing required environment variables</span>
            </div>

            <p className="text-base-content/70">
              The following environment variables need to be set for the app to
              work:
            </p>

            <div className="space-y-4">
              {envIssues.map(({ key, description }) => (
                <div
                  key={key}
                  className="border border-base-300 rounded-lg p-4"
                >
                  <div className="font-mono text-error font-semibold">
                    {key}
                  </div>
                  <div className="text-sm text-base-content/70">
                    {description}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider"></div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                🔧 How to Fix (Cloudflare Pages)
              </h3>

              <div className="steps steps-vertical">
                <div className="step step-primary">
                  <div className="text-left">
                    <div className="font-semibold">
                      Go to Cloudflare Dashboard
                    </div>
                    <div className="text-sm opacity-70">
                      Navigate to Pages → Your Site
                    </div>
                  </div>
                </div>

                <div className="step step-primary">
                  <div className="text-left">
                    <div className="font-semibold">
                      Add Environment Variables
                    </div>
                    <div className="text-sm opacity-70">
                      Settings → Environment Variables
                    </div>
                  </div>
                </div>

                <div className="step step-primary">
                  <div className="text-left">
                    <div className="font-semibold">Set for Production</div>
                    <div className="text-sm opacity-70">
                      Add each missing variable above
                    </div>
                  </div>
                </div>

                <div className="step step-primary">
                  <div className="text-left">
                    <div className="font-semibold">Redeploy</div>
                    <div className="text-sm opacity-70">
                      Trigger a new deployment
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <div className="font-semibold">Expected Values:</div>
                  <div className="text-sm font-mono">
                    VITE_CLERK_PUBLISHABLE_KEY: pk_test_...
                    <br />
                    VITE_API_URL: https://event-loop-api.*.workers.dev
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
