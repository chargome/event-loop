import React from "react";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@clerk/clerk-react";
import { useOffice, type Office } from "../contexts/OfficeContext";
import { config } from "../config";

const API_URL = import.meta.env.VITE_API_URL || config.API_URL;

type NewEventForm = {
  title: string;
  description: string;
  location: string;
  office: Office;
  startsAt: string; // datetime-local value
  capacity: string; // keep as string in the form; convert on submit
};

export function NewEventPage() {
  const { getToken } = useAuth();
  const { selectedOffice } = useOffice();
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      office: selectedOffice,
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
          office: value.office,
          startsAt: value.startsAt
            ? new Date(value.startsAt).toISOString()
            : null,
          capacity: value.capacity === "" ? null : Number(value.capacity),
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const result = await res.json();
      window.location.href = `/events/${result.event.id}`;
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
        Create New Event
      </h2>
      <div className="card bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300 shadow-xl">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                name="office"
                children={(field) => (
                  <div className="form-control w-full">
                    <label className="label pb-1" htmlFor={field.name}>
                      <span className="label-text">Office</span>
                    </label>
                    <select
                      id={field.name}
                      name={field.name}
                      className="select select-bordered w-full"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value as Office)
                      }
                    >
                      <option value="VIE">🇦🇹 Vienna</option>
                      <option value="SFO">🇺🇸 San Francisco</option>
                      <option value="YYZ">🇨🇦 Toronto</option>
                      <option value="AMS">🇳🇱 Amsterdam</option>
                      <option value="SEA">🇺🇸 Seattle</option>
                    </select>
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
                  <div className="form-control w-full md:col-span-3">
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
                    className="btn btn-primary bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-none"
                    disabled={!canSubmit}
                    type="submit"
                  >
                    {isSubmitting ? "✨ Creating..." : "🚀 Create Event"}
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
