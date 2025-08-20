import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import {
  useAuth,
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
} from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { UiButton } from "../components/UiButton";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export function EventDetailPage() {
  const params = useParams({ from: "/events/$id" as any }) as { id: string };
  const id = Number(params.id);
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = React.useState<number | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!isSignedIn) throw new Error("Not authenticated");
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as {
        event: any;
        goingCount: number;
        attendees: Array<{
          id: number;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        }>;
        isCreator: boolean;
      };
    },
    enabled: isSignedIn,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to register");
      return res.json();
    },
    onMutate: () => setLoadingId(id),
    onSettled: () => setLoadingId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event", id] }),
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      window.location.href = "/events";
    },
  });

  // Comments query
  const { data: commentsData } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/comments/${id}`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return (await res.json()) as { comments: any[] };
    },
  });

  // Comment form
  const commentForm = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/comments/${id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: value.content }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      qc.invalidateQueries({ queryKey: ["comments", id] });
      commentForm.reset();
    },
  });

  if (isLoading) return <div className="text-center py-12">Loading…</div>;
  if (error || !data)
    return <div className="text-center py-12">Event not found</div>;

  const e = data.event;
  const isCreator = data.isCreator;
  const isCancelled = e.status === "cancelled";

  return (
    <>
      <SignedOut>
        <div className="mx-auto max-w-2xl">
          <div className="card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Event Details Are Private
              </h2>
              <p className="text-lg text-base-content/70 mb-8 max-w-lg mx-auto leading-relaxed">
                Sign in to view event details, see who's attending, register for
                events, and join the conversation.
              </p>

              <SignInButton>
                <button className="btn btn-lg btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none text-white font-bold px-12 shadow-lg hover:shadow-xl">
                  🚀 Sign In to Continue
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="space-y-8">
          <div className="mx-auto max-w-4xl">
            <div
              className={`card bg-gradient-to-br shadow-xl border ${
                isCancelled
                  ? "from-error/10 to-error/5 border-error/30"
                  : "from-base-100 to-base-200/50 border-base-300"
              }`}
            >
              <div className="card-body space-y-6">
                {isCancelled && (
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
                    <span>This event has been cancelled</span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <h2
                    className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                      isCancelled
                        ? "from-error to-error/70"
                        : "from-primary to-secondary"
                    }`}
                  >
                    {e.title}
                  </h2>
                  {isCreator && !isCancelled && (
                    <div className="flex items-center gap-2">
                      <Link to="/events/$id/edit" params={{ id: String(id) }}>
                        <UiButton variant="ghost" size="sm">
                          ✏️ Edit
                        </UiButton>
                      </Link>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to cancel this event? This cannot be undone."
                            )
                          ) {
                            deleteMutation.mutate();
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending
                          ? "Cancelling..."
                          : "🗑️ Cancel Event"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-base-content/70">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <span>{new Date(e.startsAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>{e.location ?? "TBD"}</span>
                  </div>
                </div>

                {e.description && (
                  <div className="card bg-base-200/50 border border-base-300">
                    <div className="card-body py-4">
                      <p className="whitespace-pre-wrap text-base-content/80">
                        {e.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-lg">
                    {data.goingCount} attendees
                    {e.capacity ? ` / ${e.capacity}` : ""}
                  </span>
                  {!e.capacity && (
                    <span className="text-sm text-base-content/60">
                      (unlimited capacity)
                    </span>
                  )}
                </div>

                {/* Attendees List */}
                {data.attendees && data.attendees.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <span>👥</span>
                      Who's going ({data.attendees.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data.attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-base-200/50 to-base-300/30 border border-base-300/50"
                        >
                          {attendee.avatar_url ? (
                            <img
                              src={attendee.avatar_url}
                              alt={attendee.name || attendee.email}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/20">
                              <span className="text-sm font-bold text-primary">
                                {(attendee.name ||
                                  attendee.email)[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {attendee.name || attendee.email}
                            </div>
                            {attendee.name && (
                              <div className="text-xs text-base-content/60 truncate">
                                {attendee.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="divider"></div>

                {/* Action Buttons */}
                <SignedOut>
                  <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                    <h3 className="font-semibold mb-2">Join the Event! 🎉</h3>
                    <p className="text-base-content/70 mb-4">
                      Sign in to register for this event
                    </p>
                    <SignInButton />
                  </div>
                </SignedOut>

                <SignedIn>
                  {!isCancelled && (
                    <div className="flex gap-3 justify-center">
                      {e.signupMode === "external" && e.externalUrl ? (
                        <a
                          href={e.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <UiButton variant="secondary" size="sm">
                            🔗 Sign up externally
                          </UiButton>
                        </a>
                      ) : (
                        <UiButton
                          size="sm"
                          variant="primary"
                          loading={
                            registerMutation.isPending && loadingId === id
                          }
                          onClick={() => registerMutation.mutate()}
                          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none"
                        >
                          {registerMutation.isPending && loadingId === id
                            ? "✨ Registering..."
                            : "🚀 Register for Event"}
                        </UiButton>
                      )}
                    </div>
                  )}
                </SignedIn>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mx-auto max-w-4xl">
              <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    💬 Comments
                    {commentsData?.comments && (
                      <span className="badge badge-primary badge-sm">
                        {commentsData?.comments.length}
                      </span>
                    )}
                  </h3>

                  {/* Comment Form */}
                  <SignedIn>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        commentForm.handleSubmit();
                      }}
                      className="mb-6"
                    >
                      <commentForm.Field
                        name="content"
                        validators={{
                          onChange: ({ value }) =>
                            !value.trim()
                              ? "Comment cannot be empty"
                              : undefined,
                        }}
                        children={(field) => (
                          <div className="form-control w-full">
                            <textarea
                              className="textarea textarea-bordered w-full min-h-[100px]"
                              placeholder="Share your thoughts about this event..."
                              value={field.state.value || ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onInput={(e) =>
                                field.handleChange(
                                  (e.target as HTMLTextAreaElement).value
                                )
                              }
                            />
                            {field.state.meta.errors[0] && (
                              <label className="label pt-1">
                                <span className="label-text-alt text-error">
                                  {field.state.meta.errors[0]}
                                </span>
                              </label>
                            )}
                          </div>
                        )}
                      />
                      <commentForm.Subscribe
                        selector={(state) => [
                          state.canSubmit,
                          state.isSubmitting,
                        ]}
                        children={([canSubmit, isSubmitting]) => (
                          <div className="flex justify-end mt-3">
                            <button
                              type="submit"
                              className="btn btn-primary btn-sm"
                              disabled={!canSubmit}
                            >
                              {isSubmitting ? "Posting..." : "💬 Post Comment"}
                            </button>
                          </div>
                        )}
                      />
                    </form>
                  </SignedIn>

                  <SignedOut>
                    <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 mb-6">
                      <p className="text-base-content/70 mb-4">
                        Sign in to join the conversation
                      </p>
                      <SignInButton />
                    </div>
                  </SignedOut>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {commentsData?.comments?.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">💭</div>
                        <p className="text-base-content/60">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      </div>
                    ) : (
                      commentsData?.comments?.map((comment: any) => (
                        <div
                          key={comment.id}
                          className="card bg-base-200/50 border border-base-300"
                        >
                          <div className="card-body p-4">
                            <div className="flex items-start gap-3">
                              {comment.avatar_url ? (
                                <img
                                  src={comment.avatar_url}
                                  alt={comment.name || comment.email}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center ring-2 ring-primary/20">
                                  <span className="text-sm font-bold text-primary">
                                    {(comment.name ||
                                      comment.email)[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-base-content">
                                    {comment.name || comment.email}
                                  </span>
                                  <span className="text-xs text-base-content/60">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-base-content/80 whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}
