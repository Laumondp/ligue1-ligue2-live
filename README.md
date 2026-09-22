# Ligue 1 · Ligue 2 Live

Site public qui regroupe :

- **Équipes** : tous les clubs de Ligue 1 et Ligue 2 avec leurs logos.
- **Direct** : les matchs en cours (rafraîchi automatiquement toutes les 45 s).
- **Classement** : classement automatique de Ligue 1 et Ligue 2.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Données fournies par [API-Football](https://rapidapi.com/api-sports/api/api-football) (RapidAPI)

## Configuration

Variable d'environnement requise (à définir dans Vercel, jamais commitée) :

```
RAPIDAPI_KEY=xxxxxxxx
```

## Déploiement

Le projet est déployé sur Vercel via CLI (`npx vercel --prod`). Pas de serveur local :
toute vérification se fait directement en production après déploiement.

## Limites connues

Le palier gratuit d'API-Football est limité à 100 requêtes/jour. Les données sont mises
en cache côté serveur (équipes : 24h, classement : 30 min, direct : 30 s) pour rester
dans ce quota.
