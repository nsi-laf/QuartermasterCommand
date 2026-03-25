const baseItems = {
    granum: "Granum", calx: "Calx", saburra: "Saburra", tephra: "Tephra", bor: "Bor", gabore: "Gabore", kimurite: "Kimurite", lodestone: "Lodestone", risensacrificecarcass: "Risen Sacrifice",
    sp: "Saburra Powder", cp: "Calx Powder", gaborepowder: "Gabore Powder", lodestonepowder: "Lodestone Powder",
    bo: "Blood Ore", gs: "Grain Steel",
    cuprum: "Cuprum", bron: "Bron", messing: "Messing", tmessing: "Tindremic Messing", tungsteel: "Tungsteel", cronite: "Cronite", oghmium: "Oghmium",
    amarantum: "Amarantum", flakestone: "Flakestone", granumpowder: "Granum Powder", malachite: "Malachite", bleckblende: "Bleckblende", calamine: "Calamine",
    jadeite: "Jadeite", calspar: "Calspar", galbinum: "Galbinum", redbleckblende: "Red Bleckblende", pyroxene: "Pyroxene", almine: "Almine", acronite: "Acronite",
    sanguinite: "Sanguinite", fumingsalt: "Fuming Salt", lupium: "Lupium", gemmetal: "Gem Metal",
    tallow: "Tallow", dragonsalt: "Dragon Salt", ichor: "Ichor", sulfur: "Sulfur", rockoil: "Rock Oil",
    bleck: "Bleck", chalkglance: "Chalk Glance", cinnabar: "Cinnabar", magmum: "Magmum", aabam: "Aabam",
    gold: "Gold", silver: "Silver", skadite: "Skadite", pitch: "Pitch", kyanite: "Kyanite", maalite: "Maalite", 
    pyropite: "Pyropite", nyx: "Nyx", volcanicash: "Volcanic Ash", waterstone: "Waterstone", ritualash: "Ritual Ash", pyrite: "Pyrite",
    water: "Water", coal: "Coal", coke: "Coke", steel: "Steel", pi: "Pig Iron"
};

