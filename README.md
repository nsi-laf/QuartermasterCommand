# ⚔️ Quartermaster Command

![Version](https://img.shields.io/badge/version-v8.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=flat&logo=javascript&logoColor=F7DF1E)
![PWA](https://img.shields.io/badge/PWA-Ready-success)

**Quartermaster Command** (formerly *Jaegh's Refining Suite*) is the ultimate manufacturing calculator and logistics dashboard for **Mortal Online 2**. Designed for guild quartermasters, gatherers, and master crafters, this suite handles complex extraction math, market budgeting, and work-order dispatching in a sleek, offline-capable interface.

*"Steel wins battles, silver wins wars."* — [MTM] Jaegh

---

## ✨ Feature Overview

* 🧠 **Pipeline Intelligence:** Automatically maps out multi-step extraction, refining, and smelting tasks. The dynamic engine calculates whether to Crush, Grind, or Bake based on your global preferences (⭐ Most Efficient vs. 💎 Max Byproducts).
* ⚡ **Calculate Craftable:** Scans your current bank inventory to calculate the absolute maximum amount of target metal you can produce with your existing stockpile.
* 🛒 **Smart Market Cart:** Enter local market prices and buy quantities. Use *Auto-Fill All* to calculate exactly how much you need to buy to cover a deficit, tracking your **Total Gold Cost** in real-time.
* 💾 **Share & Import (Base64):** Generate a secure code of your current setup (Bank, Cart, Pipeline) to instantly share with guildmates or transfer between devices.
* 🚀 **Discord Dispatch:** Generates a beautifully formatted Markdown work order—separating Market Purchases from Manual Gathering—ready to be beamed directly to your guild's Discord server via Webhook.
* 📱 **PWA Ready:** Installable as a Progressive Web App on Desktop or Mobile. Fully cached for offline use.

---

## 🛠️ Architecture & Tech Stack

This project is built using **100% Vanilla Web Technologies** (HTML, CSS, JS). No external frameworks or dependencies are required, making it incredibly fast and easy to host anywhere.

### Modular Codebase
The core logic has been split into dedicated, maintainable modules:
* `data.js`: Houses the `EXTRACTION_ROUTES` and `RECIPES` dictionaries. Contains all the raw MO2 math, yields, and catalyst requirements.
* `engine.js`: The algorithmic brain. Topologically sorts required materials and dynamically builds the step-by-step pipeline.
* `pipeline.js`: Handles interactive step toggling, global routing overrides, and progress bar visualization.
* `market_bank.js`: Manages the interactive grid, math, and UI for the Inventory Bank and Market Cart.
* `discord.js`: Parses current state into Markdown and pushes payloads via the Discord Webhook API.
* `state.js`: Handles all `localStorage` saving, loading, and Base64 import/export logic.
* `theme.js` & `ui.js`: Controls custom hex-color theming, Light/Dark mode, modal popups, and module visibility.
* `lang.js`: Complete i18n support (currently English and French).

---

## 🚀 Installation & Usage

Because this is a static, client-side application, deployment is instant.

### Local Usage
1. Clone or download this repository.
2. Open `index.html` in any modern web browser.

### Hosting (GitHub Pages / Netlify / Vercel)
1. Push the repository to your preferred Git host.
2. Enable static hosting pointing to the root directory.
3. The included `sw.js` (Service Worker) and `manifest.json` will automatically allow users to install the app directly to their devices.

---

## 📖 Quick Start Guide

1. **Set Your Objective:** Select your *Target Metal* (e.g., Steel) and desired *Amount*. Set your *Crafters* count to automatically divide the workload.
2. **Check Your Bank:** Input your current inventory into the *Inventory Bank*. 
   > *Tip: If you don't know what to make, enter your materials and click **⚡ Calculate Craftable From Inventory** to see your limits.*
3. **Go Shopping:** Check the *Market Cart* module. Set local prices, then click **🛒 Auto-Fill All** to calculate your missing deficit and required gold budget.
4. **Dispatch the Order:** Review the *Deficit to Gather* and *Manufacturing Pipeline*. Go to **Settings > Integrations** and push the order to your Discord logistics channel.

---

## 🎨 Customization

Navigate to the **Settings** menu to fully personalize your Quartermaster Command:
* Toggle between Light Mode and Dark Mode.
* Set custom hex values for the Primary Accent, Background, and Text colors.
* Hide or show specific modules to streamline your dashboard.
* Switch between **Units** or **Stacks (10k)** display formats.

---

## 📜 License & Credits

* **Author:** Created by [MTM] Jaegh for the MERCANTORM guild.
* **Game:** Mortal Online 2 by Star Vault AB. (This tool is a fan-made project and is not affiliated with Star Vault).

---
*Happy Refining.*

# ⚔️ Quartermaster Command

![Version](https://img.shields.io/badge/version-v8.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=flat&logo=javascript&logoColor=F7DF1E)
![PWA](https://img.shields.io/badge/PWA-Ready-success)

**Quartermaster Command** (anciennement *Jaegh's Refining Suite*) est l'ultime calculateur de fabrication et tableau de bord logistique pour **Mortal Online 2**. Conçu pour les quartiers-maîtres de guilde, les récolteurs et les maîtres artisans, cette suite gère les mathématiques complexes d'extraction, la budgétisation du marché et l'expédition des bons de travail dans une interface élégante et utilisable hors ligne.

*"L'acier gagne les batailles, l'argent gagne les guerres."* — [MTM] Jaegh

---

## ✨ Aperçu des Fonctionnalités

* 🧠 **Intelligence du Pipeline :** Cartographie automatiquement les étapes d'extraction, de raffinage et de fusion. Le moteur dynamique calcule s'il faut Concassez, Broyer ou Cuire selon vos préférences globales (⭐ Plus Efficace vs 💎 Max Sous-produits).
* ⚡ **Calculer la Production Possible :** Analyse votre inventaire bancaire actuel pour calculer la quantité maximale absolue du métal ciblé que vous pouvez produire avec votre stock existant.
* 🛒 **Panier Intelligent :** Entrez les prix du marché local et les quantités d'achat. Utilisez *Tout Remplir* pour calculer exactement combien vous devez acheter pour combler un déficit, en suivant votre **Coût Total en Or** en temps réel.
* 💾 **Partager & Importer (Base64) :** Générez un code sécurisé de votre configuration actuelle (Banque, Panier, Pipeline) pour le partager instantanément avec vos camarades de guilde ou le transférer entre vos appareils.
* 🚀 **Envoi Discord :** Génère un ordre de travail Markdown magnifiquement formaté, séparant les Achats au Marché de la Récolte Manuelle, prêt à être envoyé directement sur le serveur Discord de votre guilde via Webhook.
* 📱 **PWA Ready :** Installable en tant que Progressive Web App (Application Web Progressive) sur bureau ou mobile. Entièrement mis en cache pour une utilisation hors ligne.

---

## 🛠️ Architecture et Stack Technique

Ce projet est construit en utilisant **100% de Technologies Web Vanilla** (HTML, CSS, JS). Aucun framework ou dépendance externe n'est requis, ce qui le rend incroyablement rapide et facile à héberger n'importe où.

### Base de code modulaire
La logique de base a été divisée en modules dédiés et maintenables :
* `data.js` : Contient les dictionnaires `EXTRACTION_ROUTES` et `RECIPES`. Contient toutes les mathématiques brutes de MO2, les rendements et les exigences en catalyseurs.
* `engine.js` : Le cerveau algorithmique. Trie topologiquement les matériaux requis et construit dynamiquement le pipeline étape par étape.
* `pipeline.js` : Gère l'activation interactive des étapes, les remplacements de routage globaux et la visualisation de la barre de progression.
* `market_bank.js` : Gère la grille interactive, les mathématiques et l'interface utilisateur pour la Banque d'Inventaire et le Panier.
* `discord.js` : Analyse l'état actuel en Markdown et pousse les données via l'API Webhook de Discord.
* `state.js` : Gère toute la logique de sauvegarde, de chargement du `localStorage` et d'import/export Base64.
* `theme.js` & `ui.js` : Contrôle la personnalisation des couleurs hexadécimales, le mode Jour/Nuit, les fenêtres modales et la visibilité des modules.
* `lang.js` : Support i18n complet (actuellement Anglais et Français).

---

## 🚀 Installation et Utilisation

Comme il s'agit d'une application statique côté client, le déploiement est instantané.

### Utilisation Locale
1. Clonez ou téléchargez ce dépôt.
2. Ouvrez `index.html` dans n'importe quel navigateur web moderne.

### Hébergement (GitHub Pages / Netlify / Vercel)
1. Poussez le dépôt sur votre hébergeur Git préféré.
2. Activez l'hébergement statique pointant vers le répertoire racine.
3. Le fichier `sw.js` (Service Worker) et le `manifest.json` inclus permettront automatiquement aux utilisateurs d'installer l'application directement sur leurs appareils.

---

## 📖 Guide de Démarrage Rapide

1. **Définissez votre Objectif :** Sélectionnez votre *Métal Cible* (ex. Acier) et la *Quantité* désirée. Définissez le nombre d'*Artisans* pour diviser automatiquement la charge de travail.
2. **Vérifiez votre Banque :** Entrez votre inventaire actuel dans la *Banque d'Inventaire*. 
   > *Astuce : Si vous ne savez pas quoi fabriquer, entrez vos matériaux et cliquez sur **⚡ Calculer la production possible** pour voir vos limites.*
3. **Faites vos Achats :** Consultez le module *Panier*. Définissez les prix locaux, puis cliquez sur **🛒 Tout Remplir** pour calculer votre déficit manquant et votre budget en or requis.
4. **Envoyez l'Ordre :** Passez en revue le *Déficit à Récolter* et le *Pipeline de Fabrication*. Allez dans **Paramètres > Intégrations** et poussez l'ordre sur votre canal logistique Discord.

---

## 🎨 Personnalisation

Naviguez vers le menu **Paramètres** pour personnaliser entièrement votre Quartermaster Command :
* Basculez entre le mode Clair et le mode Sombre.
* Définissez des valeurs hexadécimales personnalisées pour les couleurs d'Accent Primaire, de Fond et de Texte.
* Masquez ou affichez des modules spécifiques pour épurer votre tableau de bord.
* Basculez entre les formats d'affichage **Unités** ou **Piles (10k)**.

---

## 📜 Licence et Crédits

* **Auteur :** Créé par [MTM] Jaegh pour la guilde MERCANTORM.
* **Jeu :** Mortal Online 2 par Star Vault AB. (Cet outil est un projet créé par un fan et n'est pas affilié à Star Vault).

---
*Bon raffinage.*
