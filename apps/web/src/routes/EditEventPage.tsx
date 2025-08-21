import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOffice, type Office } from "../contexts/OfficeContext";
import { config } from "../config";

const API_URL = import.meta.env.VITE_API_URL || config.API_URL;

type EditEventForm = {
  title: string;
  description: string;
  location: string;
  office: Office;
  startsAt: string;
  capacity: string;
};

export function EditEventPage() {
  const params = useParams({ from: "/events/$id/edit" as any }) as {
    id: string;
  };
  const id = Number(params.id);
  const { getToken } = useAuth();

  // Fetch event data
  const { data, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to load event");
      return (await res.json()) as { event: any };
    },
  });

  const form = useForm({
    defaultValues: {
      title: data?.event?.title || "",
      description: data?.event?.description || "",
      location: data?.event?.location || "",
      office: (data?.event?.office as Office) || "VIE",
      startsAt: data?.event?.startsAt
        ? new Date(data.event.startsAt).toISOString().slice(0, 16)
        : "",
      capacity: data?.event?.capacity?.toString() || "",
    },
    onSubmit: async ({ value }) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
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
      if (!res.ok) throw new Error("Failed to update event");
      window.location.href = `/events/${id}`;
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (data?.event) {
      form.setFieldValue("title", data.event.title || "");
      form.setFieldValue("description", data.event.description || "");
      form.setFieldValue("location", data.event.location || "");
      form.setFieldValue("office", data.event.office || "VIE");
      form.setFieldValue(
        "startsAt",
        data.event.startsAt
          ? new Date(data.event.startsAt).toISOString().slice(0, 16)
          : ""
      );
      form.setFieldValue("capacity", data.event.capacity?.toString() || "");
    }
  }, [data]);

  if (isLoading)
    return <div className="text-center py-12">Loading event...</div>;
  if (error || !data)
    return <div className="text-center py-12">Event not found</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
        Edit Event
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
                    value={field.state.value || ""}
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
                      value={field.state.value || ""}
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
                    {isSubmitting ? "✨ Updating..." : "💾 Update Event"}
                  </button>
                  <Link to={`/events/${id}`} className="btn btn-ghost">
                    Cancel
                  </Link>
                </div>
              )}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
