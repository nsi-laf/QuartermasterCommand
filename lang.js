const baseItems = {
    granum: "Granum", calx: "Calx", saburra: "Saburra", tephra: "Tephra", bor: "Bor",
    sp: "Saburra Powder", cp: "Calx Powder",
    bo: "Blood Ore", gs: "Grain Steel",
    cuprum: "Cuprum", bron: "Bron", messing: "Messing", tmessing: "Tindremic Messing", tungsteel: "Tungsteel", cronite: "Cronite", oghmium: "Oghmium",
    amarantum: "Amarantum", flakestone: "Flakestone", granumpowder: "Granum Powder", malachite: "Malachite", bleckblende: "Bleckblende", calamine: "Calamine",
    jadeite: "Jadeite", calspar: "Calspar", galbinum: "Galbinum", redbleckblende: "Red Bleckblende", pyroxene: "Pyroxene", almine: "Almine", acronite: "Acronite",
    sanguinite: "Sanguinite", fumingsalt: "Fuming Salt", lupium: "Lupium", gemmetal: "Gem Metal"
};

const i18n = {
    en: {
        tabPrefs: "Preferences", tabInteg: "Integrations", tabData: "Data", tabHelp: "Help", tabView: "View", 
        resetDesc: "Clear all your saved bank inventory, market cart quantities, and targets.",
        shareTitle: "Share / Import Setup", shareDesc: "Generate a code to share your current bank, market cart, and target with others, or paste a code to load theirs.",
        btnGenCode: "📤 Generate & Copy", btnLoadCode: "📥 Load Code", importSuccess: "Setup loaded successfully!", importError: "Invalid code provided.", exportSuccess: "Code copied to clipboard!",
        themeToggle: "☀️ / 🌙 Toggle Day/Night Mode", format: "Display Format", optUnits: "Units", optStacks: "Stacks (10k)", webhook: "Discord Webhook URL",
        prodCmd: "Production Command", targetMetalLabel: "Target Resource", boSource: "Extraction Strategy", optAttractor: "Efficient", optCrusher: "Max Yield", crafters: "Crafters", target: "Amount", 
        btnMaxText: "⚡ Calculate Craftable From Inventory",
        yieldMods: "Yield Modifiers", mastery: "Mastery (+6%)", refining: "Refining (+3%)", extraction: "Extraction (+3%)",
        btnDiscord: "📋 Copy to Clipboard", btnSend: "🚀 Send Order to Discord",
        invBank: "Inventory Bank", showAllBank: "Show All Materials", btnReset: "🧹 Reset All Bank & Cart", defGather: "Deficit to Gather Manually", mfgPipe: "Manufacturing Pipeline", marketCart: "Market Cart", btnAutoFill: "🛒 Auto-Fill All",
        tblPrice: "Price/10k", tblBuy: "Amount to Buy", tblCost: "Cost (g)", tblStash: "Bank + Buy", cartTotal: "Cart Total:",
        noTarget: "No target set.", allCovered: "✅ Bank & Cart cover all raw materials!",
        
        stepCrush: "Crush", stepGrind: "Grind", stepExtract: "Extract from",
        stepFurnace: "Use furnace with", stepBlastFurnace: "Use blast furnace with",
        stepAlloy: "Alloy", stepSmelt: "Smelt", stepBake: "Bake", stepRefine: "Refine",
        stepWhichYields: "which yields", stepYields: "yields", stepAnd: "and", perCrafter: "(Per Crafter)", stepPrefix: "Step",

        resetPrompt: "Reset all bank values and shopping cart to zero?", 
        restartPrompt: "Restart the pipeline? This will un-check all steps and remove their yields from your bank.",
        btnRestart: "🔄 Restart",
        
        discHeader: "⚔️ LOGISTICS ORDER", discReq: "MANUAL GATHER REQUIRED:", discStock: "All gathering covered.", discCopied: "Copied to clipboard!",
        discMarket: "MARKET PURCHASES:", errWebhook: "Please enter a valid Discord Webhook URL.", errSend: "Failed to send to Discord.", sucSend: "Order dispatched to Discord!",
        
        qAdd: "+10k", qAddStk: "+1 Stk", qSub: "-10k", qSubStk: "-1 Stk", byproductsTitle: "RECOVERED BYPRODUCTS",
        
        colorAccent: "Primary Color", colorBg: "Secondary Color", colorText: "Text Color", btnResetColors: "Reset Colors",
        viewProd: "Production Command", viewYield: "Yield Modifiers", viewRoute: "Routing Preferences", viewBank: "Inventory Bank", viewCart: "Market Cart", viewGather: "Deficit to Gather", viewPipe: "Manufacturing Pipeline",

        categories: { raw: "Raw Materials", basicExt: "Basic Extractions", intOre: "Intermediate Ores", advOre: "Advanced Ores", catalyst: "Catalysts", refined: "Refined Metals" },
        items: { ...baseItems, water: "Water", coal: "Coal", coke: "Coke", steel: "Steel", pi: "Pig Iron" },
        helpSubtitle: "The ultimate MO2 manufacturing calculator and logistics dashboard.",
        helpFeatures: "🌟 Feature Overview",
        helpFeat1: "<b>Pipeline Intelligence:</b> Automatically maps out multi-step extraction, refining, and smelting tasks. Skips steps if you already have intermediate materials (like Pig Iron) in your bank.",
        helpFeat2: "<b>Calculate Craftable:</b> Scans your current bank inventory to calculate the absolute maximum amount of target metal you can produce with what you have.",
        helpFeat3: "<b>Smart Market Cart:</b> Enter market prices and buy quantities. Use <i>Auto-Fill All</i> to calculate exactly how much you need to buy and see the <b>Total Gold Cost</b>.",
        helpFeat4: "<b>Share / Import:</b> Generate a Base64 code of your current setup to instantly share with guildmates or transfer between devices.",
        helpFeat5: "<b>Discord Dispatch:</b> Generates a beautifully formatted Markdown work order—separating Market Purchases from Manual Gathering—ready to paste directly into Discord.",
        helpHowTo: "📖 How to Use",
        helpHow1: "<b>Set Your Objective:</b> Select your <i>Target Metal</i> (e.g., Steel) and desired <i>Amount</i>. Set your <i>Crafters</i> count to automatically divide the workload.",
        helpHow2: "<b>Check Your Bank:</b> Input your current inventory into the <i>Inventory Bank</i>. <br><i>Tip: If you don't know what to make, enter your materials and click <b>⚡ Calculate Craftable From Inventory</b> to see your limits.</i>",
        helpHow3: "<b>Go Shopping:</b> Check the <i>Market Cart</i> module. Set local prices, then click <b>🛒 Auto-Fill All</b> to calculate your missing deficit and required gold budget.",
        helpHow4: "<b>Dispatch the Order:</b> Review the <i>Deficit to Gather</i> and <i>Manufacturing Pipeline</i>. Go to Settings > Integrations and copy the order to your clipboard for Discord."
    },
    
    fr: {
        tabPrefs: "Préférences", tabInteg: "Intégrations", tabData: "Données", tabHelp: "Aide", tabView: "Affichage",
        resetDesc: "Effacez tout votre inventaire, les quantités du panier et les objectifs.",
        shareTitle: "Partager / Importer", shareDesc: "Générez un code pour partager votre banque, panier et objectif, ou collez un code pour charger celui d'un autre joueur.",
        btnGenCode: "📤 Générer & Copier", btnLoadCode: "📥 Charger", importSuccess: "Configuration chargée avec succès !", importError: "Code invalide.", exportSuccess: "Code copié dans le presse-papiers !",
        themeToggle: "☀️ / 🌙 Mode Jour/Nuit", format: "Format d'affichage", optUnits: "Unités", optStacks: "Piles (10k)", webhook: "URL Webhook Discord",
        prodCmd: "Commande de Production", targetMetalLabel: "Ressource Cible", boSource: "Stratégie d'Extraction", optAttractor: "Efficace", optCrusher: "Rendement Max", crafters: "Artisans", target: "Quantité", 
        btnMaxText: "⚡ Calculer la production possible",
        yieldMods: "Modificateurs", mastery: "Maîtrise (+6%)", refining: "Raffinage (+3%)", extraction: "Extraction (+3%)",
        btnDiscord: "📋 Copier l'ordre", btnSend: "🚀 Envoyer sur Discord",
        invBank: "Banque d'Inventaire", showAllBank: "Afficher Tout", btnReset: "🧹 Réinitialiser Tout", defGather: "Déficit à Récolter", mfgPipe: "Pipeline de Fabrication", marketCart: "Panier", btnAutoFill: "🛒 Tout Remplir",
        tblPrice: "Prix/10k", tblBuy: "Qté à Acheter", tblCost: "Coût (o)", tblStash: "Banque + Achat", cartTotal: "Total Panier :",
        noTarget: "Aucun objectif défini.", allCovered: "✅ La banque couvre tout !",
        
        stepCrush: "Concassez", stepGrind: "Broyez", stepExtract: "Extrayez de",
        stepFurnace: "Utilisez le four avec", stepBlastFurnace: "Utilisez le haut-fourneau avec",
        stepAlloy: "Alliez", stepSmelt: "Fondez", stepBake: "Cuisez", stepRefine: "Raffinez",
        stepWhichYields: "qui produit", stepYields: "produit", stepAnd: "et", perCrafter: "(Par Artisan)", stepPrefix: "Étape",

        resetPrompt: "Réinitialiser toutes les valeurs à zéro ?", 
        restartPrompt: "Redémarrer le pipeline ? Cela décochea toutes les étapes et supprimera leurs rendements de votre banque.",
        btnRestart: "🔄 Redémarrer",
        
        discHeader: "⚔️ ORDRE LOGISTIQUE", discReq: "RÉCOLTE MANUELLE REQUISE :", discStock: "Toute la récolte est couverte.", discCopied: "Copié dans le presse-papiers !",
        discMarket: "ACHATS AU MARCHÉ :", errWebhook: "URL Webhook invalide.", errSend: "Échec de l'envoi.", sucSend: "Ordre envoyé sur Discord !",
        
        qAdd: "+10k", qAddStk: "+1 Pile", qSub: "-10k", qSubStk: "-1 Pile", byproductsTitle: "SOUS-PRODUITS RÉCUPÉRÉS",
        
        colorAccent: "Couleur Primaire", colorBg: "Couleur Secondaire", colorText: "Couleur du Texte", btnResetColors: "Réinitialiser les Couleurs",
        viewProd: "Commande de Production", viewYield: "Modificateurs de Rendement", viewRoute: "Préférences de Routage", viewBank: "Banque d'Inventaire", viewCart: "Panier", viewGather: "Déficit à Récolter", viewPipe: "Pipeline de Fabrication",

        categories: { raw: "Matières Premières", basicExt: "Extractions de Base", intOre: "Minerais Intermédiaires", advOre: "Minerais Avancés", catalyst: "Catalyseurs", refined: "Métaux Raffinés" },
        items: { ...baseItems, water: "Eau", coal: "Charbon", coke: "Coke", steel: "Acier", pi: "Fonte (Pig Iron)" },
        helpSubtitle: "L'ultime calculateur de fabrication et tableau de bord logistique pour MO2.",
        helpFeatures: "🌟 Aperçu des Fonctionnalités",
        helpFeat1: "<b>Intelligence du Pipeline :</b> Cartographie automatiquement les étapes d'extraction, de raffinage et de fusion. Ignore les étapes si vous possédez déjà des matériaux intermédiaires (comme la Fonte) en banque.",
        helpFeat2: "<b>Calculer la Production Possible :</b> Analyse votre inventaire bancaire actuel pour calculer la quantité maximale absolue du métal ciblé que vous pouvez produire avec ce que vous avez.",
        helpFeat3: "<b>Panier Intelligent :</b> Entrez les prix du marché et les quantités d'achat. Utilisez <i>Tout Remplir</i> pour calculer exactement combien vous devez acheter et voir le <b>Coût Total en Or</b>.",
        helpFeat4: "<b>Partager / Importer :</b> Générez un code Base64 de votre configuration actuelle pour la partager instantanément avec vos camarades de guilde ou la transférer entre vos appareils.",
        helpFeat5: "<b>Envoi Discord :</b> Génère un ordre de travail Markdown magnifiquement formaté, séparant les achats au marché de la récolte manuelle, prêt à être collé directement dans Discord.",
        helpHowTo: "📖 Comment utiliser",
        helpHow1: "<b>Définissez votre Objectif :</b> Sélectionnez votre <i>Métal Cible</i> (ex. Acier) et la <i>Quantité</i> désirée. Définissez le nombre d'<i>Artisans</i> pour diviser automatiquement la charge de travail.",
        helpHow2: "<b>Vérifiez votre Banque :</b> Entrez votre inventaire actuel dans la <i>Banque d'Inventaire</i>. <br><i>Astuce : Si vous ne savez pas quoi fabriquer, entrez vos matériaux et cliquez sur <b>⚡ Calculer la production possible</b> pour voir vos limites.</i>",
        helpHow3: "<b>Faites vos Achats :</b> Consultez le module <i>Panier</i>. Définissez les prix locaux, puis cliquez sur <b>🛒 Tout Remplir</b> pour calculer votre déficit manquant et votre budget en or requis.",
        helpHow4: "<b>Envoyez l'Ordre :</b> Passez en revue le <i>Déficit à Récolter</i> et le <i>Pipeline de Fabrication</i>. Allez dans Paramètres > Intégrations et copiez l'ordre dans votre presse-papiers pour Discord."
    }
};