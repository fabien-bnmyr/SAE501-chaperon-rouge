co# Projet — Chaperon Rouge (Three.js / Vite)

Ce dépôt contient une petite application Web basée sur Vite et Three.js.

## Prérequis

- Node.js (recommandé : 16.x ou plus récent). Installez depuis https://nodejs.org/
- npm (fourni avec Node.js)

## Installation (une seule fois)

Ouvrez PowerShell dans le dossier du projet (par exemple : `c:\Users\fabie\Documents\GitHub\SAE501-chaperon-rouge\application`) puis exécutez :

```powershell
npm install
```

## Lancer le projet en développement

Pour démarrer le serveur de développement (Vite) et ouvrir l'application en local :

```powershell
npm run dev
```

Par défaut, Vite servira l'application sur http://localhost:5173 (ou un autre port libre). Ouvrez l'URL affichée dans la console.

## Compiler pour la production

Pour construire les fichiers optimisés destinés à la production :

```powershell
npm run build
```

Les fichiers résultants seront placés dans le répertoire `dist/`.

## Prévisualiser la build production

Après `npm run build`, vous pouvez prévisualiser la version de production de deux manières :

- Avec Vite (si vous avez `vite` installé localement) :

```powershell
npx vite preview
```

- Ou avec un serveur statique (par exemple `serve`) :

```powershell
npx serve dist
```

## Scripts disponibles

Les scripts définis dans `package.json` sont :

- `dev` : lance Vite en mode développement
- `start` : alias vers Vite (équivalent à `dev`)
- `build` : construit le projet pour la production

Vous pouvez les exécuter avec `npm run <script>`.

## Notes spécifiques Windows / PowerShell

- Si PowerShell bloque l'exécution de scripts externes, vous pouvez lancer les commandes `npm` normalement ; il s'agit rarement d'un problème pour ces scripts.
- Si vous avez des erreurs liées aux permissions, relancez PowerShell en tant qu'administrateur ou vérifiez votre configuration npm (chemin d'installation global).

## Dépannage rapide

- Si `npm run dev` ne démarre pas, vérifiez que Node.js est installé : `node -v` et `npm -v`.
- Supprimez `node_modules` et réinstallez si problème persiste :

```powershell
rm -r node_modules; npm install
```

- Vérifiez les messages d'erreur dans la console : Vite donne généralement une instruction claire sur le problème (port occupé, dépendance manquante, erreur de build...).

## Remarques

Ce projet utilise : Vite, React, Three.js. Pour des changements de configuration (par ex. ajouter un script `preview` dans `package.json`), éditez `package.json` et ajoutez :

```json
"preview": "vite preview"
```

---

Bonne exploration ! Si vous voulez, je peux ajouter un script `preview` automatique au `package.json` ou détailler comment déployer le dossier `dist` sur un hébergement statique.
