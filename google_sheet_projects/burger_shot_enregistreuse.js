// FEUILLLE DE CALCUL : https://docs.google.com/spreadsheets/d/1I3kV3VnvaqblWgyh_oDlwz39jXAjVXOHUOTTmn2033Y/edit?usp=sharing
// Script d'enregistreuse de ventes pour BS NORD - NOFACE (@Khalifouille)

function mettreAJourVentes() {
  const feuilleActive = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const nomVendeur = feuilleActive.getRange('L3').getValue();
  const data = feuilleActive.getRange('C13:D').getValues();

  Logger.log("🔹 Données brutes récupérées : " + JSON.stringify(data));

const mappingArticles = {
  "🍔 Burger Double": "Burger Double",
  "🍔 Burger Classic": "Burger Classic",
  "🍟 Frites": "Frites",
  "🍴 Menu Classic": "Menu Classic",
  "🍴 Menu Double": "Menu Double",
  "🍴 Menu Contrat": "Menu Contrat",
  "🍗 Tenders": "Tenders",
  "🥗 Petite Salade": "Petite Salade",
  "🥤 Soda": "Boisson",
  "🥤 Café": "Boisson",
  "🐄 Milkshake": "MilkShake"
};


  const totaux = {
    "Burger Double" : 0,
    "Burger Classic" :0,
    "Menu Classic": 0,
    "Menu Double": 0,
    "Menu Contrat": 0,
    "Tenders": 0,
    "Petite Salade": 0,
    "Boisson": 0,
    "MilkShake": 0
  };

  data.forEach(row => {
    let article = row[0] ? row[0].toString().trim() : "";
    let quantite = row[1] ? parseFloat(row[1]) : 0;

    Logger.log("🔸 Article détecté : " + article + " | Quantité détectée : " + quantite);

    if (article && !isNaN(quantite) && mappingArticles.hasOwnProperty(article)) {
      let nomArticle = mappingArticles[article];
      totaux[nomArticle] += quantite;
      Logger.log("✅ Ajouté à " + nomArticle + " => Total maintenant : " + totaux[nomArticle]);
    } else {
      Logger.log("⚠️ Article ignoré ou non reconnu : " + article);
    }
  });

  Logger.log("🔹 Totaux calculés : " + JSON.stringify(totaux));

  let feuilleDestination = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Semaine du 10/03 au 17/03");
  if (!feuilleDestination) {
    feuilleDestination = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Semaine du 10/03 au 17/03");
    feuilleDestination.appendRow(["Vendeur", "", "", "Menu Classic", "Menu Double", "Menu Contrat", "Tenders", "Petite Salade", "Boisson", "MilkShake"]);
  }

  const dataVendeurs = feuilleDestination.getRange('A2:A').getValues();
  let ligneVendeur = -1;

  for (let i = 0; i < dataVendeurs.length; i++) {
    if (dataVendeurs[i][0] === nomVendeur) {
      ligneVendeur = i + 2;
      break;
    }
  }

  if (ligneVendeur === -1) {
    feuilleDestination.appendRow([nomVendeur, 0, 0, 0, 0, 0, 0, 0]);
    ligneVendeur = feuilleDestination.getLastRow();
  }

  const valeursActuelles = feuilleDestination.getRange(ligneVendeur, 4, 1, 9).getValues()[0];

  Logger.log("🔹 Valeurs actuelles en feuille : " + valeursActuelles.join(", "));

  const nouveauxTotaux = [
    valeursActuelles[0] + totaux["Burger Double"],
    valeursActuelles[1] + totaux["Burger Classic"],
    valeursActuelles[2] + totaux["Menu Classic"],
    valeursActuelles[3] + totaux["Menu Double"],
    valeursActuelles[4] + totaux["Menu Contrat"],
    valeursActuelles[5] + totaux["Tenders"],
    valeursActuelles[6] + totaux["Petite Salade"],
    valeursActuelles[7] + totaux["Boisson"],
    valeursActuelles[8] + totaux["MilkShake"]
  ];

  Logger.log("🔹 Nouveaux totaux avant écriture : " + nouveauxTotaux.join(", "));

  feuilleDestination.getRange(ligneVendeur, 4, 1, 9).setValues([nouveauxTotaux.map(x => Number(x))]);

  Logger.log("✅ Mise à jour effectuée avec succès !");
  SpreadsheetApp.getUi().alert("Les ventes de " + nomVendeur + " ont été mises à jour !");
}
