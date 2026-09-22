# Foot en direct

Site public avec deux sections à égalité, accueil neutre en entrée :

- **France** (`/france`) : Ligue 1 / Ligue 2.
- **Europe** (`/europe`) : Premier League / LaLiga / Serie A / Bundesliga /
  Eredivisie / Liga Portugal / Pro League (Belgique) / Swiss Super League.

Chaque section propose :

- **Équipes** : tous les clubs avec leurs logos.
- **Direct** : les matchs en cours (rafraîchi automatiquement toutes les 90 s
  s'il y a un match en cours, toutes les 10 min sinon).
- **Classement** : classement automatique.

Les anciennes URLs `/equipes`, `/direct`, `/classement` redirigent vers leurs
équivalents sous `/france/*`.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Données fournies par [Sofascore](https://rapidapi.com/apidojo/api/sofascore) (RapidAPI)
- Carte interactive de l'accueil : [react-simple-maps](https://www.react-simple-maps.io/),
  frontières chargées depuis le topojson public
  [world-atlas](https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json)

## Configuration

Variable d'environnement requise (à définir dans Vercel, jamais commitée) :

```
RAPIDAPI_KEY=xxxxxxxx
```

## Déploiement

Le projet est déployé sur Vercel via déploiement Git automatique (push sur
`master`). Pas de serveur local : toute vérification se fait directement en
production après déploiement.

## Limites connues

Le palier gratuit (Basic, $0/mo) de l'API Sofascore (RapidAPI) est un **hard
limit de 500 requêtes par MOIS** (pas par jour) — au-delà, l'API bloque
simplement les appels jusqu'au renouvellement du quota, sans frais. La bande
passante (10 240 MB/mois inclus, $0.001/MB au-delà) n'est en revanche pas
plafonnée en dur, mais reste très loin d'être un problème en pratique.

Avec un budget aussi serré, le polling continu est la principale menace : le
composant `LiveMatches` ne rafraîchit rapidement (90 s) que s'il y a un match
en cours, retombe à 10 min d'intervalle en journée sans match, et à 2h la
nuit (minuit-11h, aucun match européen à ces heures). Les autres données sont
mises en cache côté serveur (équipes : 24h, classement : 30 min, buteurs :
6h) et les appels multi-championnats sont séquentiels. Avec 10 championnats
au total, la page `/statistiques` (classements total/domicile/extérieur +
buteurs) reste celle qui consomme le plus de requêtes par cycle de cache ; à
surveiller en priorité si le quota venait à être dépassé.
