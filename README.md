# 🚀 TaskRunner - Marketplace de Services à la Demande

Une application complète de marketplace pour services à la demande, type "Uber des tâches du quotidien". Les utilisateurs peuvent demander de l'aide immédiate pour des tâches quotidiennes, et les prestataires peuvent accepter ces missions pour gagner de l'argent.

## 📱 Concept

**Pour les Clients :**
- Appuyer sur un bouton pour demander de l'aide immédiate
- Types de services : courses, récupération de colis, promenade de chien, achats, etc.
- Paiement sécurisé via Stripe
- Suivi en temps réel
- Chat avec le prestataire
- Notation du service

**Pour les Prestataires :**
- Recevoir des notifications pour les missions à proximité
- Choisir les missions à accepter
- Navigation GPS vers le client
- Gagner de l'argent par mission
- Système de notation

**Commission de la plateforme :** 15% par défaut (configurable)

## 🏗️ Architecture Technique

### Backend
- **Framework :** Node.js + Express + TypeScript
- **Base de données :** PostgreSQL avec Prisma ORM
- **Authentification :** JWT (JSON Web Tokens)
- **Paiements :** Stripe
- **Notifications :** Firebase Cloud Messaging
- **Géolocalisation :** Calculs de distance (formule Haversine)

### Frontend Mobile
- **Framework :** React Native avec Expo SDK 54
- **Langage :** TypeScript
- **Navigation :** React Navigation 6
- **État global :** Context API
- **Maps :** React Native Maps
- **Paiements :** Stripe React Native
- **Notifications :** Expo Notifications

## 📂 Structure du Projet

```
testeN-4/
├── backend/                    # API Backend
│   ├── prisma/
│   │   └── schema.prisma       # Schéma de la base de données
│   ├── src/
│   │   ├── config/             # Configuration (DB, Stripe, Firebase)
│   │   ├── controllers/        # Contrôleurs HTTP
│   │   ├── middleware/         # Middleware (auth, errors)
│   │   ├── routes/             # Routes de l'API
│   │   ├── services/           # Logique métier
│   │   └── server.ts           # Point d'entrée
│   ├── .env.example            # Template des variables d'environnement
│   ├── package.json
│   └── README.md               # Documentation backend
│
├── mobile/                     # Application Mobile
│   ├── src/
│   │   ├── context/            # Context API (Auth)
│   │   ├── navigation/         # Navigation
│   │   ├── screens/            # Écrans de l'app
│   │   │   ├── auth/           # Authentification
│   │   │   ├── client/         # Écrans client
│   │   │   ├── provider/       # Écrans prestataire
│   │   │   └── shared/         # Écrans partagés
│   │   ├── services/           # API calls
│   │   └── utils/              # Utilitaires et config
│   ├── App.tsx                 # Point d'entrée
│   ├── app.json                # Configuration Expo
│   ├── package.json
│   └── README.md               # Documentation mobile
│
└── README.md                   # Ce fichier
```

## 🚀 Installation Rapide (Windows)

### Prérequis

1. **Node.js 18+** : https://nodejs.org/
2. **PostgreSQL 14+** : https://www.postgresql.org/download/windows/
3. **Expo Go** sur votre smartphone (iOS ou Android)
4. **Comptes nécessaires :**
   - Stripe : https://stripe.com (pour les paiements)
   - Firebase : https://console.firebase.google.com (pour les notifications)
   - Google Cloud : https://console.cloud.google.com (pour Google Maps)

### Étape 1 : Cloner le projet

```cmd
git clone https://github.com/leny1711/testeN-4.git
cd testeN-4
```

### Étape 2 : Configuration Backend

```cmd
cd backend
npm install

REM Copier le fichier de configuration
copy .env.example .env

REM Éditer .env avec vos propres valeurs (voir backend/README.md)

REM Générer le client Prisma et créer la base de données
npm run prisma:generate
npm run prisma:migrate

REM Lancer le backend
npm run dev
```

Le backend démarre sur `http://localhost:3000`

### Étape 3 : Configuration Mobile

**IMPORTANT : Trouver votre adresse IP Windows**

Ouvrir cmd et taper :
```cmd
ipconfig
```

Chercher "Adresse IPv4" (ex: `192.168.1.100`)

```cmd
cd ..\mobile
npm install

REM Éditer src/utils/config.ts
REM Remplacer API_BASE_URL par http://VOTRE_IP:3000/api
REM Exemple: http://192.168.1.100:3000/api

REM Lancer l'application
npm start
```

### Étape 4 : Tester sur votre téléphone

1. Installer **Expo Go** sur votre smartphone
2. S'assurer que votre téléphone et PC sont sur le même WiFi
3. Scanner le QR code affiché dans le terminal
4. L'application se charge automatiquement

## 📖 Documentation Détaillée

- **Backend :** Voir [backend/README.md](backend/README.md)
- **Mobile :** Voir [mobile/README.md](mobile/README.md)

## 🎯 Fonctionnalités Implémentées

### ✅ Authentification
- Inscription client/prestataire
- Connexion avec JWT
- Gestion du profil utilisateur

### ✅ Gestion des Missions
- Création de mission par le client
- Liste des missions disponibles pour prestataires
- Acceptation/refus de missions
- Suivi du statut (Pending → Accepted → In Progress → Completed)
- Annulation de missions
- Calcul automatique des distances

