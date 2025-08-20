import React from "react";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

type NewEventForm = {
  title: string;
  description: string;
  location: string;
  startsAt: string; // datetime-local value
  capacity: string; // keep as string in the form; convert on submit
};

export function NewEventPage() {
  const { getToken } = useAuth();
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startsAt: "",
      capacity: "",
    },
    onSubmit: async ({ value }) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: value.title,
          description: value.description || null,
          location: value.location || null,
          startsAt: value.startsAt
            ? new Date(value.startsAt).toISOString()
            : null,
          capacity: value.capacity === "" ? null : Number(value.capacity),
          // TODO: remove when backend derives createdBy from auth
          createdBy: 1,
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      window.location.href = "/";
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Create Event</h2>
      <div className="card border border-base-300 shadow-sm">
        <div className="card-body">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Title is required" : undefined,
              }}
              children={(field) => (
                <div className="form-control w-full">
                  <label className="label pb-1" htmlFor={field.name}>
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    className="input input-bordered w-full"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Padel Night"
                  />
                  {field.state.meta.errors[0] ? (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error">
                        {field.state.meta.errors[0]}
                      </span>
                    </label>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="description"
              children={(field) => (
                <div className="form-control w-full">
                  <label className="label pb-1" htmlFor={field.name}>
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    className="textarea textarea-bordered w-full min-h-[100px]"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="What, where, any notes…"
                  />
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.Field
                name="location"
                children={(field) => (
                  <div className="form-control w-full">
                    <label className="label pb-1" htmlFor={field.name}>
                      <span className="label-text">Location</span>
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      className="input input-bordered w-full"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Gym, courts, address…"
                    />
                  </div>
                )}
              />

              <form.Field
                name="startsAt"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Start time is required" : undefined,
                }}
                children={(field) => (
                  <div className="form-control w-full">
                    <label className="label pb-1" htmlFor={field.name}>
                      <span className="label-text">Start time</span>
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="datetime-local"
                      className="input input-bordered w-full"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors[0] ? (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors[0]}
                        </span>
                      </label>
                    ) : null}
                  </div>
                )}
              />

              <form.Field
                name="capacity"
                validators={{
                  onChange: ({ value }) =>
                    value !== "" && Number(value) < 1
                      ? "Must be at least 1"
                      : undefined,
                }}
                children={(field) => (
                  <div className="form-control w-full md:col-span-2">
                    <label className="label pb-1" htmlFor={field.name}>
                      <span className="label-text">Capacity</span>
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={1}
                      className="input input-bordered w-full"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Optional"
                    />
                    {field.state.meta.errors[0] ? (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors[0]}
                        </span>
                      </label>
                    ) : null}
                  </div>
                )}
              />
            </div>

            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    className="btn btn-primary"
                    disabled={!canSubmit}
                    type="submit"
                  >
                    {isSubmitting ? "Saving ..." : "Create Event"}
                  </button>
                  <a href="/" className="btn btn-ghost">
                    Cancel
                  </a>
                </div>
              )}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
