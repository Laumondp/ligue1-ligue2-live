"use client";

import { useState } from "react";
import Image from "next/image";
import type { StandingRow } from "@/lib/football";

export default function StandingsView({
  ligue1,
  ligue2,
}: {
  ligue1: StandingRow[];
  ligue2: StandingRow[];
}) {
  const [tab, setTab] = useState<"ligue1" | "ligue2">("ligue1");
  const rows = tab === "ligue1" ? ligue1 : ligue2;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "ligue1"} onClick={() => setTab("ligue1")}>
          Ligue 1
        </TabButton>
        <TabButton active={tab === "ligue2"} onClick={() => setTab("ligue2")}>
          Ligue 2
        </TabButton>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Équipe</th>
              <th className="px-2 py-2">J</th>
              <th className="px-2 py-2">G</th>
              <th className="px-2 py-2">N</th>
              <th className="px-2 py-2">P</th>
              <th className="px-2 py-2">BP</th>
              <th className="px-2 py-2">BC</th>
              <th className="px-2 py-2">Diff</th>
              <th className="px-2 py-2 font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.team.id}
                className="border-t border-black/5 dark:border-white/5"
              >
                <td className="px-3 py-2 font-medium">{row.rank}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {row.team.logo && (
                      <Image
                        src={row.team.logo}
                        alt={row.team.name}
                        width={20}
                        height={20}
                        unoptimized
                      />
                    )}
                    <span className="whitespace-nowrap">{row.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center">{row.all.played}</td>
                <td className="px-2 py-2 text-center">{row.all.win}</td>
                <td className="px-2 py-2 text-center">{row.all.draw}</td>
                <td className="px-2 py-2 text-center">{row.all.lose}</td>
                <td className="px-2 py-2 text-center">{row.all.goals.for}</td>
                <td className="px-2 py-2 text-center">{row.all.goals.against}</td>
                <td className="px-2 py-2 text-center">{row.goalsDiff}</td>
                <td className="px-2 py-2 text-center font-semibold">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}
