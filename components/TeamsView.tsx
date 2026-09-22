"use client";

import { useState } from "react";
import Image from "next/image";
import type { Team } from "@/lib/football";

export default function TeamsView({
  ligue1,
  ligue2,
}: {
  ligue1: Team[];
  ligue2: Team[];
}) {
  const [tab, setTab] = useState<"ligue1" | "ligue2">("ligue1");
  const teams = tab === "ligue1" ? ligue1 : ligue2;

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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {teams.map(({ team }) => (
          <div
            key={team.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-center"
          >
            {team.logo && (
              <Image
                src={team.logo}
                alt={team.name}
                width={48}
                height={48}
                unoptimized
              />
            )}
            <span className="text-sm font-medium">{team.name}</span>
          </div>
        ))}
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
