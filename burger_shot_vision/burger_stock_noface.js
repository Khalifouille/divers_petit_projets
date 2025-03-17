// Script de calcul de quantité/menu pour BS NORD - NOFACE (@Khalifouille)

function calculerIngredients() {
  const SHEET_MENUS = "🛒 Recettes";
  const SHEET_STOCK = "📦Stock";
  const COL_MENU_NAME = 0; // Colonne A
  const COL_INGREDIENTS = 1; // Colonne B
  const COL_STOCK_NAME = 0; // Colonne A
  const COL_STOCK_QTY = 1; // Colonne B

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const menuSheet = ss.getSheetByName(SHEET_MENUS);
    const stockSheet = ss.getSheetByName(SHEET_STOCK);

    if (!menuSheet || !stockSheet) {
      throw new Error("Vérifie que les feuilles '🛒 Recettes' et '📦Stock' existent.");
    }

    const menuData = menuSheet.getDataRange().getValues();
    const stockData = stockSheet.getDataRange().getValues();

    if (menuData.length < 2 || stockData.length < 2) {
      throw new Error("Assure-toi que les feuilles contiennent des données.");
    }

    const menusDisponibles = new Set(menuData.slice(1).map(row => row[COL_MENU_NAME].replace(/[\u{1F300}-\u{1FAD6}]/gu, "").trim().toLowerCase()));

    const choixMenus = Browser.inputBox("Quelle recette veux-tu préparer ?", Browser.Buttons.OK_CANCEL);
    if (choixMenus === "cancel") return;

    const menusChoisis = choixMenus.split(",").map(m => m.trim().toLowerCase());
    const quantitesMenus = new Map();

    for (const menu of menusChoisis) {
      if (!menusDisponibles.has(menu)) {
        throw new Error("Menu '" + menu + "' non trouvé. Vérifie l'orthographe.");
      }
      const quantite = Browser.inputBox("Combien de '" + menu + "' veux-tu préparer ?", Browser.Buttons.OK_CANCEL);
      if (quantite === "cancel") return;
      if (isNaN(quantite) || quantite <= 0) {
        throw new Error("Nombre invalide pour " + menu);
      }
      quantitesMenus.set(menu, parseInt(quantite));
    }

    const ingredientsNecessaires = new Map();

    for (let j = 1; j < menuData.length; j++) {
      const menuNom = menuData[j][COL_MENU_NAME].replace(/[\u{1F300}-\u{1FAD6}]/gu, "").trim().toLowerCase();
      const quantiteMenu = quantitesMenus.get(menuNom) || 0;

      if (quantiteMenu > 0) {
        const ingredients = menuData[j][COL_INGREDIENTS].split(", ");
        for (const ing of ingredients) {
          const parts = ing.match(/x(\d+) (.+)/);
          if (!parts || parts.length < 3) continue;

          const quantite = parseInt(parts[1]);
          const ingredient = parts[2].trim();

          if (!ingredientsNecessaires.has(ingredient)) {
            ingredientsNecessaires.set(ingredient, 0);
          }
          ingredientsNecessaires.set(ingredient, ingredientsNecessaires.get(ingredient) + quantite * quantiteMenu);
        }
      }
    }

    const stockDisponible = new Map();
    for (let k = 1; k < stockData.length; k++) {
      stockDisponible.set(stockData[k][COL_STOCK_NAME].toLowerCase(), parseInt(stockData[k][COL_STOCK_QTY]) || 0);
    }

    const manquants = [];
    for (const [ing, besoin] of ingredientsNecessaires) {
      const dispo = stockDisponible.get(ing.toLowerCase()) || 0;

      if (besoin > dispo) {
        manquants.push("- " + ing + " manquant(e) : " + (besoin - dispo));
      }
    }

    if (manquants.length > 0) {
      const message = "⚠️ **Ingrédients manquants :**\n\n" + manquants.join("\n");
      SpreadsheetApp.getUi().alert(message);
    } else {
      SpreadsheetApp.getUi().alert("✅ Tout est en stock !");
    }

  } catch (e) {
    SpreadsheetApp.getUi().alert("Erreur : " + e.message);
  }
}