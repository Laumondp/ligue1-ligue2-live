# Foot en direct

Site public avec deux sections à égalité, accueil neutre en entrée :

- **France** (`/france`) : Ligue 1 / Ligue 2.
- **Europe** (`/europe`) : Premier League / LaLiga / Serie A / Bundesliga.

Chaque section propose :

- **Équipes** : tous les clubs avec leurs logos.
- **Direct** : les matchs en cours (rafraîchi automatiquement toutes les 45 s).
- **Classement** : classement automatique.

Les anciennes URLs `/equipes`, `/direct`, `/classement` redirigent vers leurs
équivalents sous `/france/*`.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Données fournies par [Sofascore](https://rapidapi.com/apidojo/api/sofascore) (RapidAPI)

## Configuration

Variable d'environnement requise (à définir dans Vercel, jamais commitée) :

```
RAPIDAPI_KEY=xxxxxxxx
```

## Déploiement

Le projet est déployé sur Vercel via CLI (`npx vercel --prod`). Pas de serveur local :
toute vérification se fait directement en production après déploiement.

## Limites connues

Le palier gratuit de l'API Sofascore (RapidAPI) est limité à 100 requêtes/jour et
tolère mal les appels concurrents (429). Les données sont mises en cache côté serveur
(équipes : 24h, classement : 30 min, direct : 30 s) et les appels multi-championnats
sont séquentiels pour rester dans ce quota.
