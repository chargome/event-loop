import React from "react";
import { SignInButton } from "@clerk/clerk-react";

export function RestrictedSignIn() {
  return (
    <div className="card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl">
      <div className="card-body text-center py-16">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sentry Team Access Only
        </h2>
        <p className="text-lg text-base-content/70 mb-4 max-w-lg mx-auto leading-relaxed">
          EventLoop is exclusively for Sentry team members.
        </p>
        <p className="text-base text-base-content/60 mb-8 max-w-lg mx-auto">
          Please sign in with your <strong>@sentry.io</strong> email address to
          access team events.
        </p>

        <SignInButton>
          <button className="btn btn-lg btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-12 shadow-lg hover:shadow-xl">
            🚀 Sign In with @sentry.io
          </button>
        </SignInButton>

        <div className="mt-8 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning-content/80">
            <strong>Note:</strong> Only @sentry.io email addresses are permitted
            atm.
          </p>
        </div>
      </div>
    </div>
  );
}
