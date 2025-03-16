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
    "🍗 Tenders": "Tenders",
    "🥗 Petite Salade": "Petite Salade",
    "🐄 Milkshake": "MilkShake",
    "🥤 Soda": "Boisson",
    "🥤 Café": "Boisson",
    "🍴 Menu Double": "Menu Double",
    "🍴 Menu Classic": "Menu Classic",
    "🍴 Menu Contrat": "Menu Contrat"
  };

  const colonnesDestination = [
    "Menu Classic",
    "Menu Double",
    "Menu Contrat",
    "Tenders",
    "Petite Salade",
    "Boisson",
    "MilkShake"
  ];

  const totaux = {};
  colonnesDestination.forEach(colonne => {
    totaux[colonne] = 0;
  });

  data.forEach(row => {
    let article = row[0] ? row[0].toString().trim() : "";
    let quantite = row[1] ? parseFloat(row[1]) : 0;

    Logger.log("🔸 Article détecté : " + article + " | Quantité détectée : " + quantite);

    if (article && !isNaN(quantite) && mappingArticles.hasOwnProperty(article)) {
      let nomArticle = mappingArticles[article];
      if (colonnesDestination.includes(nomArticle)) {
        totaux[nomArticle] += quantite;
        Logger.log("✅ Ajouté à " + nomArticle + " => Total maintenant : " + totaux[nomArticle]);
      }
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
    feuilleDestination.appendRow([nomVendeur, 0, 0, 0, 0, 0, 0, 0]);
    ligneVendeur = feuilleDestination.getLastRow();
  }

  const valeursActuelles = feuilleDestination.getRange(ligneVendeur, 4, 1, 7).getValues()[0];

  Logger.log("🔹 Valeurs actuelles en feuille : " + valeursActuelles.join(", "));

  const nouveauxTotaux = colonnesDestination.map((colonne, index) => {
    return Number(valeursActuelles[index]) + totaux[colonne];
  });

  Logger.log("🔹 Nouveaux totaux avant écriture : " + nouveauxTotaux.join(", "));

  feuilleDestination.getRange(ligneVendeur, 4, 1, 7).setValues([nouveauxTotaux]);

  Logger.log("✅ Mise à jour effectuée avec succès !");
  feuilleActive.getRange('D13:D').clearContent(); 
  Logger.log("🧹 Quantités effacées dans la plage C13:D");

  SpreadsheetApp.getUi().alert("Les ventes de " + nomVendeur + " ont été mises à jour dans la feuille : " + nomFeuille);
}

function formatDate(date) {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}`;
}