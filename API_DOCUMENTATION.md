# 📡 API Documentation - TaskRunner

Base URL: `http://localhost:3000/api`

## 🔐 Authentication

Tous les endpoints protégés nécessitent un header Authorization:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/register
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678",
  "role": "CLIENT" // ou "PROVIDER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### POST /auth/login
Connexion

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /auth/profile
Obtenir le profil de l'utilisateur connecté (Auth required)

### PUT /auth/profile
Mettre à jour le profil (Auth required)

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678",
  "address": "123 Rue de Paris"
}
```

### PUT /auth/location
Mettre à jour la localisation (Auth required)

**Body:**
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### PUT /auth/availability
Mettre à jour la disponibilité (Provider only)

**Body:**
```json
{
  "isAvailable": true
}
```

---

## Mission Endpoints

### POST /missions
Créer une nouvelle mission (Client only)

**Body:**
```json
{
  "title": "Faire mes courses",
  "description": "Acheter du pain et du lait au supermarché",
  "category": "courses",
  "pickupAddress": "123 Rue de Paris, 75001 Paris",
  "pickupLatitude": 48.8566,
  "pickupLongitude": 2.3522,
  "deliveryAddress": "456 Avenue des Champs, 75008 Paris",
  "urgency": "MEDIUM",
  "clientPrice": 15.00,
  "estimatedDuration": 30,
  "notes": "Sonner à l'interphone"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mission created successfully",
  "data": {
    "id": "uuid",
    "title": "Faire mes courses",
    "status": "PENDING",
    "clientPrice": 15.00,
    "platformFee": 2.25,
    "providerEarning": 12.75,
    ...
  }
}
```

### GET /missions
Liste des missions de l'utilisateur

**Query Parameters:**
- `status` (optional): PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED

### GET /missions/nearby
Missions à proximité (Provider only)

**Query Parameters:**
- `latitude` (required): 48.8566
- `longitude` (required): 2.3522
- `radius` (optional, default: 10): 15 (en kilomètres)

### GET /missions/:missionId
Détails d'une mission

### POST /missions/:missionId/accept
Accepter une mission (Provider only)

### POST /missions/:missionId/start
Démarrer une mission (Provider only)

### POST /missions/:missionId/complete
Terminer une mission (Provider only)

### POST /missions/:missionId/cancel
Annuler une mission

---

## Payment Endpoints

### POST /payments/create-intent
Créer un paiement pour une mission

**Body:**
```json
{
  "missionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntent": "pi_xxx_secret_yyy",
    "payment": { ... }
  }
}
```

### POST /payments/:paymentId/confirm
Confirmer un paiement

### GET /payments/mission/:missionId
Obtenir le paiement d'une mission

### GET /payments/history
Historique des paiements

### GET /payments/earnings
Gains du prestataire (Provider only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 450.00,
    "paidEarnings": 300.00,
    "pendingEarnings": 150.00,
    "currentBalance": 300.00,
    "completedMissions": 25
  }
}
```

### POST /payments/payout
Demander un retrait (Provider only)

**Body:**
```json
{
  "amount": 100.00
}
```

---

## Message Endpoints

### POST /messages
Envoyer un message

**Body:**
```json
{
  "missionId": "uuid",
  "content": "Bonjour, je suis en route"
}
```

### GET /messages/mission/:missionId
Messages d'une mission

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Bonjour",
      "createdAt": "2024-01-01T10:00:00Z",
      "sender": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### GET /messages/unread-count
Nombre de messages non lus

---

## Rating Endpoints

### POST /ratings
Créer une notation

**Body:**
```json
{
  "missionId": "uuid",
  "score": 5,
  "comment": "Excellent service!"
}
```

### GET /ratings/user/:userId
Notations d'un utilisateur

---

## Error Responses

Tous les endpoints peuvent retourner ces erreurs:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Webhook Endpoints

### POST /payments/webhook
Stripe webhook (no auth required)

Cet endpoint reçoit les événements de Stripe.

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "CLIENT"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Mission (with token)
```bash
curl -X POST http://localhost:3000/api/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test mission",
    "description": "Test description",
    "category": "courses",
    "pickupAddress": "123 Test St",
    "urgency": "MEDIUM",
    "clientPrice": 10
  }'
```

---

## Rate Limiting

Actuellement, il n'y a pas de rate limiting. En production, il est recommandé d'ajouter:
- 100 requêtes par 15 minutes pour les endpoints publics
- 1000 requêtes par heure pour les endpoints authentifiés

---

## Pagination

Les endpoints qui retournent des listes sont paginés par défaut (30 items par page).

---

## Codes de Statut Mission

- `PENDING` - Mission créée, en attente de prestataire
- `ACCEPTED` - Prestataire a accepté
- `IN_PROGRESS` - Mission en cours
- `COMPLETED` - Mission terminée
- `CANCELLED` - Mission annulée

## Niveaux d'Urgence

- `LOW` - Basse priorité
- `MEDIUM` - Priorité moyenne
- `HIGH` - Haute priorité
- `URGENT` - Urgent

## Catégories de Missions

- `courses` - Faire des courses
- `colis` - Récupérer un colis
- `promenade` - Promener un chien
- `achat` - Acheter un objet
- `autre` - Autre

---

**Note:** Tous les montants sont en euros (€)
