"use client";

import { useState } from "react";
import Image from "next/image";
import type { SofascoreTeam } from "@/lib/football";

export interface TeamsGroup {
  key: string;
  label: string;
  teams: SofascoreTeam[];
}

export default function TeamsView({ groups }: { groups: TeamsGroup[] }) {
  const [tab, setTab] = useState(groups[0]?.key);
  const teams = groups.find((g) => g.key === tab)?.teams ?? [];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {groups.map((group) => (
          <TabButton key={group.key} active={tab === group.key} onClick={() => setTab(group.key)}>
            {group.label}
          </TabButton>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-center"
          >
            <Image
              src={`/api/logo/${team.id}`}
              alt={team.name}
              width={48}
              height={48}
              unoptimized
            />
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
