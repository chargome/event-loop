import React from "react";
import { useClerk } from "@clerk/clerk-react";

export function AccessDenied() {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-gradient-to-br from-error/10 via-warning/10 to-error/10 border-2 border-error/30 shadow-2xl max-w-2xl">
        <div className="card-body text-center py-16">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-error to-warning bg-clip-text text-transparent">
            Access Restricted
          </h2>
          <p className="text-lg text-base-content/70 mb-4 max-w-lg mx-auto leading-relaxed">
            Sorry, EventLoop is exclusively for Sentry team members.
          </p>
          <p className="text-base text-base-content/60 mb-8 max-w-lg mx-auto">
            Only <strong>@sentry.io</strong> email addresses are permitted to
            access this application.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="btn btn-lg btn-error bg-gradient-to-r from-error to-warning hover:from-error/90 hover:to-warning/90 border-none text-white font-bold px-12 shadow-lg hover:shadow-xl"
            >
              🔓 Sign Out & Try Different Account
            </button>
          </div>

          <div className="mt-8 p-4 bg-info/10 border border-info/30 rounded-lg">
            <p className="text-sm text-info-content/80">
              <strong>Sentry Team Member?</strong> Make sure you're signing in
              with your @sentry.io email address. If you're still having issues,
              please contact IT support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
