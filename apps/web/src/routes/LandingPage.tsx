import React from "react";
import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { UiButton } from "../components/UiButton";

export function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Main Hero */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-xl"></div>
              <div className="absolute top-40 right-40 w-24 h-24 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-lg"></div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Event Loop
              </span>
            </h1>

            <p className="text-2xl md:text-3xl font-medium mb-6 text-base-content/80">
              Where your team comes together
            </p>

            <p className="text-lg md:text-xl mb-12 text-base-content/60 max-w-3xl mx-auto leading-relaxed">
              Create and join after-work activities with your colleagues. From
              padel tournaments to climbing sessions, crossfit challenges to
              casual meetups – build stronger connections outside the office.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <SignedOut>
                <SignInButton>
                  <button className="btn btn-lg btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-8">
                    🚀 Get Started
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UiButton
                  asChild
                  size="lg"
                  variant="primary"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-8"
                >
                  <Link to="/events">🎯 View Events</Link>
                </UiButton>
              </SignedIn>

              <UiButton
                asChild
                size="lg"
                variant="ghost"
                className="font-semibold"
              >
                <Link to="/events">👀 Browse Events</Link>
              </UiButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why teams love Event Loop
          </h2>
          <p className="text-center text-base-content/60 mb-12 text-lg">
            Everything you need to organize amazing team activities
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300/50">
              <div className="card-body text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="card-title justify-center text-xl mb-3">
                  Easy Event Creation
                </h3>
                <p className="text-base-content/70">
                  Create events in seconds. Set capacity, location, and let
                  people know what's happening.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300/50">
              <div className="card-body text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="card-title justify-center text-xl mb-3">
                  Smart Registrations
                </h3>
                <p className="text-base-content/70">
                  Automatic capacity management, waitlists, and real-time
                  attendee tracking.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300/50">
              <div className="card-body text-center">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="card-title justify-center text-xl mb-3">
                  Multiple Views
                </h3>
                <p className="text-base-content/70">
                  Timeline, list, or calendar view. Filter by date and see
                  exactly what's coming up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Examples */}
      <section className="px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8 text-base-content">
            Perfect for any activity
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: "🏓", name: "Padel" },
              { icon: "🧗", name: "Climbing" },
              { icon: "🏋️", name: "Crossfit" },
              { icon: "⚽", name: "Football" },
              { icon: "🍻", name: "Happy Hour" },
              { icon: "🎮", name: "Gaming" },
              { icon: "🏃", name: "Running" },
              { icon: "🎪", name: "Team Building" },
            ].map((activity) => (
              <div
                key={activity.name}
                className="badge badge-lg bg-gradient-to-r from-primary/20 to-secondary/20 text-base-content/80 border-base-300 px-4 py-3"
              >
                <span className="mr-2">{activity.icon}</span>
                {activity.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl">
            <div className="card-body py-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ready to bring your team together?
              </h2>
              <p className="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
                Join colleagues who are already using Event Loop to create
                stronger, more connected teams.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignedOut>
                  <SignInButton>
                    <button className="btn btn-lg btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-10">
                      ✨ Start Now - It's Free
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UiButton
                    asChild
                    size="lg"
                    variant="primary"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-10"
                  >
                    <Link to="/events/new">✨ Create Your First Event</Link>
                  </UiButton>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
