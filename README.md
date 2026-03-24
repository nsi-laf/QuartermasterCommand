# \# ⚔️ Quartermaster Command v5.3

# > \*\*The ultimate Mortal Online 2 manufacturing calculator and logistics dashboard.\*\* > \*Designed and developed by Jaegh.\*

# 

# \*\*Quartermaster Command\*\* is a client-side web application designed for MO2 Guild Leaders, Quartermasters, and Logistics Officers. It instantly calculates exact raw material requirements, multi-stage manufacturing pipelines, and market costs needed to produce any advanced metal (like Steel, Tungsteel, or Oghmium), factoring in your existing bank stock, character skills, and extraction strategies.

# 

# \---

# 

# \## 🌟 Feature Overview

# 

# | Feature | Description |

# | :--- | :--- |

# | 🧠 \*\*Pipeline Intelligence\*\* | Automatically maps out multi-step extraction, refining, and smelting tasks. Skips steps if you already have intermediate materials (like Pig Iron or Calx Powder) in your bank. |

# | ⚡ \*\*Calculate Craftable\*\* | A powerful solver that scans your current bank inventory and calculates the absolute maximum amount of your target metal you can produce with what you have on hand. |

# | 🛒 \*\*Smart Market Cart\*\* | Enter market prices and buy quantities. Use per-item `Fill` / `Clear` buttons, or click `🛒 Auto-Fill All` to instantly calculate how much you need to buy and the \*\*Total Gold Cost\*\*. |

# | 📋 \*\*Discord Dispatch\*\* | Generates a beautifully formatted Markdown work order—separating Market Purchases (with gold totals) from Manual Gathering tasks—ready to paste directly into your guild's Discord. |

# | 📦 \*\*Category-Sorted Bank\*\* | Your inventory is cleanly sorted by categories (Raw Materials, Catalysts, Ores, Refined Metals) for rapid data entry. The metal you are actively trying to craft is intelligently hidden to prevent circular logic. |

# | 💾 \*\*Persistent Data\*\* | Remembers your inventory, market prices, and UI settings automatically using LocalStorage. No database or login required. |

# | 🌍 \*\*Massive Localization\*\* | Fully localized and instantly toggleable between \*\*15 languages\*\*: Arabic, Czech, Deutsch, English, Español, Français, Italia, Magyar, Polski, Português, Română, Russian, Suomi, Svenska, and Türkçe. |

# 

# \---

# 

# \## 📖 How to Use

# 

# \*\*1. Set Your Objective\*\*

# \* Select your \*\*Target Metal\*\* (e.g., Steel, Tungsteel).

# \* Enter your desired \*\*Amount\*\*. Toggle between `Units` or `Stacks (10k)` in the settings for easier reading.

# \* Set your \*\*Crafters\*\* count to automatically divide the workload steps across your team.

# 

# \*\*2. Check Your Bank\*\*

# \* Input your current inventory into the \*\*Inventory Bank\*\* section.

# \* \*Tip: Use the `+10k` or `+1 Stk` quick-add buttons for rapid data entry.\*

# \* \*Tip: Don't know what to make? Enter your materials and click \*\*⚡ Calculate Craftable From Inventory\*\* to see your limits.\*

# 

# \*\*3. Go Shopping \& Calculate Gold\*\*

# \* Check the \*\*Market Cart\*\* module. Set your local server prices.

# \* Click \*\*🛒 Auto-Fill All\*\* to automatically buy your entire missing deficit.

# \* Check the bottom of the cart to see your \*\*Total Gold Cost\*\* before sending a buyer to the broker.

# 

# \*\*4. Dispatch the Order\*\*

# \* Review the \*\*Deficit to Gather\*\* panel for what needs to be manually mined.

# \* Review the \*\*Manufacturing Pipeline\*\* for your exact step-by-step processing instructions. 

# \* Click \*\*⚙️ Settings > 📤 Integrations > 📋 Copy to Clipboard\*\* and paste the resulting text directly into your guild's logistics channel, or use a Webhook to send it instantly.

# 

# \---

# 

# \## 💬 Example Discord Output

# 

# When you click the Dispatch button, it generates a clean, readable order for your guildmates:

# 

# ```text

# \*\*⚔️ LOGISTICS ORDER: STEEL ⚔️\*\*

# \*Targeting 10.00 Stacks of Steel\*

# 

# \*\*CURRENT BANK STOCK:\*\*

# \- Granum: 5.00 Stacks

# \- Calx: 2.00 Stacks

# 

# \*\*MARKET PURCHASES:\*\*

# \- Coal: 1.50 Stacks

# Total Budget: 25.00 g

# 

# \*\*MANUAL GATHER REQUIRED:\*\*

# \- Granum: 11.52 Stacks

# \- Saburra: 5.23 Stacks

# 

# Total: 16.75 Stacks to Gather

# 

# \*\*MANUFACTURING PIPELINE:\*\*

# 1\. \[ ] Extract 2.00 Stacks Calx yields 1.44 Stacks Calx Powder

# 2\. \[ ] Extract 16.52 Stacks Granum yields 5.51 Stacks Blood Ore

# 3\. \[ ] Smelt 5.51 Stacks Blood Ore and 1.50 Stacks Coal yields 2.21 Stacks Pig Iron

# ...