const i18n = {
    en: {
        tabPrefs: "Preferences", tabData: "Data", tabHelp: "Help", tabView: "View", tabGuide: "Guide", tabLegend: "Legend",
        resetDesc: "Clear all your saved inventory, market cart quantities, and targets.",
        shareTitle: "Share / Import Setup", shareDesc: "Generate a code to share your current inventory, market cart, and target with others, or paste a code to load theirs.",
        btnGenCode: "📤 Generate & Copy", btnLoadCode: "📥 Load Code", importSuccess: "Setup loaded successfully!", importError: "Invalid code provided.", exportSuccess: "Code copied to clipboard!",
        format: "Display Format", optUnits: "Units", optStacks: "Stacks (10k)", webhook: "Discord Webhook URL",
        
        btnProd: "Production", prodCmdTitle: "Production Command", targetMetalLabel: "Target Resource", crafters: "Crafters", target: "Amount", 
        
        btnAutoFill: "🛒 Auto-Fill", btnClearCart: "🧹 Clear",
        yieldMods: "Yield Modifiers", mastery: "Mastery (+6%)", refining: "Refining (+3%)", extraction: "Extraction (+3%)",
        btnDiscord: "📋 Copy to Clipboard", btnSend: "🚀 Send Order to Discord",
        invBank: "Inventory", invBankTitle: "Inventory", showAllBank: "Show All Materials", showAllCart: "Show All Materials", btnReset: "🧹 Reset All", defGather: "Missing Components", mfgPipe: "Manufacturing Pipeline", marketCart: "Market Cart", marketCartTitle: "Market Cart",
        tblPrice: "Price/10k", tblBuy: "Amount to Buy", tblCost: "Cost (g)", tblStash: "Stock + Buy", cartTotal: "Cart Total:",
        noTarget: "No target set.", allCovered: "✅ Inventory & Cart cover all required materials!",
        searchPlaceholder: "Search...",
        
        verbCrush: "Crush", verbGrind: "Grind", verbExtract: "Extract", verbSmelt: "Smelt", verbBake: "Bake", verbAlloy: "Alloy", verbProcess: "Process",
        inMachine: "in the", stepWith: "with", stepAnd: "and", perCrafter: "(Per Crafter)", stepPrefix: "Step",
        stepYieldsMain: "Yields:", stepByproducts: "Byproducts:",
        
        pipeCompleted: "Production Progress",
        btnPipeReset: "Reset",

        tooltipBestYield: "Most Efficient (Lowest Total Material Cost)", tooltipMaxYield: "Max Byproducts Generated", tooltipRegionLocked: "Region Locked Machine",

        resetPrompt: "Reset all inventory values and shopping cart to zero?", 
        restartPrompt: "Restart the pipeline? This will un-check all steps and remove their yields from your inventory.",
        modalActionsTitle: "Pipeline Actions",
        
        discHeader: "⚔️ LOGISTICS ORDER", discReq: "MANUAL GATHER REQUIRED:", discStock: "All gathering covered.", discCopied: "Copied to clipboard!",
        discMarket: "MARKET PURCHASES:", errWebhook: "Please enter a valid Discord Webhook URL.", errSend: "Failed to send to Discord.", sucSend: "Order dispatched to Discord!",
        
        qAdd: "+10k", qAddStk: "+1 Stk", qSub: "-10k", qSubStk: "-1 Stk", byproductsTitle: "TOTAL RECOVERED BYPRODUCTS", bpTitle: "TOTAL RECOVERED BYPRODUCTS", btnBp: "Byproducts", btnPrefEfficient: "Efficiency", btnPrefYield: "Max Yield",
        
        colorAccent: "Primary Color", colorBg: "Secondary Color", colorText: "Text Color", btnResetColors: "Reset Colors to Default",
        viewPers: "Personalization", viewVis: "Module Visibility", viewLang: "Language", viewGather: "Missing Components", viewPipe: "Manufacturing Pipeline",
        btnBank: "Inventory", btnCart: "Cart", btnSettings: "Settings", btnHelp: "Help", btnExportCSV: "📊 Export to CSV", actDiscord: "Discord Dispatch",

        legCP: "CP = Calx Powder", legSP: "SP = Saburra Powder", legBO: "BO = Blood Ore", legPI: "PI = Pig Iron", legGS: "GS = Grain Steel", legStk: "Stk = Stack (10,000 units)",
        
        legBestTxt: "<b>⭐ = Most Efficient Route</b><br><span style=\"color:var(--text-dim); font-size:11px;\">Path that requires the least amount of raw materials.</span>",
        legMaxTxt: "<b>💎 = Max Byproducts Route</b><br><span style=\"color:var(--text-dim); font-size:11px;\">Path that yields the highest amount of secondary materials.</span>",
        legRegionTxt: "<b>🌍 = Region Locked</b><br><span style=\"color:var(--text-dim); font-size:11px;\">Requires a town with specific advanced machinery.</span>",

        categories: { raw: "Raw Materials", basicExt: "Basic Extractions", intOre: "Intermediate Ores", advOre: "Advanced Ores", catalyst: "Catalysts", refined: "Refined Metals" },
        items: baseItems,
        
        helpSubtitle: "The ultimate MO2 manufacturing calculator and logistics dashboard.",
        helpFeatures: "🌟 Feature Overview",
        helpFeat1: "<b>Pipeline Intelligence:</b> Automatically maps out multi-step extraction, refining, and smelting tasks.",
        helpFeat3: "<b>Dynamic Recipe Routing:</b> Use the pipeline menu to force the engine to calculate the <b>⭐ Most Efficient</b> path, or the path with <b>💎 Max Byproducts</b>.",
        helpFeat4: "<b>Smart Market Cart:</b> Enter market prices and buy quantities. Use <i>Auto-Fill</i> to calculate exactly how much you need to buy and see the <b>Total Gold Cost</b>.",
        helpFeat5: "<b>Discord Dispatch:</b> Generates a beautifully formatted Markdown work order—separating Market Purchases from Manual Gathering—ready to paste directly into Discord.",
        helpHowTo: "📖 How to Use",
        helpHow1: "<b>Set Your Objective:</b> Select your <i>Target Metal</i> (e.g., Steel) and desired <i>Amount</i>. Set your <i>Crafters</i> count to automatically divide the workload.",
        helpHow2: "<b>Check Your Inventory:</b> Input your current supply into the <i>Inventory</i>.",
        helpHow3: "<b>Go Shopping:</b> Check the <i>Market Cart</i> module. Set local prices, then click <b>🛒 Auto-Fill</b> in the Cart to calculate your missing deficit.",
        helpHow4: "<b>Dispatch the Order:</b> Review the <i>Missing Components</i> and <i>Manufacturing Pipeline</i>. Push the final order to your Discord via Webhook in the Settings > Data menu."
    },
    
    fr: {
        tabPrefs: "Préférences", tabData: "Données", tabHelp: "Aide", tabView: "Affichage", tabGuide: "Guide", tabLegend: "Légende",
        resetDesc: "Effacez tout votre inventaire, les quantités du panier et les objectifs.",
        shareTitle: "Partager / Importer", shareDesc: "Générez un code pour partager votre inventaire, panier et objectif, ou collez un code pour charger celui d'un autre joueur.",
        btnGenCode: "📤 Générer & Copier", btnLoadCode: "📥 Charger", importSuccess: "Configuration chargée avec succès !", importError: "Code invalide.", exportSuccess: "Code copié dans le presse-papiers !",
        format: "Format d'affichage", optUnits: "Unités", optStacks: "Piles (10k)", webhook: "URL Webhook Discord",
        
        btnProd: "Production", prodCmdTitle: "Commande de Production", targetMetalLabel: "Ressource Cible", crafters: "Artisans", target: "Quantité", 
        
        btnAutoFill: "🛒 Remplir", btnClearCart: "🧹 Vider",
        yieldMods: "Modificateurs", mastery: "Maîtrise (+6%)", refining: "Raffinage (+3%)", extraction: "Extraction (+3%)",
        btnDiscord: "📋 Copier l'ordre", btnSend: "🚀 Envoyer sur Discord",
        invBank: "Inventaire", invBankTitle: "Inventaire", showAllBank: "Afficher Tout", showAllCart: "Afficher Tout", btnReset: "🧹 Réinitialiser Tout", defGather: "Composants Manquants", mfgPipe: "Pipeline de Fabrication", marketCart: "Panier", marketCartTitle: "Panier",
        tblPrice: "Prix/10k", tblBuy: "Qté à Acheter", tblCost: "Coût (o)", tblStash: "Stock + Achat", cartTotal: "Total Panier :",
        noTarget: "Aucun objectif défini.", allCovered: "✅ L'inventaire couvre tout !",
        searchPlaceholder: "Rechercher...",
        
        verbCrush: "Concassez", verbGrind: "Broyez", verbExtract: "Extrayez", verbSmelt: "Fondez", verbBake: "Cuisez", verbAlloy: "Alliez", verbProcess: "Traitez",
        inMachine: "dans le", stepWith: "avec", stepAnd: "et", perCrafter: "(Par Artisan)", stepPrefix: "Étape",
        stepYieldsMain: "Produits :", stepByproducts: "Sous-produits :",

        btnPipeReset: "Réinitialiser",
        pipeCompleted: "Progression de la Production",

        tooltipBestYield: "Plus Efficace (Coût Total le Plus Bas)", tooltipMaxYield: "Maximum de Sous-produits Générés", tooltipRegionLocked: "Machine Limitée par Région",

        resetPrompt: "Réinitialiser toutes les valeurs à zéro ?", 
        restartPrompt: "Redémarrer le pipeline ? Cela décochea toutes les étapes et supprimera leurs rendements de votre inventaire.",
        modalActionsTitle: "Actions du Pipeline",
        
        discHeader: "⚔️ ORDRE LOGISTIQUE", discReq: "RÉCOLTE MANUELLE REQUISE :", discStock: "Toute la récolte est couverte.", discCopied: "Copié dans le presse-papiers !",
        discMarket: "ACHATS AU MARCHÉ :", errWebhook: "URL Webhook invalide.", errSend: "Échec de l'envoi.", sucSend: "Ordre envoyé sur Discord !",
        
        qAdd: "+10k", qAddStk: "+1 Pile", qSub: "-10k", qSubStk: "-1 Pile", byproductsTitle: "SOUS-PRODUITS RÉCUPÉRÉS TOTAL", bpTitle: "SOUS-PRODUITS RÉCUPÉRÉS TOTAL", btnBp: "Sous-produits", btnPrefEfficient: "Efficacité", btnPrefYield: "Rendement Max",
        
        colorAccent: "Couleur Primaire", colorBg: "Couleur Secondaire", colorText: "Couleur du Texte", btnResetColors: "Réinitialiser les Couleurs",
        viewPers: "Personnalisation", viewVis: "Visibilité des Modules", viewLang: "Langue", viewGather: "Composants Manquants", viewPipe: "Pipeline de Fabrication",
        btnBank: "Inventaire", btnCart: "Panier", btnSettings: "Paramètres", btnHelp: "Aide", btnExportCSV: "📊 Exporter CSV", actDiscord: "Envoi Discord",

        legCP: "CP = Calx Powder", legSP: "SP = Saburra Powder", legBO: "BO = Blood Ore", legPI: "PI = Pig Iron", legGS: "GS = Grain Steel", legStk: "Stk = Pile (10,000 unités)",
        
        legBestTxt: "<b>⭐ = Route la Plus Efficace</b><br><span style=\"color:var(--text-dim); font-size:11px;\">Le chemin qui nécessite le moins de matériaux bruts.</span>",
        legMaxTxt: "<b>💎 = Route Max Sous-produits</b><br><span style=\"color:var(--text-dim); font-size:11px;\">Le chemin qui génère le plus de matériaux secondaires.</span>",
        legRegionTxt: "<b>🌍 = Limitée par Région</b><br><span style=\"color:var(--text-dim); font-size:11px;\">Nécessite une ville avec des machines avancées spécifiques.</span>",

        categories: { raw: "Raw Materials", basicExt: "Basic Extractions", intOre: "Intermediate Ores", advOre: "Advanced Ores", catalyst: "Catalysts", refined: "Refined Metals" },
        items: baseItems,
        
        helpSubtitle: "L'ultime calculateur de fabrication et tableau de bord logistique pour MO2.",
        helpFeatures: "🌟 Aperçu des Fonctionnalités",
        helpFeat1: "<b>Intelligence du Pipeline :</b> Cartographie automatiquement les étapes d'extraction, de raffinage et de fusion.",
        helpFeat3: "<b>Routage Dynamique :</b> Utilisez le menu de pipeline pour forcer le moteur à calculer le chemin <b>⭐ Plus Efficace</b>, ou le chemin avec <b>💎 Max Sous-produits</b>.",
        helpFeat4: "<b>Panier Intelligent :</b> Entrez les prix du marché et les quantités d'achat. Utilisez <i>Auto-Fill</i> pour calculer exactement combien vous devez acheter et voir le <b>Coût Total en Or</b>.",
        helpFeat5: "<b>Envoi Discord :</b> Génère un ordre de travail Markdown magnifiquement formaté, séparant les achats au marché de la récolte manuelle, prêt à être collé directement dans Discord.",
        helpHowTo: "📖 Comment utiliser",
        helpHow1: "<b>Définissez votre Objectif :</b> Sélectionnez votre <i>Métal Cible</i> et la <i>Quantité</i> désirée. Définissez le nombre d'<i>Artisans</i> pour diviser automatiquement la charge de travail.",
        helpHow2: "<b>Vérifiez votre Inventaire :</b> Entrez votre stock actuel.",
        helpHow3: "<b>Faites vos Achats :</b> Consultez le module <i>Panier</i>. Définissez les prix locaux, puis cliquez sur <b>🛒 Auto-Fill</b> pour calculer votre déficit manquant.",
        helpHow4: "<b>Envoyez l'Ordre :</b> Passez en revue le <i>Déficit à Récolter</i> et le <i>Pipeline de Fabrication</i>. Allez dans Paramètres > Données et copiez l'ordre dans votre presse-papiers pour Discord."
    }
};