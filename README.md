# ⚔️ Quartermaster Command: Steel Logistics v4.2
> **The ultimate Mortal Online 2 manufacturing calculator and logistics dashboard.** > *Designed and developed by Jaegh.*

**Quartermaster Command** is a client-side web application designed for MO2 Guild Leaders and Logistics Officers. It instantly calculates exact raw material requirements, multi-stage manufacturing steps, and market costs needed to produce any quantity of Steel, factoring in your existing bank stock and character skills.

---

## 🌟 Feature Overview

| Feature | Description |
| :--- | :--- |
| 🧠 **Pipeline Intelligence** | Automatically skips manufacturing steps (like Attracting or Smelting) if you already have intermediate materials like Pig Iron or Grain Steel in your bank. |
| ⚡ **Max Solver** | A one-click engine that calculates the absolute maximum amount of Steel you can produce based strictly on the metals in your current stockpile. |
| 🛒 **Market Cart & Gold Total** | Enter market prices and buy quantities. The app automatically deducts purchased materials from your gathering deficit and calculates the **Total Gold Cost** for your shopping list. |
| 🤖 **Auto-Fill Missing** | One click on `🛒 Auto-Fill Missing` populates your market cart with exactly what you need to finish the batch, giving you an instant gold quote. |
| 📋 **Discord Dispatch** | Generates a perfectly formatted Markdown work order—separating Market Purchases (with gold totals) from Manual Gathering tasks—ready to paste into Discord. |
| 💾 **Persistent Memory** | Uses browser `localStorage` to save your inventory, prices, and UI settings automatically. No database required. |
| 🌍 **Multi-Language** | Fully localized and instantly toggleable between **English, Français, Español, Português, and Deutsch**. |

---

## 📖 How to Use

**1. Set Your Objective**
* Enter your **Target Steel** amount. Toggle between `Units` or `Stacks (10k)` for easier reading.
* Set your **Crafters** count to automatically divide the workload steps.

**2. Check Your Bank**
* Input your current inventory into the **Inventory Bank** section.
* *Tip: Use the `+10k` or `+1 Stk` quick-add buttons for rapid data entry.*

**3. Go Shopping & Calculate Gold**
* Check the **Market Cart** module. Set your local server prices.
* Enter how much of each raw material you want to buy, OR click **🛒 Auto-Fill Missing** to automatically buy your entire deficit.
* Check the **Logistics Stats** panel to see your **Total Gold Cost** before sending a buyer to the broker.

**4. Dispatch the Order**
* Review the **Manufacturing Pipeline** for your exact step-by-step processing instructions. 
* Click **📋 Copy Discord Order** and paste the resulting text directly into your guild's logistics channel.

---

## 💬 Example Discord Output

When you click the Dispatch button, it generates a clean, readable order for your guildmates:

```text
**⚔️ LOGISTICS ORDER: STEEL ⚔️**

**MARKET PURCHASES:**
- Granum: 12.50 Stacks
- Calx: 8.00 Stacks
Total Budget: 467.50 g

**MANUAL GATHER REQUIRED:**
- Saburra: 5.20 Stacks
- Water: 1.50 Stacks

Total: 6.70 Stacks to Gather
