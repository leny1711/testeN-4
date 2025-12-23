# 🎯 Guide de Démarrage Rapide - TaskRunner

## ⚡ Démarrage en 5 minutes (Windows)

### Étape 1 : Vérifier les prérequis

Assurez-vous d'avoir installé :
- [ ] Node.js 18+ (https://nodejs.org/)
- [ ] PostgreSQL 14+ (https://www.postgresql.org/download/windows/)
- [ ] Expo Go sur votre smartphone

### Étape 2 : Créer la base de données

1. Ouvrir cmd et créer la base de données :

```cmd
psql -U postgres
CREATE DATABASE taskrunner_db;
\q
```

### Étape 3 : Configurer le Backend

```cmd
cd backend
npm install
copy .env.example .env
```

2. Éditer `.env` et mettre à jour la ligne DATABASE_URL :

```
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/taskrunner_db?schema=public"
```

3. Initialiser la base de données :

```cmd
npm run prisma:generate
npm run prisma:migrate
```

4. Lancer le backend :

```cmd
npm run dev
```

✅ Le backend devrait démarrer sur http://localhost:3000

### Étape 4 : Configurer le Mobile

1. Trouver votre adresse IP Windows :

```cmd
ipconfig
```

Chercher "Adresse IPv4" (ex: 192.168.1.100)

2. Installer et configurer :

```cmd
cd ..\mobile
npm install
```

3. Éditer `mobile/src/utils/config.ts` et remplacer :

```typescript
export const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
```

Par votre IP (ex: `http://192.168.1.100:3000/api`)

4. Lancer l'application :

```cmd
npm start
```

### Étape 5 : Tester sur votre téléphone

1. Ouvrir Expo Go sur votre smartphone
2. Scanner le QR code affiché
3. L'application se charge automatiquement

## 🧪 Test Rapide

### Créer un compte Client

1. Ouvrir l'app
2. Cliquer sur "S'inscrire"
3. Choisir "Client"
4. Remplir les informations
5. S'inscrire

### Créer une mission

1. Cliquer sur "+ Nouvelle demande"
2. Remplir :
   - Titre : "Test mission"
   - Description : "Ceci est un test"
   - Catégorie : "Faire des courses"
   - Adresse : "123 Rue de Paris"
   - Prix : 10€
3. Créer

### Créer un compte Prestataire

1. Se déconnecter (Profil → Déconnexion)
2. S'inscrire en tant que "Prestataire"
3. Activer la disponibilité
4. Voir les missions disponibles
5. Accepter la mission

## ❓ Problèmes Courants

### "Network response timed out"

✅ **Solution :**
1. Vérifier que le backend tourne (`npm run dev` dans backend/)
2. Vérifier l'IP dans `mobile/src/utils/config.ts`
3. Téléphone et PC sur le même WiFi ?

### "Unable to connect to server"

✅ **Solution :**
1. Pare-feu Windows : Autoriser Node.js
2. Tester l'API : Ouvrir http://localhost:3000/health dans le navigateur

### Backend ne démarre pas

✅ **Solution :**
1. PostgreSQL est lancé ? (Vérifier dans services.msc)
2. Le fichier .env est configuré ?
3. Les migrations sont exécutées ? (`npm run prisma:migrate`)

## 📋 Checklist de Validation

- [ ] Backend démarre sans erreur
- [ ] Ouvrir http://localhost:3000/health retourne un JSON
- [ ] Mobile se connecte au backend
- [ ] Inscription client fonctionne
- [ ] Création de mission fonctionne
- [ ] Inscription prestataire fonctionne
- [ ] Acceptation de mission fonctionne

## 🎓 Prochaines Étapes

Une fois l'application testée :

1. **Configuration Stripe** (pour les paiements réels)
   - Créer un compte sur https://stripe.com
   - Obtenir les clés API
   - Mettre à jour le .env

2. **Configuration Firebase** (pour les notifications)
   - Créer un projet sur https://console.firebase.google.com
   - Télécharger les credentials
   - Mettre à jour le .env

3. **Configuration Google Maps** (pour la géolocalisation)
   - Créer une clé API sur https://console.cloud.google.com
   - Mettre à jour le .env et app.json

## 📚 Documentation Complète

- **README principal** : Voir `/README.md`
- **Backend** : Voir `/backend/README.md`
- **Mobile** : Voir `/mobile/README.md`

## 🆘 Besoin d'aide ?

1. Vérifier les logs dans le terminal
2. Lire les messages d'erreur attentivement
3. Consulter les README détaillés
4. Vérifier que toutes les étapes sont suivies

---

**Bon développement ! 🚀**
