// Script de calcul de quantité/menu pour BS NORD - NOFACE (@Khalifouille)

function calculerIngredients() {
  const SHEET_MENUS = "🛒 Recettes";
  const SHEET_STOCK = "📦Stock";
  const COL_MENU_NAME = 0; // Colonne A
  const COL_INGREDIENTS = 1; // Colonne B
  const COL_STOCK_NAME = 0; // Colonne A
  const COL_STOCK_QTY = 1; // Colonne B

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuSheet = ss.getSheetByName(SHEET_MENUS);
    var stockSheet = ss.getSheetByName(SHEET_STOCK);

    if (!menuSheet || !stockSheet) {
      throw new Error("Vérifie que les feuilles '🛒 Recettes' et '📦Stock' existent.");
    }

    var menuData = menuSheet.getDataRange().getValues();
    var stockData = stockSheet.getDataRange().getValues();

    if (menuData.length < 2 || stockData.length < 2) {
      throw new Error("Assure-toi que les feuilles contiennent des données.");
    }

    var menusDisponibles = menuData.slice(1).map(row => row[COL_MENU_NAME].replace(/[\u{1F300}-\u{1FAD6}]/gu, "").trim().toLowerCase());

    var choixMenus = Browser.inputBox("Quel menu veux-tu préparer ?", Browser.Buttons.OK_CANCEL);
    if (choixMenus == "cancel") return;

    var menusChoisis = choixMenus.split(",").map(m => m.trim().toLowerCase());
    var quantitesMenus = {};

    for (var menu of menusChoisis) {
      if (!menusDisponibles.includes(menu)) {
        throw new Error("Menu '" + menu + "' non trouvé. Vérifie l'orthographe.");
      }
      var quantite = Browser.inputBox("Combien de '" + menu + "' veux-tu préparer ?", Browser.Buttons.OK_CANCEL);
      if (quantite == "cancel") return;
      if (isNaN(quantite) || quantite <= 0) {
        throw new Error("Nombre invalide pour " + menu);
      }
      quantitesMenus[menu] = parseInt(quantite);
    }

    var ingredientsNecessaires = {};

    for (var j = 1; j < menuData.length; j++) {
      var menuNom = menuData[j][COL_MENU_NAME].replace(/[\u{1F300}-\u{1FAD6}]/gu, "").trim().toLowerCase();
      var quantiteMenu = quantitesMenus[menuNom] || 0;

      if (quantiteMenu > 0) {
        var ingredients = menuData[j][COL_INGREDIENTS].split(", ");
        for (var ing of ingredients) {
          var parts = ing.match(/x(\d+) (.+)/);
          if (!parts || parts.length < 3) continue;

          var quantite = parseInt(parts[1]);
          var ingredient = parts[2].trim();

          if (!ingredientsNecessaires[ingredient]) {
            ingredientsNecessaires[ingredient] = 0;
          }
          ingredientsNecessaires[ingredient] += quantite * quantiteMenu;
        }
      }
    }

    var stockDisponible = {};
    for (var k = 1; k < stockData.length; k++) {
      stockDisponible[stockData[k][COL_STOCK_NAME].toLowerCase()] = parseInt(stockData[k][COL_STOCK_QTY]) || 0;
    }

    var manquants = [];
    for (var ing in ingredientsNecessaires) {
      var besoin = ingredientsNecessaires[ing];
      var dispo = stockDisponible[ing.toLowerCase()] || 0;

      if (besoin > dispo) {
        manquants.push("- " + ing + " manquant(e) : " + (besoin - dispo));
      }
    }

    if (manquants.length > 0) {
      var message = "⚠️ **Ingrédients manquants :**\n\n" + manquants.join("\n");
      SpreadsheetApp.getUi().alert(message);
    } else {
      SpreadsheetApp.getUi().alert("✅ Tout est en stock !");
    }

  } catch (e) {
    SpreadsheetApp.getUi().alert("Erreur : " + e.message);
  }
}