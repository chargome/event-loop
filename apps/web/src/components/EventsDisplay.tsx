import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { UiButton } from "./UiButton";
import { config } from "../config";
import { useOffice } from "../contexts/OfficeContext";

const API_URL = import.meta.env.VITE_API_URL || config.API_URL;

type Event = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  office?: "VIE" | "SFO" | "YYZ" | "AMS" | "SEA";
  startsAt: string;
  capacity: number | null;
  createdBy: number;
  createdAt: string;
  signupMode?: "internal" | "external";
  externalUrl?: string | null;
  isRegistered?: boolean;
  attendees?: Array<{
    id: number;
    name: string | null;
    avatar_url: string | null;
  }>;
  goingCount?: number;
};

type ViewMode = "cards" | "calendar";
type TimeFilter = "all" | "today" | "week" | "month" | "upcoming" | "past";

interface EventsDisplayProps {
  events: Event[];
  isLoading?: boolean;
  error?: unknown;
  showTitle?: boolean;
}

export function EventsDisplay({
  events,
  isLoading = false,
  error = null,
  showTitle = true,
}: EventsDisplayProps) {
  const { getToken } = useAuth();
  const { selectedOffice } = useOffice();
  const qc = useQueryClient();
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>("cards");
  const [timeFilter, setTimeFilter] = React.useState<TimeFilter>("all");

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to register");
      return res.json();
    },
    onMutate: (id) => {
      setActiveId(id);
    },
    onSuccess: () => {
      // Invalidate specific office query and all events queries
      qc.invalidateQueries({ queryKey: ["events", selectedOffice] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event"] });
      // Force refetch of current office query
      qc.refetchQueries({ queryKey: ["events", selectedOffice] });
    },
    onError: (error, id) => {
      console.error("Registration failed:", error);
    },
    onSettled: () => setActiveId(null),
  });

  const deregisterMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to deregister");
      return res.json();
    },
    onMutate: (id) => {
      setActiveId(id);
    },
    onSuccess: () => {
      // Invalidate specific office query and all events queries
      qc.invalidateQueries({ queryKey: ["events", selectedOffice] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event"] });
      // Force refetch of current office query
      qc.refetchQueries({ queryKey: ["events", selectedOffice] });
    },
    onError: (error, id) => {
      console.error("Deregistration failed:", error);
    },
    onSettled: () => setActiveId(null),
  });

  // Time filtering logic
  const filterEventsByTime = (events: Event[], filter: TimeFilter): Event[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return events.filter((event) => {
      const eventDate = new Date(event.startsAt);

      switch (filter) {
        case "today":
          return eventDate.toDateString() === today.toDateString();
        case "week":
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          return eventDate >= weekStart && eventDate < weekEnd;
        case "month":
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return eventDate >= monthStart && eventDate < monthEnd;
        case "upcoming":
          return eventDate >= now;
        case "past":
          return eventDate < now;
        default:
          return true;
      }
    });
  };

  const filteredEvents = filterEventsByTime(events, timeFilter);
  const upcomingEvents = events.filter(
    (e) => new Date(e.startsAt) >= new Date()
  );
  const pastEvents = events.filter((e) => new Date(e.startsAt) < new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
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
        <span>Failed to load events</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="card bg-base-100/50 backdrop-blur-sm border border-base-300/50 shadow-sm mb-6">
        <div className="card-body py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {showTitle && (
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-base-content">
                  Events
                </h2>
                <div className="badge badge-primary badge-sm">
                  {filteredEvents.length}
                </div>
              </div>
            )}

            {/* View Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Time Filter */}
              <div className="flex flex-wrap gap-1">
                {(
                  ["all", "today", "week", "upcoming", "past"] as TimeFilter[]
                ).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`btn btn-xs ${
                      timeFilter === filter
                        ? "btn-primary"
                        : "btn-ghost hover:btn-primary/20"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* View Mode */}
              <div className="join">
                {(["cards", "calendar"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`join-item btn btn-sm ${
                      viewMode === mode
                        ? "btn-primary"
                        : "btn-ghost hover:btn-primary/20"
                    }`}
                  >
                    {mode === "cards" && "🎯"}
                    {mode === "calendar" && "🗓️"}
                    <span className="ml-1 capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SignedOut>
        <div className="card bg-gradient-to-br from-base-200 to-base-300 shadow-lg">
          <div className="card-body text-center">
            <h3 className="card-title justify-center">Join the Action! 🚀</h3>
            <p className="text-base-content/70">
              Sign in to view and register for events
            </p>
            <SignInButton />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {viewMode === "cards" && (
          <CardsView
            events={filteredEvents}
            upcomingEvents={upcomingEvents}
            pastEvents={pastEvents}
            timeFilter={timeFilter}
            activeId={activeId}
            registerMutation={registerMutation}
            deregisterMutation={deregisterMutation}
          />
        )}

        {viewMode === "calendar" && (
          <CalendarView
            events={filteredEvents}
            activeId={activeId}
            registerMutation={registerMutation}
            deregisterMutation={deregisterMutation}
          />
        )}
      </SignedIn>
    </div>
  );
}

// Cards View Component
function CardsView({
  events,
  upcomingEvents,
  pastEvents,
  timeFilter,
  activeId,
  registerMutation,
  deregisterMutation,
}: {
  events: Event[];
  upcomingEvents: Event[];
  pastEvents: Event[];
  timeFilter: TimeFilter;
  activeId: number | null;
  registerMutation: any;
  deregisterMutation: any;
}) {
  if (timeFilter === "all") {
    const showSectionBadges =
      upcomingEvents.length > 0 && pastEvents.length > 0;

    return (
      <div className="space-y-8">
        {upcomingEvents.length > 0 && (
          <div>
            {showSectionBadges && (
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="badge badge-success badge-sm">Upcoming</span>
                <span className="badge badge-ghost badge-sm">
                  {upcomingEvents.length}
                </span>
              </h3>
            )}
            <EventsGrid
              events={upcomingEvents}
              activeId={activeId}
              registerMutation={registerMutation}
              deregisterMutation={deregisterMutation}
            />
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            {showSectionBadges && (
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="badge badge-neutral badge-sm">Past</span>
                <span className="badge badge-ghost badge-sm">
                  {pastEvents.length}
                </span>
              </h3>
            )}
            <EventsGrid
              events={pastEvents}
              activeId={activeId}
              registerMutation={registerMutation}
              deregisterMutation={deregisterMutation}
            />
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-medium mb-2">No events yet</h3>
            <p className="text-base-content/70">
              Be the first to create an event!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <EventsGrid
      events={events}
      activeId={activeId}
      registerMutation={registerMutation}
      deregisterMutation={deregisterMutation}
    />
  );
}

// Calendar View Component
function CalendarView({
  events,
  activeId,
  registerMutation,
  deregisterMutation,
}: {
  events: Event[];
  activeId: number | null;
  registerMutation: any;
  deregisterMutation: any;
}) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // Generate calendar days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dayDate = new Date(currentYear, currentMonth, day);
    return events.filter((event) => {
      const eventDate = new Date(event.startsAt);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const selectedDate = selectedDay
    ? new Date(currentYear, currentMonth, selectedDay)
    : null;

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title justify-center text-2xl mb-6">
            {firstDay.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-medium text-base-content/60 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === now.getDate() &&
                currentMonth === now.getMonth() &&
                currentYear === now.getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 rounded-lg border ${
                    day
                      ? isToday
                        ? "bg-primary/10 border-primary"
                        : dayEvents.length > 0
                        ? "bg-success/10 border-success/30 hover:bg-success/20 cursor-pointer"
                        : "bg-base-200/50 border-base-300 hover:bg-base-200"
                      : "border-transparent"
                  } transition-all duration-200`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium ${
                          isToday ? "text-primary" : "text-base-content"
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const eventTime = new Date(
                            event.startsAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          return (
                            <Link
                              key={event.id}
                              to="/events/$id"
                              params={{ id: String(event.id) }}
                              className="block text-xs p-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                              title={`${event.title} at ${eventTime}`}
                            >
                              <div className="truncate font-medium">
                                {event.title}
                              </div>
                              <div className="text-xs opacity-80">
                                {eventTime}
                              </div>
                            </Link>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <button
                            className="text-xs text-base-content/60 hover:text-primary transition-colors cursor-pointer w-full text-left p-1 rounded hover:bg-primary/10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedDay(day);
                            }}
                          >
                            +{dayEvents.length - 2} more
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-2xl border border-base-300 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setSelectedDay(null)}
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto">
                <div className="space-y-3">
                  {selectedDayEvents.map((event: Event) => {
                    const isRegistered = event.isRegistered;
                    return (
                      <div
                        key={event.id}
                        className="card bg-base-200/50 border border-base-300"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">
                              <Link
                                to="/events/$id"
                                params={{ id: String(event.id) }}
                                className="hover:text-primary transition-colors"
                                onClick={() => setSelectedDay(null)}
                              >
                                {event.title}
                              </Link>
                            </h4>
                            <span className="text-sm text-base-content/60">
                              {new Date(event.startsAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {event.location && (
                            <div className="text-sm text-base-content/70 mb-2">
                              📍 {event.location}
                            </div>
                          )}

                          {event.description && (
                            <p className="text-sm text-base-content/60 mb-3">
                              {event.description.length > 100
                                ? `${event.description.slice(0, 100)}...`
                                : event.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                {event.attendees
                                  .slice(0, 3)
                                  .map((attendee: any) => (
                                    <div key={attendee.id}>
                                      {attendee.avatar_url ? (
                                        <img
                                          src={attendee.avatar_url}
                                          alt={attendee.name || "Attendee"}
                                          className="w-6 h-6 rounded-full ring-2 ring-base-100 object-cover"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 ring-2 ring-base-100 flex items-center justify-center">
                                          <span className="text-xs font-bold text-primary">
                                            {(attendee.name ||
                                              "A")[0].toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                {(event.goingCount || 0) > 3 && (
                                  <span className="text-xs text-base-content/60 ml-1">
                                    +{(event.goingCount || 0) - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {event.signupMode === "external" &&
                            event.externalUrl ? (
                              <a
                                href={event.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                              >
                                External
                              </a>
                            ) : event.isRegistered ? (
                              <div className="flex items-center gap-1 text-success text-sm">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.06l-3.5-3.75a.75.75 0 111.096-1.024l2.91 3.121 6.96-8.819a.75.75 0 011.018-.14z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Registered
                              </div>
                            ) : isRegistered ? (
                              <button
                                className="btn btn-secondary btn-sm bg-gradient-to-r from-warning to-error hover:from-warning/90 hover:to-error/90 border-none text-white"
                                disabled={
                                  activeId === event.id &&
                                  deregisterMutation.isPending
                                }
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      "Are you sure you want to unregister from this event?"
                                    )
                                  ) {
                                    deregisterMutation.mutate(event.id);
                                  }
                                }}
                              >
                                {activeId === event.id &&
                                deregisterMutation.isPending
                                  ? "Unregistering..."
                                  : "❌ Unregister"}
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={
                                  activeId === event.id &&
                                  registerMutation.isPending
                                }
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  registerMutation.mutate(event.id);
                                }}
                              >
                                {activeId === event.id &&
                                registerMutation.isPending
                                  ? "Registering..."
                                  : "Register"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Events Grid Component
function EventsGrid({
  events,
  activeId,
  registerMutation,
  deregisterMutation,
}: {
  events: Event[];
  activeId: number | null;
  registerMutation: any;
  deregisterMutation: any;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-medium mb-2">No events found</h3>
        <p className="text-base-content/70">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          activeId={activeId}
          registerMutation={registerMutation}
          deregisterMutation={deregisterMutation}
        />
      ))}
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  activeId,
  registerMutation,
  deregisterMutation,
}: {
  event: Event;
  activeId: number | null;
  registerMutation: any;
  deregisterMutation: any;
}) {
  const eventDate = new Date(event.startsAt);
  const isPast = eventDate < new Date();
  const isRegistered = event.isRegistered;
  const attendees = event.attendees || [];
  const goingCount = event.goingCount || 0;

  return (
    <Link
      to="/events/$id"
      params={{ id: String(event.id) }}
      className="block group"
    >
      <div
        className={`card bg-gradient-to-br ${
          isPast
            ? "from-base-200/50 to-base-300/30"
            : "from-base-100 to-base-200/50"
        } shadow-lg border border-base-300/50 transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:border-primary/20 ${
          !isPast ? "group-hover:from-primary/5 group-hover:to-secondary/5" : ""
        } cursor-pointer h-full`}
      >
        <div className="card-body p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <h3 className="card-title text-lg leading-tight group-hover:text-primary transition-colors duration-300">
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              {event.office && (
                <span className="badge badge-primary badge-sm">
                  {event.office}
                </span>
              )}
              {isPast && (
                <span className="badge badge-neutral badge-sm">Past</span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-base-content/70 mb-4">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{eventDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🕒</span>
              <span>
                {eventDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-4">
              <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                {event.description.length > 120
                  ? `${event.description.slice(0, 120)}...`
                  : event.description}
              </p>
            </div>
          )}

          {/* Attendees Section */}
          {attendees.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-base-content/60">
                  {goingCount} going
                  {event.capacity ? ` / ${event.capacity}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {attendees.slice(0, 4).map((attendee, index) => (
                  <div
                    key={attendee.id}
                    className="relative group/avatar"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {attendee.avatar_url ? (
                      <img
                        src={attendee.avatar_url}
                        alt={attendee.name || "Attendee"}
                        className="w-6 h-6 rounded-full ring-2 ring-base-100 object-cover group-hover:ring-primary/30 group-hover:scale-110 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 ring-2 ring-base-100 flex items-center justify-center group-hover:ring-primary/30 group-hover:scale-110 transition-all duration-300">
                        <span className="text-xs font-bold text-primary">
                          {(attendee.name || "A")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-base-300 text-base-content text-xs rounded px-2 py-1 opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {attendee.name || "Anonymous"}
                    </div>
                  </div>
                ))}
                {goingCount > 4 && (
                  <div className="w-6 h-6 rounded-full bg-base-300 ring-2 ring-base-100 flex items-center justify-center group-hover:ring-primary/30 group-hover:scale-110 transition-all duration-300">
                    <span className="text-xs font-bold text-base-content/70">
                      +{goingCount - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card-actions justify-end mt-auto">
            {event.signupMode === "external" && event.externalUrl ? (
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <UiButton variant="secondary" size="sm">
                  External Signup
                </UiButton>
              </a>
            ) : isRegistered ? (
              <div className="flex items-center gap-1 text-success text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.06l-3.5-3.75a.75.75 0 111.096-1.024l2.91 3.121 6.96-8.819a.75.75 0 011.018-.14z"
                    clipRule="evenodd"
                  />
                </svg>
                Registered
              </div>
            ) : !isPast ? (
              isRegistered ? (
                <UiButton
                  size="sm"
                  variant="secondary"
                  loading={
                    activeId === event.id && deregisterMutation.isPending
                  }
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      confirm(
                        "Are you sure you want to unregister from this event?"
                      )
                    ) {
                      deregisterMutation.mutate(event.id);
                    }
                  }}
                  className="bg-gradient-to-r from-warning to-error hover:from-warning/90 hover:to-error/90 border-none text-white"
                >
                  {activeId === event.id && deregisterMutation.isPending
                    ? "Unregistering..."
                    : "❌ Unregister"}
                </UiButton>
              ) : (
                <UiButton
                  size="sm"
                  variant="primary"
                  loading={activeId === event.id && registerMutation.isPending}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    registerMutation.mutate(event.id);
                  }}
                >
                  Register
                </UiButton>
              )
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
