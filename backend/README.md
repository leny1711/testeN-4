# TaskRunner - Backend API

Backend API pour la marketplace de services à la demande TaskRunner.

## 📋 Prérequis

- Node.js 18+ installé
- PostgreSQL 14+ installé
- Un compte Stripe (pour les paiements)
- Un projet Firebase (pour les notifications push)
- Une clé API Google Maps

## 🚀 Installation (Windows)

### 1. Installer les dépendances

```cmd
cd backend
npm install
```

### 2. Configuration de la base de données PostgreSQL

1. Télécharger et installer PostgreSQL depuis https://www.postgresql.org/download/windows/
2. Créer une nouvelle base de données :

```cmd
psql -U postgres
CREATE DATABASE taskrunner_db;
\q
```

### 3. Configuration des variables d'environnement

Copier le fichier `.env.example` vers `.env` :

```cmd
copy .env.example .env
```

Éditer le fichier `.env` avec vos propres valeurs :

```env
# Database
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/taskrunner_db?schema=public"

# JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
PLATFORM_COMMISSION_PERCENT=15

# Google Maps
GOOGLE_MAPS_API_KEY=votre_cle_google_maps

# Firebase
FIREBASE_PROJECT_ID=votre-projet-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre clé privée\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@votre-projet.iam.gserviceaccount.com
```

### 4. Générer le client Prisma et exécuter les migrations

```cmd
npm run prisma:generate
npm run prisma:migrate
```

### 5. Lancer le serveur en mode développement

```cmd
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 📚 API Endpoints

### Authentification (`/api/auth`)

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (auth requis)
- `PUT /api/auth/profile` - Mise à jour du profil
- `PUT /api/auth/location` - Mise à jour de la localisation
- `PUT /api/auth/availability` - Mise à jour de la disponibilité (prestataires)

### Missions (`/api/missions`)

- `POST /api/missions` - Créer une mission
- `GET /api/missions` - Liste des missions de l'utilisateur
- `GET /api/missions/nearby` - Missions à proximité (prestataires)
- `GET /api/missions/:id` - Détails d'une mission
- `POST /api/missions/:id/accept` - Accepter une mission
- `POST /api/missions/:id/start` - Démarrer une mission
- `POST /api/missions/:id/complete` - Terminer une mission
- `POST /api/missions/:id/cancel` - Annuler une mission

### Paiements (`/api/payments`)

- `POST /api/payments/create-intent` - Créer un paiement
- `GET /api/payments/history` - Historique des paiements
- `GET /api/payments/earnings` - Gains du prestataire
- `POST /api/payments/payout` - Demander un retrait

### Messages (`/api/messages`)

- `POST /api/messages` - Envoyer un message
- `GET /api/messages/mission/:id` - Messages d'une mission

### Notations (`/api/ratings`)

- `POST /api/ratings` - Créer une notation
- `GET /api/ratings/user/:id` - Notations d'un utilisateur

## 🛠️ Scripts disponibles

- `npm run dev` - Lancer en mode développement
- `npm run build` - Compiler le TypeScript
- `npm start` - Lancer en production
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Exécuter les migrations
- `npm run prisma:studio` - Ouvrir Prisma Studio

## 🗄️ Structure du projet

```
backend/
├── prisma/
│   └── schema.prisma          # Schéma de la base de données
├── src/
│   ├── config/                # Configuration (DB, Stripe, Firebase)
│   ├── controllers/           # Contrôleurs HTTP
│   ├── middleware/            # Middleware (auth, errors)
│   ├── routes/                # Routes de l'API
│   ├── services/              # Logique métier
│   └── server.ts              # Point d'entrée
├── .env                       # Variables d'environnement
└── package.json
```

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Authentification via JWT
- Validation des entrées avec express-validator
- Protection CORS configurée

## 📝 Notes importantes

- Par défaut, la commission de la plateforme est de 15%
- Les paiements sont traités via Stripe
- Les notifications push utilisent Firebase Cloud Messaging
- La géolocalisation utilise Google Maps API

## 🐛 Debugging

Pour voir les logs SQL en développement, Prisma est configuré pour afficher toutes les requêtes.

## 📞 Support

Pour toute question, consultez la documentation ou contactez le support.
