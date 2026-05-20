# HavokApp

Frontend Expo / React organise pour se connecter au backend Express du dossier `server`.

## Structure

- `app/`: routes Expo Router
- `src/api/`: client HTTP et appels backend
- `src/components/`: composants UI reutilisables
- `src/navigation/`: helpers de navigation
- `src/screens/`: logique d'ecran
- `src/theme/`: theming sombre / clair
- `src/types/`: modeles TypeScript relies a l'API
- `src/utils/`: formatage, debug et utilitaires

## Variables d'environnement

Cree un fichier `.env.local` a la racine de `HavokApp` en partant de `.env.example`.

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=ton-app-api-key
EXPO_PUBLIC_APP_ATTESTATION_MODE=development
EXPO_PUBLIC_DEBUG_API=true
```

Notes utiles:

- Web local: `http://localhost:3000`
- Emulateur Android: utilise souvent `http://10.0.2.2:3000`
- iPhone simulateur: `http://127.0.0.1:3000` fonctionne generalement
- Appareil physique: `localhost` ne marchera pas. Utilise l'IP LAN du serveur ou une vraie URL HTTPS.
- Le client garde `x-app-key` puis ouvre une session courte JWT avant les appels metier.
- Le mode `development` est prevu pour Expo Go / dev builds et pour des tests preprod avec backend en `NODE_ENV=production`.
- L'attestation native de production n'est pas encore implementee dans ce repo. Le README du serveur dit explicitement que la partie Apple/Google reste a brancher.
- Une build mobile de production ne doit pas utiliser `localhost` comme base URL. Le client bloque ce cas.

## Realite prod

Ce repo permet aujourd'hui :

- une app locale et preprod stable avec session JWT courte
- un backend en `NODE_ENV=production`
- une attestation client `development` pour tests reels

Ce repo ne permet pas encore a lui seul :

- une publication store avec vraie attestation native Apple / Google
- une configuration finale de verification device-side pour la prod publique

Pour une vraie prod mobile, il faut encore implementer l'attestation native cote client et la verification associee cote serveur.

## Debug

- Les erreurs reseau et session sont maintenant logguees dans la console avec le prefixe `HavokDebug`.
- Au lancement, le client affiche aussi la configuration reseau utile pour comprendre les problemes de connexion.

## Demarrage

```bash
npm install
npm start
```

Puis lance selon la cible:

```bash
npm run web
npm run android
npm run ios
```

## Verification

```bash
npm run lint
npm run typecheck
```
