import Link from "next/link";

const CARDS = [
  {
    href: "/europe/equipes",
    title: "Équipes",
    desc: "Tous les clubs de Premier League et LaLiga avec leurs logos.",
    icon: "🛡️",
  },
  {
    href: "/europe/direct",
    title: "Direct",
    desc: "Les matchs en cours, mis à jour automatiquement.",
    icon: "🔴",
  },
  {
    href: "/europe/classement",
    title: "Classement",
    desc: "Classement automatique de Premier League et LaLiga.",
    icon: "📊",
  },
];

export default function EuropePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Premier League & LaLiga en direct
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Équipes, scores en direct et classement automatique, au même endroit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
