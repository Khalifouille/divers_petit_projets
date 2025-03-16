function calculerIngredients() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuSheet = ss.getSheetByName("🛒 Recettes");
    var stockSheet = ss.getSheetByName("Stock");
  
    if (!menuSheet || !stockSheet) {
      Browser.msgBox("Erreur : Vérifie que les feuilles '🛒 Recettes' et 'Stock' existent.");
      return;
    }
  
    var menuData = menuSheet.getDataRange().getValues();
    var stockData = stockSheet.getDataRange().getValues();
  
    if (menuData.length < 2 || stockData.length < 2) {
      Browser.msgBox("Erreur : Assure-toi que les feuilles contiennent des données.");
      return;
    }
  
    var menusDisponibles = menuData.slice(1).map(row => row[0].replace(/[\u{1F300}-\u{1FAD6}]/gu, "").trim());
  
    var choixMenus = Browser.inputBox("Quels menus veux-tu préparer ?\n" + menusDisponibles.join("\n"), Browser.Buttons.OK_CANCEL);
    if (choixMenus == "cancel") return;
  
    var menusChoisis = choixMenus.split(",").map(m => m.trim());
    var quantitesMenus = {};
  
    menusChoisis.forEach(menu => {
      if (!menusDisponibles.includes(menu)) {
        Browser.msgBox("⚠️ Menu '" + menu + "' non trouvé. Vérifie l'orthographe.");
        return;
      }
      var quantite = Browser.inputBox("Combien de '" + menu + "' veux-tu préparer ?", Browser.Buttons.OK_CANCEL);
      if (quantite == "cancel") return;
      if (isNaN(quantite) || quantite <= 0) {
        Browser.msgBox("Nombre invalide pour " + menu);
        return;
      }
      quantitesMenus[menu] = parseInt(quantite);
    });
  
    var ingredientsNecessaires = {};
  
    for (var j = 1; j < menuData.length; j++) {
      var menuNom = menuData[j][0].replace(/[\u{1F300}-\u{1FAD6}]/gu, "").trim(); 
      var quantiteMenu = quantitesMenus[menuNom] || 0;
  
      if (quantiteMenu > 0) {
        var ingredients = menuData[j][1].split(", ");
        ingredients.forEach(function(ing) {
          var parts = ing.match(/x(\d+) (.+)/); 
  
          if (!parts || parts.length < 3) return; 
  
          var quantite = parseInt(parts[1]);
          var ingredient = parts[2].trim();
  
          if (!ingredientsNecessaires[ingredient]) {
            ingredientsNecessaires[ingredient] = 0;
          }
          ingredientsNecessaires[ingredient] += quantite * quantiteMenu;
        });
      }
    }
  
    var stockDisponible = {};
    for (var k = 1; k < stockData.length; k++) {
      stockDisponible[stockData[k][0]] = parseInt(stockData[k][1]) || 0;
    }
  
    var manquants = "";
  
    for (var ing in ingredientsNecessaires) {
      var besoin = ingredientsNecessaires[ing];
      var dispo = stockDisponible[ing] || 0;
  
      if (besoin > dispo) {
        manquants += "❌ " + ing + " manquant(e) : " + (besoin - dispo) + "\n";
      }
    }
  
    if (manquants) {
      Browser.msgBox("⚠️ **Ingrédients manquants :**\n\n" + manquants);
    } else {
      Browser.msgBox("✅ Tout est en stock !");
    }
  }
  