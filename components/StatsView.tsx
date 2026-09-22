"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { TeamRecord, LeagueComparison, TopScorer } from "@/lib/football";

const POLL_INTERVAL_MS = 60_000;

interface StatsPayload {
  comparison: LeagueComparison;
  topScorers: TopScorer[];
}

interface Board {
  key: keyof LeagueComparison;
  title: string;
  icon: string;
  metric: (stat: TeamRecord) => string;
}

const SECTIONS: { title: string; boards: Board[] }[] = [
  {
    title: "Buts",
    boards: [
      {
        key: "bestAttackTotal",
        title: "Plus de buts marqués",
        icon: "⚽",
        metric: (s) => `${s.scoresFor} buts`,
      },
      {
        key: "bestAttackPerMatch",
        title: "Buts marqués par match",
        icon: "🎯",
        metric: (s) => `${s.scoresForPerMatch.toFixed(2)} buts/match`,
      },
      {
        key: "bestDefensePerMatch",
        title: "Meilleures défenses",
        icon: "🛡️",
        metric: (s) => `${s.scoresAgainstPerMatch.toFixed(2)} encaissés/match`,
      },
      {
        key: "bestGoalDiff",
        title: "Meilleure différence de buts",
        icon: "📈",
        metric: (s) => `${s.goalDiffPerMatch >= 0 ? "+" : ""}${s.goalDiffPerMatch.toFixed(2)}/match`,
      },
    ],
  },
  {
    title: "Résultats",
    boards: [
      {
        key: "mostWins",
        title: "Plus de victoires",
        icon: "🏆",
        metric: (s) => `${s.wins} victoires`,
      },
      {
        key: "mostDraws",
        title: "Plus de matchs nuls",
        icon: "🤝",
        metric: (s) => `${s.draws} nuls`,
      },
      {
        key: "mostLosses",
        title: "Plus de défaites",
        icon: "📉",
        metric: (s) => `${s.losses} défaites`,
      },
      {
        key: "bestForm",
        title: "Meilleur rendement",
        icon: "🔥",
        metric: (s) => `${s.pointsPerMatch.toFixed(2)} pts/match`,
      },
    ],
  },
  {
    title: "Domicile / Extérieur",
    boards: [
      {
        key: "bestHome",
        title: "Meilleur bilan à domicile",
        icon: "🏠",
        metric: (s) => `${s.pointsPerMatch.toFixed(2)} pts/match (${s.wins}V ${s.draws}N ${s.losses}D)`,
      },
      {
        key: "bestAway",
        title: "Meilleur bilan à l'extérieur",
        icon: "🚌",
        metric: (s) => `${s.pointsPerMatch.toFixed(2)} pts/match (${s.wins}V ${s.draws}N ${s.losses}D)`,
      },
    ],
  },
];

export default function StatsView() {
  const [payload, setPayload] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setError(null);
          setPayload(data);
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
  }, []);

  if (error) {
    return <div className="text-center text-zinc-500 py-16">{error}</div>;
  }

  if (payload === null) {
    return <div className="text-center text-zinc-500 py-16">Chargement…</div>;
  }

  const { comparison, topScorers } = payload;

  return (
    <div className="flex flex-col gap-8">
      {lastUpdated && (
        <p className="text-xs text-zinc-400 -mb-4">
          Dernière mise à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
        </p>
      )}
      <div>
        <h2 className="text-lg font-semibold mb-3">Buteurs</h2>
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <h3 className="font-medium mb-1 text-sm text-zinc-600 dark:text-zinc-300">
            👟 Meilleurs buteurs (tous championnats)
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            Total de buts marqués cette saison ; le ratio buts/match donne une idée
            de la régularité (la forme sur les derniers matchs n&rsquo;est pas
            disponible avec cette source de données).
          </p>
          <ol className="flex flex-col gap-2">
            {topScorers.map((scorer, i) => (
              <li key={scorer.player.id} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-zinc-400 text-right">{i + 1}</span>
                <Image
                  src={`/api/logo/${scorer.team.id}`}
                  alt={scorer.team.name}
                  width={18}
                  height={18}
                  unoptimized
                />
                <span className="flex-1 truncate">
                  {scorer.player.name}
                  <span className="text-zinc-400 text-xs ml-1">
                    ({scorer.team.name} · {scorer.leagueLabel})
                  </span>
                </span>
                <span className="font-medium whitespace-nowrap">
                  {scorer.goals} buts ({scorer.goalsPerMatch.toFixed(2)}/match)
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.boards.map((board) => (
              <div
                key={board.key}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4"
              >
                <h3 className="font-medium mb-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {board.icon} {board.title}
                </h3>
                <ol className="flex flex-col gap-2">
                  {comparison[board.key].map((stat, i) => (
                    <li key={stat.team.id} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-zinc-400 text-right">{i + 1}</span>
                      <Image
                        src={`/api/logo/${stat.team.id}`}
                        alt={stat.team.name}
                        width={18}
                        height={18}
                        unoptimized
                      />
                      <span className="flex-1 truncate">
                        {stat.team.name}
                        <span className="text-zinc-400 text-xs ml-1">({stat.leagueLabel})</span>
                      </span>
                      <span className="font-medium whitespace-nowrap">{board.metric(stat)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
