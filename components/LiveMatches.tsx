"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Fixture } from "@/lib/football";

const POLL_INTERVAL_MS = 45_000;

export default function LiveMatches({
  apiPath = "/api/live",
  emptyMessage = "Aucun match en direct actuellement en Ligue 1 ou Ligue 2.",
}: {
  apiPath?: string;
  emptyMessage?: string;
}) {
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(apiPath);
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setError(null);
          setFixtures(data.fixtures);
          setLastUpdated(new Date());
        }
      } catch {
        if (!cancelled) setError("Connexion impossible");
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [apiPath]);

  if (error) {
    return <div className="text-center text-zinc-500 py-16">{error}</div>;
  }

  if (fixtures === null) {
    return <div className="text-center text-zinc-500 py-16">Chargement…</div>;
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-16">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {lastUpdated && (
        <p className="text-xs text-zinc-400 mb-4">
          Dernière mise à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {fixtures.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4"
          >
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
              <span>{f.tournamentName}</span>
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                {f.status.description}
              </span>
            </div>
            <TeamRow team={f.homeTeam} goals={f.homeScore} />
            <TeamRow team={f.awayTeam} goals={f.awayScore} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamRow({
  team,
  goals,
}: {
  team: { id: number; name: string };
  goals: number | null;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Image src={`/api/logo/${team.id}`} alt={team.name} width={22} height={22} unoptimized />
        <span className="text-sm font-medium">{team.name}</span>
      </div>
      <span className="text-sm font-bold">{goals ?? "-"}</span>
    </div>
  );
}
