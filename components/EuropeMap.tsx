"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRIES: Record<string, { label: string; href: string }> = {
  France: { label: "Ligue 1 · Ligue 2", href: "/france" },
  "United Kingdom": { label: "Premier League", href: "/europe" },
  Spain: { label: "LaLiga", href: "/europe" },
  Italy: { label: "Serie A", href: "/europe" },
  Germany: { label: "Bundesliga", href: "/europe" },
  Netherlands: { label: "Eredivisie", href: "/europe" },
  Portugal: { label: "Liga Portugal", href: "/europe" },
  Belgium: { label: "Pro League", href: "/europe" },
  Switzerland: { label: "Swiss Super League", href: "/europe" },
};

export default function EuropeMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 750, center: [15, 52] }}
        width={800}
        height={520}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties?.name as string;
              const active = COUNTRIES[name];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => active && setHovered(name)}
                  onMouseLeave={() => active && setHovered(null)}
                  onClick={() => active && router.push(active.href)}
                  className={`stroke-white dark:stroke-zinc-950 outline-none transition-colors ${
                    active
                      ? "fill-emerald-500 dark:fill-emerald-600 hover:fill-emerald-600 dark:hover:fill-emerald-500 cursor-pointer"
                      : "fill-zinc-200 dark:fill-zinc-800"
                  }`}
                  style={{ strokeWidth: 0.5 }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {hovered && COUNTRIES[hovered] && (
        <div className="absolute top-4 left-4 rounded-lg bg-black/80 text-white text-sm px-3 py-1.5 pointer-events-none">
          {hovered} — {COUNTRIES[hovered].label}
        </div>
      )}
      <p className="text-xs text-zinc-400 text-center mt-2">
        Survole ou touche un pays en vert pour y accéder.
      </p>
    </div>
  );
}
