# 🗺️ Guide de Clonage Complet : Sarab Quest

Ce document contient l'absolue totalité des détails sur le jeu **Sarab Quest** tel qu'il est construit dans le projet actuel. Vous pouvez utiliser ce document pour reproduire le jeu **exactement à l'identique** dans n'importe quel autre projet Next.js.

---

## 1. 📂 Exportation Automatique des Fichiers Clés

Pour vous simplifier la tâche, j'ai créé un script pour copier tous les fichiers dont dépend **Sarab Quest**. J'ai exécuté ce script et tous les fichiers sont maintenant prêts dans ce dossier (à la racine de votre projet) :

👉 **`d:\Touches D'Art\siteATA\sarab_quest_backup`**

Ce dossier contient un "miroir" parfait de l'architecture :
- 📁 `src/app/games/sarab-quest` (Dossier contenant l'interface du joueur, `page.jsx`, et styles)
- 📁 `src/app/dashboard/games/sarab-quest` (Dossier contenant le tableau de bord Admin)
- 📁 `src/app/api/games/sarab-quest` (Dossier avec toutes les routes API : `admin/`, `player/`)
- 📁 `src/components/` : `SarabTaquin.jsx`, `SarabPuzzle.jsx`, `SarabQrReader.jsx`
- 📁 `src/models/` : `PhygitalGame.js`, `PhygitalStage.js`, `PhygitalTeam.js`
- 📁 `public/images/maps_photos/` (Contient les environnements HD : `map_general.jfif`, `map_desert.jfif`, `map_foret.jfif`, `map_plage.jfif`)

Vous n'avez qu'à copier-coller intégralement les dossiers `src` et `public` du dossier de backup vers votre **nouveau projet Next.js** pour y importer le jeu.

---

## 2. 🎮 Mécaniques de Jeu de A à Z (Data & Gameplay)

Sarab Quest (nom technique "PhygitalGame") est un jeu de type Escape Game / Chasse au Trésor Phygitale (Physique & Digitale).

### A. Flux d'inscription
1. **Admin** : Crée un évènement via le Dashboard. Définit le nom, la date de début, l'environnement visuel (la carte).
2. **Admin** : Crée une suite "d'Étapes" (Stages). Chaque étape contient un indice, une "bonne réponse" ou solution secrète, un type validation, et des points de base à gagner.
3. **Joueur** : Chaque équipe reçoit un code d'accès à 6 caractères généré pour eux.
4. **Joueur** : Il se rend sur `/games/sarab-quest` et insère son code unique. La partie est synchronisée et leur progression est sauvée dans `localStorage` (avec `sarabSession`).

### B. Types d'Étapes (Validation)
Sarab Quest propose 6 expériences interactives différentes dans ses modèles de base :
- **📝 Text (`text`)**: Une simple devinette où il faut taper un mot (ex: Mot de passe).
- **🔠 Choix Multiple (`choice`)**: Le joueur sélectionne entre A, B, C, D (jusqu'à 4 choix).
- **📷 QR Code (`qr`)**: Ouvre l'appareil photo (`SarabQrReader`), le système lit un QR-Code réel dissimulé lors de l'évènement pour valider.
- **📡 Tag NFC (`nfc`)**: Active le composant NDEFReader du smartphone pour scanner une puce physique NFC. (L'onde NFC déclenche un envoi API avec `nfc_payload=XXXX`).
- **🧩 Puzzle d'Image (`puzzle`)**: Le joueur recompose une image (grid 3x3 par défaut) en cliquant sur deux cases pour les inverser (`SarabPuzzle.jsx`).
- **⚙️ Taquin Mécanique (`taquin`)**: Le jeu culte du pousse-pousse géométrique avec tuiles (1 à 15, avec un trou). On déplace sur l'empty-space pour résoudre. L'esthétique utilise un gradient marron/bronze très steampunk/aventurier.

### C. Système de Points (Compétitif Temps Réel)
La route API `verify/route.js` a une fonction de score algorithmique de haut niveau :
- Lorsqu'une équipe résout une étape en PREMIER sur la plateforme, elle enregistre `firstSolveTime`.
- Toutes les autres équipes perdent **2 points par minute de retard** par rapport à l'équipe l'ayant résolu en premier (tout gardant un seuil minimum de 25% de points gagnables pour ne pas ruiner leur score).

---

## 3. 🎨 Design UI/UX et Photographie (Miroir Frontend)

L'expérience visuelle a été conçue pour avoir un design très "Science-Fiction" ou "Phygital Cyber / Aventure Antique". 

### Palette de Couleurs & Esthétique
- **Interface Globale** : Dominance Sombre (`#131922`, noir-bleuté avec des transparences "glassmorphism").
- **Couleurs d'Action** : Indigo/Cyan Néon (`#00f0ff` ou `#00e5ff`) et Orange Chasse au Trésor (`#ff9900` ou Or (`#ffd700`) et Bronze (`#a67c52`)).
- **Succès / Win** : Vert Fluo / Emerald (`#00e599`, `#00ffaa`).

### Composants Avancés de Map Dynamique (`app/games/sarab-quest/page.jsx`)
La carte interactive est la pièce maîtresse du UX Player :
- **La Map Circulaire** : Une vue type radar circulaire / boussole. `vW * 2.5` est la formule utilisée pour afficher une image géante (`border-radius: 50%`). 
- **Panning/Dragging interactif** : Des écouteurs sur le TouchEvent et MouseMove (`setPan({x, y})`) permettent de faire glisser le fond HD pour naviguer de check-point en check-point. Les check-points sont reliés via un dessin `SVG` avec path paramétré pour avoir des courbes de bézier dynamiques (`pathData = M Q X Y`). L'icône de l'icône dépend du statut (Verrouillé 🔒, Actuel/Néon Vert ou Terminée).
- **Polices (Typographie)** : Les fonts mentionnées dans le code sont typiquement **Orbitron** (pour les chiffres de score, ambiance cyberpunk) et **Rajdhani** (pour les titres d'aventures et HUD). Pensez à les importer dans votre layout global Next.js.

---

## 4. 🚀 Installer Sarab Quest dans votre 2ème Projet

Si vous lancez ce nouveau projet, voici la "Check-list" pour que le jeu importé fonctionne :

1. Glissez-déposez les dossiers `src/` et `public/` depuis `d:\Touches D'Art\siteATA\sarab_quest_backup` vers la racine de votre nouveau projet Next.js.
2. Assurez-vous que le projet de destination possède bien son installateur/connecteur base de données (`lib/db.js` pour MongoDB) que les API importées appelleront.
3. Installez `lucide-react` car Sarab Quest l'utilise fortement (`npm i lucide-react`).
4. Si vous utilisez un code d'authentification ou `next-auth`, n'hésitez pas à adapter la vérification Admin (`fetch('/api/auth/me')` ligne 44 du code `page.jsx` de _Sarab_ - afin de sécuriser l'accès dashboard pour les maitres de jeu).
5. Lancez votre serveur (`npm run dev`) pour profiter de votre Chasse au Trésor !
