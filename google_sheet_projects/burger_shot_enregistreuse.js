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
    "Burger Double": 0,
    "Burger Classic": 0,
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

  const aujourdHui = new Date();
  const debutSemaine = new Date(aujourdHui);
  debutSemaine.setDate(aujourdHui.getDate() - aujourdHui.getDay() + 1); 
  const finSemaine = new Date(debutSemaine);
  finSemaine.setDate(debutSemaine.getDate() + 6); 

  const nomFeuille = `Semaine du ${formatDate(debutSemaine)} au ${formatDate(finSemaine)}`;

  let feuilleDestination = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomFeuille);
  if (!feuilleDestination) {
    SpreadsheetApp.getUi().alert("📄 La feuille de la semaine actuelle n'est pas créée : " + nomFeuille);
    return;
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
    feuilleDestination.appendRow([nomVendeur, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    ligneVendeur = feuilleDestination.getLastRow();
  }

  const valeursActuelles = feuilleDestination.getRange(ligneVendeur, 4, 1, 7).getValues()[0];

  Logger.log("🔹 Valeurs actuelles en feuille : " + valeursActuelles.join(", "));

  const nouveauxTotaux = [
    Number(valeursActuelles[0]) + totaux["Burger Double"],
    Number(valeursActuelles[1]) + totaux["Burger Classic"],
    Number(valeursActuelles[2]) + totaux["Menu Classic"],
    Number(valeursActuelles[3]) + totaux["Menu Double"],
    Number(valeursActuelles[4]) + totaux["Menu Contrat"],
    Number(valeursActuelles[5]) + totaux["Tenders"],
    Number(valeursActuelles[6]) + totaux["Petite Salade"],
    Number(valeursActuelles[7]) + totaux["Boisson"],
    Number(valeursActuelles[8]) + totaux["MilkShake"]
  ];

  Logger.log("🔹 Nouveaux totaux avant écriture : " + nouveauxTotaux.join(", "));

  feuilleDestination.getRange(ligneVendeur, 4, 1, 7).setValues([nouveauxTotaux.slice(0, 7)]);

  Logger.log("✅ Mise à jour effectuée avec succès !");
  SpreadsheetApp.getUi().alert("Les ventes de " + nomVendeur + " ont été mises à jour dans la feuille : " + nomFeuille);
}

function formatDate(date) {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}`;
}