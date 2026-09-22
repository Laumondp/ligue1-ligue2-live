"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { geoMercator, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WIDTH = 800;
const HEIGHT = 520;
const PADDING = 28;

// Cadrage manuel (Lisbonne/Gibraltar au sud-ouest, Écosse/Italie du sud au
// nord-est) plutôt qu'un fitExtent sur les géométries des pays actifs : la
// géométrie "France" de ce jeu de données inclut ses territoires d'outre-mer
// (ex: Guyane), ce qui fausserait complètement le cadrage sur l'Europe.
const FIT_BOUNDS: [[number, number], [number, number]] = [
  [-9.6, 35.9],
  [18.6, 59],
];

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

type CountryFeature = Feature<Geometry, { name: string }>;

export default function EuropeMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [state, setState] = useState<{
    projection: GeoProjection;
    features: CountryFeature[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(GEO_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        if (cancelled) return;
        const countries = topology.objects.countries as GeometryCollection;
        const collection = feature(topology, countries) as unknown as FeatureCollection<
          Geometry,
          { name: string }
        >;
        const projection = geoMercator().fitExtent(
          [
            [PADDING, PADDING],
            [WIDTH - PADDING, HEIGHT - PADDING],
          ],
          {
            type: "MultiPoint",
            coordinates: FIT_BOUNDS,
          }
        );

        setState({ projection, features: collection.features });
      })
      .catch(() => {
        // Silencieux : la carte n'est qu'un complément visuel aux deux cartes
        // France/Europe déjà présentes sur l'accueil.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
      {state ? (
        <ComposableMap
          width={WIDTH}
          height={HEIGHT}
          projection={state.projection}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={state.features}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = (geo.properties as { name: string })?.name;
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
      ) : (
        <div
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          className="flex items-center justify-center text-zinc-400 text-sm"
        >
          Chargement de la carte…
        </div>
      )}
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
