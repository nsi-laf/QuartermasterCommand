# Quartermaster Command
**The Ultimate Mortal Online 2 Refining Suite & Logistics Dashboard**

Quartermaster Command is an advanced, offline-capable Progressive Web Application (PWA) designed to calculate, track, and dispatch complex metallurgy and extraction pipelines in Mortal Online 2. 

Made by **[MTM] Jaegh** for the MERCANTORM guild.

## 🌟 Key Features

* **Pipeline Intelligence:** Automatically maps out multi-step extraction, refining, and smelting tasks for complex metals like Steel, Tungsteel, and Oghmium.
* **Dynamic Recipe Routing:** Force the calculation engine to prioritize the **[E] Efficient Path** (lowest material cost), **[Y] Max Yield** (highest byproduct generation), or utilize **[R] Region Locked** machinery.
* **Calculate Max Craftable:** Instantly calculates the absolute maximum amount of a target metal you can craft using strictly the materials currently in your inventory.
* **Smart Market Cart:** Enter local market prices and desired buy quantities. The "Auto-Fill" system calculates exactly what you are missing and tracks total gold expenditure.
* **Discord Dispatch:** Automatically generates a beautifully formatted Markdown work order—separating Market Purchases from Manual Gathering—ready to be pushed directly to a Discord Webhook.
* **Bilingual Support:** Fully translated into both English (EN) and French (FR).
* **Deep Customization:** Toggle Dark/Light modes, adjust primary/secondary accent colors, and hide modules you don't actively need.
* **Shareable States:** Export your current inventory, cart, and goals to a short string code to share with other crafters, or export directly to a CSV file.

## 🚀 Installation & Setup

Quartermaster Command is a static, client-side application. No backend server or database is required.

1. **Local Use:** Simply download the repository and double-click `index.html` to open it in any modern web browser.
2. **Web Hosting:** Upload the files to any static file host (e.g., GitHub Pages, Vercel, Netlify). 
3. **Mobile / App Install:** Because this app includes a `manifest.json` and a Service Worker (`sw.js`), visiting the hosted URL on a mobile device will prompt you to "Add to Home Screen", installing it as a native offline app.

## 📂 Project Structure

* `/index.html` - The core application layout and UI framework.
* `/styles.css` - Custom styling, responsive mobile grids, and theme variables.
* `/js/app.js` - Main initialization and DOM interaction logic.
* `/js/engine.js` - The heavy-lifting recursive extraction and recipe resolution math.
* `/js/data.js` - Database containing all MO2 item categories, prices, recipes, and yield tables.
* `/js/lang.js` - Bilingual translation dictionary.
* `/js/market_bank.js` - Inventory, shopping cart, and search filtering logic.
* `/js/pipeline.js` - Logic for checking off steps, routing path choices, and progress bar updates.
* `/js/ui.js` - Modal triggers, sidebar toggles, and UI interactions.
* `/js/state.js` - LocalStorage saving/loading mechanisms.
* `/js/discord.js` - Webhook payload generation and string formatting.
* `/js/theme.js` - Dark/Light mode and custom color hex handlers.
* `/sw.js` - Service Worker for offline PWA caching.
