import Link from "next/link";
import EuropeMap from "@/components/EuropeMap";

const SECTIONS = [
  {
    href: "/france",
    title: "France",
    desc: "Ligue 1 et Ligue 2 : équipes, direct et classement.",
    icon: "🇫🇷",
  },
  {
    href: "/europe",
    title: "Europe",
    desc: "8 championnats européens : équipes, direct et classement.",
    icon: "🌍",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Le foot en direct
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Championnats français et européens : équipes, scores en direct et
          classement automatique, au même endroit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto w-full">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-3xl mb-3">{section.icon}</div>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{section.desc}</p>
          </Link>
        ))}
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <EuropeMap />
      </div>
    </div>
  );
}
