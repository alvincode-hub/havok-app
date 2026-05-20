# HavokApp

Frontend Expo / React organise pour se connecter au backend Express du dossier `server`.

## Structure

- `app/`: routes Expo Router
- `src/api/`: client HTTP et appels backend
- `src/components/`: composants UI reutilisables
- `src/screens/`: logique d'ecran
- `src/config/`: configuration d'environnement
- `src/types/`: modeles TypeScript relies a l'API

## Variables d'environnement

Cree un fichier `.env.local` a la racine de `HavokApp` en partant de `.env.example`.

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=ton-app-api-key
EXPO_PUBLIC_APP_ATTESTATION_MODE=development
```

Notes utiles:

- Web local: `http://localhost:3000`
- Emulateur Android: utilise souvent `http://10.0.2.2:3000`
- iPhone simulateur: `http://127.0.0.1:3000` fonctionne generalement
- Le client garde `x-app-key` puis ouvre une session courte JWT avant les appels metier.
- Le mode `development` est prevu pour Expo Go / dev builds. L'attestation native prod reste a brancher cote client avant publication.

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
