# TaskRunner - Application Mobile

Application mobile React Native pour la marketplace de services à la demande TaskRunner.

## 📋 Prérequis

- Node.js 18+ installé
- Expo Go installé sur votre smartphone (iOS ou Android)
- Un compte Expo (optionnel mais recommandé)

## 🚀 Installation (Windows)

### 1. Installer les dépendances

```cmd
cd mobile
npm install
```

### 2. Configuration

Éditer le fichier `src/utils/config.ts` avec vos propres valeurs :

```typescript
// IMPORTANT: Utiliser l'adresse IP de votre machine Windows
// Pour trouver votre IP : ouvrir cmd et taper "ipconfig"
// Chercher "Adresse IPv4" dans la section de votre adaptateur réseau
export const API_BASE_URL = 'http://192.168.1.XXX:3000/api';

// Remplacer avec votre clé Stripe
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_votre_cle';

// Remplacer avec votre clé Google Maps
export const GOOGLE_MAPS_API_KEY = 'votre_cle_google_maps';
```

**IMPORTANT pour Windows :** 
- Ne pas utiliser `localhost` ou `127.0.0.1` car cela ne fonctionnera pas depuis votre téléphone
- Utiliser l'adresse IP locale de votre machine Windows (ex: `192.168.1.100`)
- S'assurer que votre téléphone et votre PC sont sur le même réseau WiFi

### 3. Trouver votre adresse IP Windows

Ouvrir l'invite de commandes (cmd) :

```cmd
ipconfig
```

Chercher "Adresse IPv4" sous votre adaptateur réseau WiFi (généralement quelque chose comme `192.168.1.XXX`)

### 4. Lancer l'application

```cmd
npm start
```

Cette commande va :
1. Démarrer le serveur Expo
2. Afficher un QR code dans le terminal
3. Ouvrir une page web avec le QR code

### 5. Tester sur votre téléphone avec Expo Go

**Option 1 : Scanner le QR code**
1. Ouvrir l'application Expo Go sur votre téléphone
2. Scanner le QR code affiché
3. L'application va se charger automatiquement

**Option 2 : Connexion manuelle**
1. S'assurer que votre téléphone et PC sont sur le même WiFi
2. Dans Expo Go, entrer manuellement l'URL affichée (ex: `exp://192.168.1.100:19000`)

## 📱 Fonctionnalités

### Pour les Clients

- **Inscription/Connexion** : Créer un compte client
- **Créer une demande** : Bouton rouge pour demander un service immédiatement
- **Catégories disponibles** :
  - Faire des courses
  - Récupérer un colis
  - Promener un chien
  - Acheter un objet
  - Autre
- **Suivi en temps réel** : Voir le statut de la mission
- **Chat** : Communiquer avec le prestataire
- **Paiement sécurisé** : Via Stripe
- **Historique** : Voir toutes les missions passées
- **Notation** : Noter le prestataire après la mission

### Pour les Prestataires

- **Inscription/Connexion** : Créer un compte prestataire
- **Disponibilité** : Activer/désactiver la disponibilité
- **Missions à proximité** : Voir les missions disponibles autour de soi
- **Accepter/Refuser** : Choisir les missions
- **Navigation GPS** : Se rendre chez le client
- **Chat** : Communiquer avec le client
- **Gains** : Voir l'historique des gains
- **Système de notation** : Être noté par les clients

## 🗂️ Structure du projet

```
mobile/
├── src/
│   ├── context/               # Context API (Auth)
│   ├── navigation/            # Navigation (Stack, Tabs)
│   ├── screens/
│   │   ├── auth/              # Écrans d'authentification
│   │   ├── client/            # Écrans client
│   │   ├── provider/          # Écrans prestataire
│   │   └── shared/            # Écrans partagés
│   ├── services/              # API calls
│   ├── utils/                 # Utilitaires et config
│   └── types/                 # Types TypeScript
├── App.tsx                    # Point d'entrée
├── app.json                   # Configuration Expo
└── package.json
```

## 🎨 Stack Technique

- **React Native** : Framework mobile
- **Expo SDK 54** : Plateforme de développement
- **TypeScript** : Langage typé
- **React Navigation 6** : Navigation
- **Axios** : Requêtes HTTP
- **AsyncStorage** : Stockage local
- **Expo Location** : Géolocalisation
- **Expo Notifications** : Notifications push
- **React Native Maps** : Cartes
- **Stripe React Native** : Paiements

## 🔧 Commandes utiles

```cmd
# Démarrer le serveur de développement
npm start

# Lancer sur Android (si émulateur)
npm run android

# Lancer sur iOS (si émulateur macOS)
npm run ios

# Effacer le cache Expo
npx expo start -c
```

## 🐛 Problèmes courants (Windows)

### Problème : "Network response timed out"

**Solution :** 
1. Vérifier que le backend tourne sur le port 3000
2. Vérifier l'adresse IP dans `config.ts`
3. S'assurer que le pare-feu Windows autorise Node.js
4. Vérifier que téléphone et PC sont sur le même WiFi

### Problème : "Unable to connect to the server"

**Solution :**
1. Vérifier la configuration du pare-feu Windows
2. Essayer de désactiver temporairement le pare-feu pour tester
3. S'assurer que le port 3000 et 19000 sont accessibles

### Problème : Expo ne démarre pas

**Solution :**
```cmd
# Nettoyer le cache
rd /s /q node_modules
rd /s /q .expo
npm install
npx expo start -c
```

## 📝 Configuration Firebase (Notifications Push)

1. Aller sur https://console.firebase.google.com
2. Créer un nouveau projet
3. Ajouter une application Android/iOS
4. Télécharger `google-services.json` (Android) ou `GoogleService-Info.plist` (iOS)
5. Suivre les instructions Expo pour Firebase : https://docs.expo.dev/push-notifications/fcm-credentials/

## 💳 Configuration Stripe (Paiements)

1. Créer un compte sur https://stripe.com
2. Obtenir les clés API de test
3. Mettre à jour `STRIPE_PUBLISHABLE_KEY` dans `config.ts`
4. Configurer le webhook Stripe pour pointer vers votre backend

## 🗺️ Configuration Google Maps

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet
3. Activer l'API "Maps SDK for Android/iOS"
4. Créer une clé API
5. Mettre à jour `GOOGLE_MAPS_API_KEY` dans `config.ts` et `app.json`

## 📱 Tester l'application

### Mode Client

1. S'inscrire en tant que "Client"
2. Créer une nouvelle demande
3. Attendre qu'un prestataire accepte
4. Suivre la mission en temps réel
5. Noter le prestataire à la fin

### Mode Prestataire

1. S'inscrire en tant que "Prestataire"
2. Activer la disponibilité
3. Voir les missions à proximité
4. Accepter une mission
5. Démarrer et terminer la mission

## 🔐 Sécurité

- Les tokens JWT sont stockés de manière sécurisée dans AsyncStorage
- Les mots de passe ne sont jamais stockés en clair
- Communication HTTPS recommandée en production

## 📞 Support

Pour toute question, consultez la documentation Expo : https://docs.expo.dev/

## ⚠️ Important pour la production

Avant de publier l'application :
1. Changer `API_BASE_URL` vers l'URL de production
2. Utiliser les vraies clés Stripe (pas de test)
3. Configurer les permissions Android/iOS correctement
4. Tester sur de vrais appareils
5. Optimiser les images et assets
