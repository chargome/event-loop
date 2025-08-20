import React from "react";
import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { UiButton } from "../components/UiButton";
import eventLoopImage from "../../assets/eventLoop.jpg";
import donutIcon from "../../assets/donut.png";

export function LandingPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img
              src={donutIcon}
              alt="Event Loop"
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain animate-pulse"
            />
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Event Loop
              </span>
            </h1>
          </div>

          <p className="text-2xl md:text-3xl font-medium mb-6 text-base-content/80">
            Where your team comes together
          </p>

          <p className="text-lg md:text-xl mb-12 text-base-content/60 max-w-3xl mx-auto leading-relaxed">
            Create and join after-work activities with your colleagues. From
            padel tournaments to climbing sessions, crossfit challenges to
            casual meetups – build stronger connections outside the office.
          </p>

          {/* Hero Image */}
          <div className="relative mb-12">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl mx-auto max-w-4xl">
              <img
                src={eventLoopImage}
                alt="People enjoying various team activities"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"></div>
            </div>

            {/* Enhanced Background decoration */}
            <div className="absolute -inset-8 -z-10">
              <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-r from-secondary/30 to-accent/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignedOut>
              <SignInButton>
                <button className="btn btn-lg btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-10 shadow-lg hover:shadow-xl">
                  🚀 Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UiButton
                size="lg"
                variant="primary"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-10 shadow-lg hover:shadow-xl"
              >
                <Link to="/events/new">🚀 Create an Event</Link>
              </UiButton>
            </SignedIn>

            <UiButton size="lg" variant="ghost" className="font-semibold">
              <Link to="/events">👀 Browse Events</Link>
            </UiButton>
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
              { icon: "🎾", name: "Padel" },
              { icon: "🧗", name: "Climbing" },
              { icon: "🏋️", name: "Crossfit" },
              { icon: "⚽", name: "Football" },
              { icon: "🍻", name: "Happy Hour" },
              { icon: "🎮", name: "Gaming" },
              { icon: "🏃", name: "Running" },
              { icon: "💃", name: "Dancing" },
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
