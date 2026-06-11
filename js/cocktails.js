/* ═══════════════════════════════════════════════
   Bar·San — Cocktail Database
   35 drinks · 7 glass types · full flavor profiles
   flavors: [abv, sweet, sour, bitter, salty, creamy]
═══════════════════════════════════════════════ */
const COCKTAILS = {

  /* ── SPIRIT-FORWARD ── */
  "Martini Extrême":    { acid:15, fruit:5,  complexity:90, type:"Spirit-forward · Dry",     glass:"martini",   fill:.74, garnish:"olive",  ingredients:["Premium London Dry gin","Dry vermouth","Castelvetrano olive","Lemon twist","Saline solution"],         flavors:[90,5,12,38,22,0] },
  "Dirty Martini":      { acid:18, fruit:5,  complexity:80, type:"Spirit-forward · Saline",   glass:"martini",   fill:.72, garnish:"olive",  ingredients:["Vodka or gin","Dry vermouth","Olive brine","Green olives","Sea salt flakes"],                           flavors:[88,4,8,30,60,0] },
  "Negroni":            { acid:30, fruit:28, complexity:95, type:"Bitter · Herbal",            glass:"rocks",     fill:.68, garnish:"twist",  ingredients:["London Dry gin","Campari","Sweet vermouth","Orange zest","Sphere ice"],                                 flavors:[72,28,18,90,8,0] },
  "Boulevardier":       { acid:25, fruit:30, complexity:90, type:"Bitter · Warming",           glass:"rocks",     fill:.68, garnish:"twist",  ingredients:["Bourbon whiskey","Campari","Sweet vermouth","Orange peel","Large ice cube"],                             flavors:[75,32,14,85,6,0] },
  "Old Fashioned":      { acid:10, fruit:15, complexity:70, type:"Spirit-forward · Classic",   glass:"rocks",     fill:.65, garnish:"twist",  ingredients:["Rye or bourbon","Demerara syrup","Angostura bitters","Orange zest","Sphere ice"],                       flavors:[85,22,8,40,10,0] },
  "Sazerac":            { acid:8,  fruit:10, complexity:85, type:"Anise · Complex",             glass:"rocks",     fill:.60, garnish:"twist",  ingredients:["Rye whiskey","Peychaud's bitters","Demerara syrup","Absinthe rinse","Lemon zest"],                      flavors:[88,18,5,55,6,0] },
  "Vieux Carré":        { acid:20, fruit:25, complexity:95, type:"Spirit-forward · Herbal",    glass:"rocks",     fill:.68, garnish:"twist",  ingredients:["Rye whiskey","Cognac","Sweet vermouth","Bénédictine","Bitters"],                                        flavors:[80,30,14,60,8,0] },

  /* ── SOUR FAMILY ── */
  "Margarita":          { acid:88, fruit:40, complexity:50, type:"Tart · Classic",             glass:"martini",   fill:.78, garnish:"salt",   ingredients:["Blanco tequila","Triple sec","Fresh lime juice","Celery salt rim","Lime wheel"],                        flavors:[55,22,88,18,42,0] },
  "Whisky Sour":        { acid:72, fruit:32, complexity:65, type:"Balanced · Frothy",          glass:"rocks",     fill:.70, garnish:"foam",   ingredients:["Bourbon","Fresh lemon juice","Simple syrup","Egg white","Angostura bitters"],                           flavors:[62,30,70,25,5,8] },
  "Daiquiri":           { acid:80, fruit:55, complexity:45, type:"Crisp · Citrus",             glass:"coupe",     fill:.76, garnish:"none",   ingredients:["White rum","Fresh lime juice","Fine cane sugar","Lime zest","Saline drops"],                            flavors:[52,28,80,10,8,0] },
  "Pisco Sour":         { acid:75, fruit:38, complexity:60, type:"Frothy · Citrus",            glass:"coupe",     fill:.74, garnish:"foam",   ingredients:["Pisco","Fresh lemon juice","Simple syrup","Egg white","Angostura bitters"],                             flavors:[55,32,72,18,5,10] },
  "Gimlet":             { acid:82, fruit:42, complexity:40, type:"Sharp · Clean",              glass:"coupe",     fill:.72, garnish:"twist",  ingredients:["London Dry gin","Fresh lime juice","Simple syrup","Lime wheel","Sea salt"],                             flavors:[58,24,82,12,8,0] },
  "Paloma":             { acid:70, fruit:75, complexity:42, type:"Citrus · Sparkling",         glass:"highball",  fill:.80, garnish:"straw",  ingredients:["Blanco tequila","Fresh grapefruit juice","Sparkling water","Agave syrup","Salt rim"],                   flavors:[42,35,68,14,38,0] },
  "Tommy's Margarita":  { acid:85, fruit:38, complexity:35, type:"Pure · Tequila-forward",     glass:"rocks",     fill:.70, garnish:"none",   ingredients:["Blanco tequila","Fresh lime juice","Agave syrup","Lime wheel","Sea salt"],                              flavors:[58,18,85,8,15,0] },

  /* ── FRESH & SPARKLING ── */
  "Mojito Cubano":      { acid:72, fruit:60, complexity:40, type:"Fresh · Mint",               glass:"highball",  fill:.82, garnish:"straw",  ingredients:["White rum","Fresh lime","Fresh mint","Cane sugar","Sparkling water"],                                   flavors:[38,50,68,8,4,0] },
  "Spritz Vénitien":    { acid:55, fruit:70, complexity:58, type:"Sparkling · Gently bitter",  glass:"wine",      fill:.72, garnish:"straw",  ingredients:["Aperol","Prosecco","Sparkling water","Orange slice","Green olive"],                                     flavors:[24,42,48,55,6,0] },
  "Hugo":               { acid:38, fruit:80, complexity:35, type:"Floral · Light",             glass:"wine",      fill:.74, garnish:"straw",  ingredients:["Elderflower liqueur","Prosecco","Fresh mint","Sparkling water","Lime"],                                  flavors:[18,72,32,8,2,0] },
  "French 75":          { acid:65, fruit:45, complexity:70, type:"Elegant · Sparkling",        glass:"flute",     fill:.78, garnish:"twist",  ingredients:["London Dry gin","Fresh lemon juice","Simple syrup","Champagne","Lemon zest"],                           flavors:[45,28,62,18,5,0] },
  "Aperol Tonic":       { acid:45, fruit:65, complexity:30, type:"Easy · Bitter-sweet",        glass:"wine",      fill:.76, garnish:"straw",  ingredients:["Aperol","Premium tonic water","Orange slice","Ice","Fresh mint"],                                       flavors:[14,48,40,52,4,0] },
  "Kir Royale":         { acid:40, fruit:72, complexity:50, type:"Festive · Berry",            glass:"flute",     fill:.80, garnish:"none",   ingredients:["Crème de cassis","Champagne","Blackcurrant","Lemon zest","Ice"],                                        flavors:[18,68,35,10,2,0] },

  /* ── TROPICAL ── */
  "Piña Colada":        { acid:22, fruit:95, complexity:35, type:"Creamy · Tropical",          glass:"hurricane", fill:.82, garnish:"straw",  ingredients:["White rum","Coconut cream","Fresh pineapple","Coconut milk","Lime"],                                    flavors:[38,82,18,5,5,75] },
  "Mai Tai":            { acid:55, fruit:88, complexity:68, type:"Complex · Tropical",         glass:"hurricane", fill:.78, garnish:"straw",  ingredients:["Aged rum","Orange curaçao","Orgeat","Fresh lime","Angostura bitters"],                                   flavors:[52,70,55,18,5,8] },
  "Sex on the Beach":   { acid:50, fruit:90, complexity:28, type:"Sweet · Fruity",             glass:"highball",  fill:.80, garnish:"straw",  ingredients:["Vodka","Peach schnapps","Orange juice","Cranberry juice","Ice"],                                        flavors:[32,88,45,5,4,0] },
  "Blue Lagoon":        { acid:48, fruit:85, complexity:25, type:"Sweet · Tropical",           glass:"highball",  fill:.80, garnish:"straw",  ingredients:["Vodka","Blue curaçao","Lemonade","Lime juice","Ice"],                                                   flavors:[28,82,44,5,3,0] },
  "Jungle Bird":        { acid:60, fruit:82, complexity:72, type:"Tropical · Bitter",          glass:"rocks",     fill:.72, garnish:"none",   ingredients:["Dark rum","Campari","Pineapple juice","Fresh lime","Demerara syrup"],                                   flavors:[50,60,55,60,5,0] },

  /* ── CREAMY & SMOOTH ── */
  "Espresso Martini":   { acid:32, fruit:15, complexity:65, type:"Creamy · Coffee",            glass:"martini",   fill:.74, garnish:"none",   ingredients:["Vodka","Coffee liqueur","Fresh espresso","Simple syrup","Coffee beans"],                                flavors:[58,45,28,50,5,35] },
  "White Russian":      { acid:10, fruit:12, complexity:30, type:"Creamy · Sweet",             glass:"rocks",     fill:.70, garnish:"none",   ingredients:["Vodka","Coffee liqueur","Heavy cream","Ice","Vanilla extract"],                                         flavors:[48,55,8,30,4,72] },
  "Brandy Alexander":   { acid:8,  fruit:20, complexity:55, type:"Dessert · Creamy",           glass:"coupe",     fill:.72, garnish:"none",   ingredients:["Cognac","Brown crème de cacao","Heavy cream","Nutmeg","Vanilla"],                                       flavors:[52,68,6,18,4,80] },
  "Clover Club":        { acid:65, fruit:50, complexity:60, type:"Frothy · Berry",             glass:"coupe",     fill:.74, garnish:"none",   ingredients:["Gin","Fresh lemon juice","Raspberry syrup","Egg white","Rosé vermouth"],                                flavors:[48,58,62,12,4,15] },

  /* ── WINE-BASED ── */
  "Chablis Réserve":    { acid:62, fruit:18, complexity:72, type:"Mineral · Elegant",          glass:"wine",      fill:.68, garnish:"none",   ingredients:["Chablis","Sparkling water","Cucumber","Dill","Ice"],                                                    flavors:[28,14,58,22,12,0] },
  "Rosé d'Été":         { acid:38, fruit:52, complexity:22, type:"Floral · Light",             glass:"wine",      fill:.72, garnish:"twist",  ingredients:["Sparkling rosé","Lychee","Rose water","Raspberry","Lemon zest"],                                       flavors:[20,58,34,10,4,0] },
  "Sangria Blanche":    { acid:50, fruit:82, complexity:38, type:"Fruity · Refreshing",        glass:"wine",      fill:.76, garnish:"straw",  ingredients:["White wine","Peach","Mint","Apple juice","Sparkling water"],                                            flavors:[18,72,45,8,2,0] },

  /* ── CLASSICS REVISITED ── */
  "Cosmopolitan":       { acid:78, fruit:75, complexity:45, type:"Fruity · Sharp",             glass:"martini",   fill:.74, garnish:"twist",  ingredients:["Citrus vodka","Triple sec","Cranberry juice","Fresh lime","Lemon zest"],                                flavors:[48,38,75,15,5,0] },
  "Aperitivo Sbagliato":{ acid:42, fruit:52, complexity:78, type:"Bitter · Sparkling",         glass:"wine",      fill:.72, garnish:"twist",  ingredients:["Campari","Sweet vermouth","Prosecco","Orange peel","Ice"],                                              flavors:[22,35,35,82,5,0] },
  "Midori Sour":        { acid:70, fruit:88, complexity:32, type:"Sweet-Sour · Melon",         glass:"coupe",     fill:.74, garnish:"twist",  ingredients:["Midori melon liqueur","Fresh lemon juice","Vodka","Simple syrup","Egg white"],                          flavors:[32,78,68,8,4,8] },
  "Last Word":          { acid:78, fruit:60, complexity:88, type:"Balanced · Herbal",          glass:"coupe",     fill:.72, garnish:"none",   ingredients:["London Dry gin","Green Chartreuse","Maraschino liqueur","Fresh lime juice","Ice"],                      flavors:[58,45,75,42,5,0] },
};

/* flavor key: [abv, sweet, sour, bitter, salty, creamy] */
const FLAVOR_KEYS = ['abv','sweet','sour','bitter','salty','creamy'];
const FLAVOR_IDS  = ['abv','0','sour','1','salty','2'];
const names = Object.keys(COCKTAILS);
