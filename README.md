# ⚔️ Quartermaster Command

![Version](https://img.shields.io/badge/version-v8.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=flat&logo=javascript&logoColor=F7DF1E)
![PWA](https://img.shields.io/badge/PWA-Ready-success)

**Quartermaster Command** is the ultimate manufacturing calculator and logistics dashboard for **Mortal Online 2**. Designed for guild quartermasters, gatherers, and master crafters, this suite handles complex extraction math, market budgeting, and work-order dispatching in a sleek, offline-capable interface.

🇬🇧 **English** | [🇫🇷 **Français (#fr)**](#-version-française)

*"Steel wins battles, silver wins wars."* — [MTM] Jaegh

---

## ✨ Feature Overview | Aperçu des Fonctionnalités

* 🧠 **Pipeline Intelligence:** Automatically maps out multi-step extraction, refining, and smelting tasks.
    * *Cartographie automatiquement les étapes d'extraction, de raffinage et de fusion.*
* ⚡ **Calculate Limit:** Scans your current inventory to calculate the absolute maximum yield.
    * *Analyse votre inventaire pour calculer la production maximale absolue.*
* 🛒 **Smart Market Cart:** Calculate exactly how much you need to buy to cover a deficit.
    * *Calculez exactement ce dont vous avez besoin pour combler un déficit.*
* 🚀 **Discord Dispatch & CSV Export:** Generates beautifully formatted Markdown work orders for Discord Webhooks and exports data to CSV.
    * *Génère des ordres de travail Markdown pour vos Webhooks Discord et exporte vos données en CSV.*
* 📱 **PWA Ready:** Installable on Desktop or Mobile with full offline caching.
    * *Installable sur PC ou Mobile avec un support complet hors ligne.*

---

## 🛠️ Tech Stack | Architecture Technique

This project is built using **100% Vanilla Web Technologies**. No external frameworks are required.
*Ce projet est construit à 100% avec des **Technologies Web Vanilla**.*

* **Logic:** `engine.js` (Algorithmic brain), `data.js` (Yields & Recipes).
* **UI/UX:** `theme.js`, `ui.js`, and `pipeline.js` (Interactive visualization).
* **Storage:** `state.js` (Localstorage & Base64 Import/Export).
* **i18n:** `lang.js` (Support for English and French).

---

## 🚀 Installation & Usage | Utilisation

### 🇬🇧 English
1.  **Local:** Clone the repo and open `index.html` in any browser.
2.  **Hosting:** Deploy to GitHub Pages, Netlify, or Vercel. The `sw.js` will handle PWA installation automatically.

### 🇫🇷 Français
1.  **Local :** Clonez le dépôt et ouvrez `index.html` dans n'importe quel navigateur.
2.  **Hébergement :** Déployez sur GitHub Pages, Netlify ou Vercel. Le fichier `sw.js` gérera l'installation PWA.

---

<a name="fr"></a>

## 🇫🇷 Version Française

### ✨ Aperçu
**Quartermaster Command** est l'ultime calculateur de fabrication et tableau de bord logistique pour **Mortal Online 2**. Conçu pour les quartiers-maîtres de guilde, les récolteurs et les maîtres artisans, cette suite gère les mathématiques complexes d'extraction et la budgétisation du marché.

### 📖 Guide de Démarrage Rapide
1.  **Définissez votre Objectif :** Sélectionnez votre Métal Cible et la Quantité.
2.  **Vérifiez votre Inventaire :** Entrez votre stock actuel pour voir ce que vous pouvez déjà produire. Cliquez sur **⚡ Calculer la limite** pour analyser vos possibilités.
3.  **Faites vos Achats :** Utilisez l'**Auto-Fill** (Remplissage automatique) dans le Panier pour calculer le coût total en or de vos matériaux manquants.
4.  **Envoyez l'Ordre :** Allez dans **Paramètres > Données** pour exporter votre liste en CSV ou poussez l'ordre de travail directement sur votre canal logistique Discord via Webhook.

---

## 🎨 Customization | Personnalisation

Navigate to the **Settings** menu to personalize your experience:
* Toggle **Light/Dark Mode**.
* Set custom **Hex Colors** for the UI (saving independently for light and dark themes).
* Switch between **Units** or **Stacks (10k)** display formats.

*Naviguez vers le menu **Paramètres** pour basculer entre le mode Clair/Sombre, personnaliser les couleurs d'interface (sauvegardées indépendamment par thème), et changer le format d'affichage (Unités ou Piles).*

---

## 📜 License & Credits

* **Author:** Created by [MTM] Jaegh for the **MERCANTORM** guild.
* **Game:** Mortal Online 2 by Star Vault AB. (This tool is a fan-made project and is not affiliated with Star Vault).

---
*Happy Refining. / Bon raffinage.*