### ✅ Paiements
- Intégration Stripe
- Calcul automatique de la commission (15%)
- Historique des paiements
- Suivi des gains pour prestataires
- Demande de retrait

### ✅ Communication
- Système de messages entre client et prestataire
- Notifications push via Firebase
- Compteur de messages non lus

### ✅ Notation
- Notation après mission terminée
- Calcul automatique de la moyenne
- Affichage des notes sur les profils

### ✅ Géolocalisation
- Mise à jour de la position
- Recherche de missions à proximité
- Calcul de distance en temps réel

## 🔑 Configuration des Services Externes

### Stripe (Paiements)

1. Créer un compte sur https://stripe.com
2. Obtenir les clés de test :
   - Dashboard → Developers → API Keys
   - `Publishable key` (pk_test_...)
   - `Secret key` (sk_test_...)
3. Configurer le webhook :
   - Dashboard → Developers → Webhooks
   - Ajouter un endpoint : `http://VOTRE_IP:3000/api/payments/webhook`
   - Sélectionner les événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

### Firebase (Notifications Push)

1. Créer un projet sur https://console.firebase.google.com
2. Ajouter une application Android et/ou iOS
3. Télécharger le fichier de configuration
4. Dans Project Settings → Service Accounts
5. Générer une nouvelle clé privée (JSON)
6. Extraire les valeurs pour `.env` :
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

### Google Maps (Géolocalisation)

1. Aller sur https://console.cloud.google.com
2. Créer ou sélectionner un projet
3. Activer l'API "Maps SDK for Android/iOS"
4. Créer une clé API
5. Configurer les restrictions (optionnel mais recommandé)

## 🧪 Test de l'Application

### Scénario Client

1. Lancer l'app et s'inscrire en tant que "Client"
2. Cliquer sur "+ Nouvelle demande"
3. Remplir les informations :
   - Titre : "Faire mes courses"
   - Description : "Acheter du pain et du lait"
   - Catégorie : "Faire des courses"
   - Adresse : "123 Rue de la Paix, Paris"
   - Prix : 15€
4. Créer la demande
5. Attendre qu'un prestataire accepte

### Scénario Prestataire

1. Lancer l'app et s'inscrire en tant que "Prestataire"
2. Activer la disponibilité (toggle en haut)
3. Voir les missions disponibles
4. Accepter une mission
5. Démarrer la mission
6. Terminer la mission

### Tester les Paiements

1. Le client reçoit une demande de paiement après la mission
2. Utiliser une carte de test Stripe : `4242 4242 4242 4242`
3. Date : n'importe quelle date future
4. CVC : n'importe quel 3 chiffres
5. Le prestataire reçoit son paiement (85% du total)

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- Authentification JWT avec expiration
- Validation des entrées côté serveur
- Protection CORS
- Variables d'environnement pour les secrets
- HTTPS recommandé en production

## 📊 Base de Données

Le schéma Prisma inclut :

- **User** : Utilisateurs (clients, prestataires, admins)
- **Mission** : Demandes de services
- **Message** : Chat entre client et prestataire
- **Rating** : Notations et avis
- **Payment** : Transactions et paiements
- **Notification** : Historique des notifications
- **PlatformConfig** : Configuration de la plateforme

## 🎨 Design Pattern

- **Clean Architecture** : Séparation claire des couches
- **Service Layer** : Logique métier isolée
- **Controller Layer** : Gestion des requêtes HTTP
- **Repository Pattern** : Accès aux données via Prisma
- **Middleware Pattern** : Authentification et validation

## 🐛 Débogage

### Backend ne démarre pas

```cmd
REM Vérifier si PostgreSQL est lancé
services.msc

REM Vérifier les logs
npm run dev
```

### Mobile ne se connecte pas au backend

```cmd
REM Vérifier l'adresse IP
ipconfig

REM Vérifier que le backend tourne
REM Ouvrir http://localhost:3000/health dans le navigateur

REM Vérifier le pare-feu Windows
REM Autoriser Node.js dans le pare-feu
```

### Erreur de build Expo

```cmd
REM Nettoyer le cache
rd /s /q node_modules
rd /s /q .expo
npm install
npx expo start -c
```

## 📈 Évolutions Futures

- [ ] Admin dashboard web
- [ ] Paiements par portefeuille électronique
- [ ] Historique de localisation en temps réel
- [ ] Chat en temps réel avec WebSocket
- [ ] Notifications par email
- [ ] Support multilingue
- [ ] Mode hors ligne
- [ ] Analytics et statistiques
- [ ] Programme de parrainage
- [ ] Vérification d'identité pour prestataires

## 🤝 Contribution

Ce projet est une démonstration complète d'une marketplace de services. N'hésitez pas à l'adapter à vos besoins !

## 📝 Licence

MIT License - Libre d'utilisation pour vos projets.

## 👨‍💻 Support

Pour toute question :
- Backend : Voir [backend/README.md](backend/README.md)
- Mobile : Voir [mobile/README.md](mobile/README.md)
- Issues : https://github.com/leny1711/testeN-4/issues

---

**Note :** Ce projet est optimisé pour le développement sur Windows avec Expo Go pour les tests mobiles. Assurez-vous de suivre les instructions Windows-specific dans les README.