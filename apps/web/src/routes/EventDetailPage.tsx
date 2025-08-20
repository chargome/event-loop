import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { UiButton } from "../components/UiButton";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export function EventDetailPage() {
  const params = useParams({ from: "/events/$id" as any }) as { id: string };
  const id = Number(params.id);
  const { getToken } = useAuth();
  const { user } = useClerkAuth();
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = React.useState<number | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
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

  if (isLoading) return <p>Loading…</p>;
  if (error || !data) return <p>Not found</p>;
  const e = data.event;
  const isCreator = data.isCreator;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300">
        <div className="card-body space-y-6">
          <div className="flex items-start justify-between">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {e.title}
            </h2>
            {isCreator && (
              <div className="flex items-center gap-2">
                <UiButton asChild variant="ghost" size="sm">
                  <Link to="/events/$id/edit" params={{ id: String(id) }}>
                    ✏️ Edit
                  </Link>
                </UiButton>
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
                          {(attendee.name || attendee.email)[0].toUpperCase()}
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
            <div className="flex gap-3 justify-center">
              {e.signupMode === "external" && e.externalUrl ? (
                <UiButton asChild variant="secondary" size="sm">
                  <a href={e.externalUrl} target="_blank" rel="noreferrer">
                    🔗 Sign up externally
                  </a>
                </UiButton>
              ) : (
                <UiButton
                  size="sm"
                  variant="primary"
                  loading={registerMutation.isPending && loadingId === id}
                  onClick={() => registerMutation.mutate()}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none"
                >
                  {registerMutation.isPending && loadingId === id
                    ? "✨ Registering..."
                    : "🚀 Register for Event"}
                </UiButton>
              )}
            </div>
          </SignedIn>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mx-auto max-w-4xl mt-8">
        <div className="card bg-gradient-to-br from-base-100 to-base-200/50 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              💬 Comments
              {commentsData?.comments && (
                <span className="badge badge-primary badge-sm">
                  {commentsData.comments.length}
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
                      !value.trim() ? "Comment cannot be empty" : undefined,
                  }}
                  children={(field) => (
                    <div className="form-control w-full">
                      <textarea
                        className="textarea textarea-bordered w-full min-h-[100px]"
                        placeholder="Share your thoughts about this event..."
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
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
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
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
                              {(comment.name || comment.email)[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-base-content">
                              {comment.name || comment.email}
                            </span>
                            <span className="text-xs text-base-content/60">
                              {new Date(comment.created_at).toLocaleString()}
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
  );
}
