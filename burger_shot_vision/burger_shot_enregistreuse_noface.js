// FEUILLLE DE CALCUL : https://docs.google.com/spreadsheets/d/1I3kV3VnvaqblWgyh_oDlwz39jXAjVXOHUOTTmn2033Y/edit?usp=sharing
// Script d'enregistreuse de ventes pour BS NORD - NOFACE (@Khalifouille)

function mettreAJourVentes() {
  try {
    const feuilleActive = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const nomVendeur = feuilleActive.getRange('L3').getValue();
    const data = feuilleActive.getRange('C13:D').getValues();

    Logger.log("🔹 Début de la mise à jour des ventes pour le vendeur : " + nomVendeur);
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

    const totaux = calculerTotaux(data, mappingArticles, colonnesDestination);
    Logger.log("🔹 Totaux calculés : " + JSON.stringify(totaux));

    const aujourdHui = new Date();
    const debutSemaine = new Date(aujourdHui);
    debutSemaine.setDate(aujourdHui.getDate() - aujourdHui.getDay() + 1); 
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6); 

    const nomFeuille = `Semaine du ${formatDate(debutSemaine)} au ${formatDate(finSemaine)}`;
    let feuilleDestination = creerFeuilleSiAbsente(nomFeuille, ["Vendeur", "Menu Classic", "Menu Double", "Menu Contrat", "Tenders", "Petite Salade", "Boisson", "MilkShake"]);

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

    const valeursActuelles = feuilleDestination.getRange(ligneVendeur, 2, 1, colonnesDestination.length).getValues()[0];
    const nouveauxTotaux = colonnesDestination.map((colonne, index) => valeursActuelles[index] + totaux[colonne]);
    feuilleDestination.getRange(ligneVendeur, 2, 1, colonnesDestination.length).setValues([nouveauxTotaux]);

    Logger.log("✅ Mise à jour effectuée avec succès !");
    feuilleActive.getRange('D13:D').clearContent(); 

    const nomFeuilleRapport = "📚Rapport des Ventes";
    const feuilleRapport = creerFeuilleSiAbsente(nomFeuilleRapport, ["Date", "Vendeur", "Menu Classic", "Menu Double", "Menu Contrat", "Tenders", "Petite Salade", "Boisson", "MilkShake"]);

    const dateAujourdHui = formatDate(aujourdHui);
    const dataRapport = feuilleRapport.getRange('A2:I').getValues();
    let ligneExistante = -1;

    for (let i = 0; i < dataRapport.length; i++) {
      if (dataRapport[i][0] === dateAujourdHui && dataRapport[i][1] === nomVendeur) {
        ligneExistante = i + 2;
        break;
      }
    }

    if (ligneExistante === -1) {
      feuilleRapport.appendRow([dateAujourdHui, nomVendeur, ...colonnesDestination.map(colonne => totaux[colonne])]);
    } else {
      const valeursActuellesRapport = feuilleRapport.getRange(ligneExistante, 3, 1, colonnesDestination.length).getValues()[0];
      const nouveauxTotauxRapport = colonnesDestination.map((colonne, index) => valeursActuellesRapport[index] + totaux[colonne]);
      feuilleRapport.getRange(ligneExistante, 3, 1, colonnesDestination.length).setValues([nouveauxTotauxRapport]);
    }

    SpreadsheetApp.getUi().alert("Les ventes de " + nomVendeur + " ont été mises à jour avec succès.");
  } catch (e) {
    Logger.log("❌ Erreur : " + e.toString());
    SpreadsheetApp.getUi().alert("Une erreur s'est produite : " + e.message);
  }
}

function calculerTotaux(data, mappingArticles, colonnesDestination) {
  const totaux = {};
  colonnesDestination.forEach(colonne => totaux[colonne] = 0);

  data.forEach(row => {
    let article = row[0] ? row[0].toString().trim() : "";
    let quantite = row[1] ? parseFloat(row[1]) : 0;

    if (article && !isNaN(quantite) && mappingArticles[article]) {
      let nomArticle = mappingArticles[article];
      if (colonnesDestination.includes(nomArticle)) {
        totaux[nomArticle] += quantite;
      }
    }
  });

  return totaux;
}

function creerFeuilleSiAbsente(nomFeuille, enTetes) {
  let feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomFeuille);
  if (!feuille) {
    feuille = SpreadsheetApp.getActiveSpreadsheet().insertSheet(nomFeuille);
    feuille.appendRow(enTetes);
  }
  return feuille;
}

function formatDate(date) {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}`;
}