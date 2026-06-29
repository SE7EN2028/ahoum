import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

type Health = { status: string; service: string };

function useHealth() {
  return useQuery<Health>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/health/`);
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      return res.json();
    },
  });
}

export default function App() {
  const { data, isLoading, isError } = useHealth();

  const apiState = isLoading
    ? { label: "checking API…", color: "text-ink-muted" }
    : isError
      ? { label: "API unreachable", color: "text-clay" }
      : { label: `API ${data?.status} · ${data?.service}`, color: "text-success" };

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-16">
      <span className="mb-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-ink-muted uppercase">
        <span className="size-2.5 rounded-full bg-accent" />
        Ahoum SpiritualTech
      </span>

      <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Sessions Marketplace
      </h1>
      <p className="mt-3 max-w-prose text-lg text-ink-muted">
        Phase 0 skeleton is live. Frontend, backend, database, and reverse proxy
        are wired through one Nginx entrypoint.
      </p>

      <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
        <span className={`size-2 rounded-full ${isError ? "bg-clay" : isLoading ? "bg-ink-muted" : "bg-success"}`} />
        <span className={apiState.color}>{apiState.label}</span>
      </div>
    </main>
  );
}
