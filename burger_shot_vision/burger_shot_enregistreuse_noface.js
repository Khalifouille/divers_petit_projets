// FEUILLLE DE CALCUL : https://docs.google.com/spreadsheets/d/1I3kV3VnvaqblWgyh_oDlwz39jXAjVXOHUOTTmn2033Y/edit?usp=sharing
// Script d'enregistreuse de ventes pour BS NORD - NOFACE (@Khalifouille)

function mettreAJourVentes() {
  const feuilleActive = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const nomVendeur = feuilleActive.getRange('L3').getValue();
  const data = feuilleActive.getRange('C13:D').getValues();

  Logger.log("🔹 Données brutes récupérées : " + JSON.stringify(data));

  const mappingArticles = new Map([
    ["🍔 Burger Double", "Burger Double"],
    ["🍔 Burger Classic", "Burger Classic"],
    ["🍟 Frites", "Frites"],
    ["🍗 Tenders", "Tenders"],
    ["🥗 Petite Salade", "Petite Salade"],
    ["🐄 Milkshake", "MilkShake"],
    ["🥤 Soda", "Boisson"],
    ["🥤 Café", "Boisson"],
    ["🍴 Menu Double", "Menu Double"],
    ["🍴 Menu Classic", "Menu Classic"],
    ["🍴 Menu Contrat", "Menu Contrat"]
  ]);

  const colonnesDestination = ["Menu Classic", "Menu Double", "Menu Contrat", "Tenders", "Petite Salade", "Boisson", "MilkShake"];
  const totaux = new Map(colonnesDestination.map(colonne => [colonne, 0]));

  data.forEach(row => {
    const article = row[0] ? row[0].toString().trim() : "";
    const quantite = row[1] ? parseFloat(row[1]) : 0;

    Logger.log("🔸 Article détecté : " + article + " | Quantité détectée : " + quantite);

    if (article && !isNaN(quantite) && quantite > 0) {
      const nomArticle = mappingArticles.get(article);
      if (nomArticle && colonnesDestination.includes(nomArticle)) {
        totaux.set(nomArticle, totaux.get(nomArticle) + quantite);
        Logger.log("✅ Ajouté à " + nomArticle + " => Total maintenant : " + totaux.get(nomArticle));

        envoyerNotificationDiscord(nomVendeur, nomArticle, quantite, totaux.get(nomArticle));
      } else {
        Logger.log("⚠️ Article ignoré ou non reconnu : " + article);
      }
    }
  });

  Logger.log("🔹 Totaux calculés : " + JSON.stringify([...totaux]));

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
  let ligneVendeur = dataVendeurs.findIndex(row => row[0] === nomVendeur) + 2;

  if (ligneVendeur === 1) {
    feuilleDestination.appendRow([nomVendeur, 0, 0, 0, 0, 0, 0, 0]);
    ligneVendeur = feuilleDestination.getLastRow();
  }

  const valeursActuelles = feuilleDestination.getRange(ligneVendeur, 4, 1, 7).getValues()[0];
  const nouveauxTotaux = colonnesDestination.map((colonne, index) => Number(valeursActuelles[index]) + totaux.get(colonne));

  feuilleDestination.getRange(ligneVendeur, 4, 1, 7).setValues([nouveauxTotaux]);

  Logger.log("✅ Mise à jour effectuée avec succès !");
  feuilleActive.getRange('D13:D').clearContent(); 
  Logger.log("🧹 Quantités effacées dans la plage C13:D");

  const nomFeuilleRapport = "📚Rapport des Ventes";
  let feuilleRapport = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomFeuilleRapport);

  if (!feuilleRapport) {
    feuilleRapport = SpreadsheetApp.getActiveSpreadsheet().insertSheet(nomFeuilleRapport);
    feuilleRapport.appendRow(["Date", "Vendeur", "Menu Classic", "Menu Double", "Menu Contrat", "Tenders", "Petite Salade", "Boisson", "MilkShake"]);
  }

  const dateAujourdHui = formatDate(aujourdHui);
  const dataRapport = feuilleRapport.getRange('A2:I').getValues();
  let ligneExistante = dataRapport.findIndex(row => row[0] === dateAujourdHui && row[1] === nomVendeur) + 2;

  if (ligneExistante === 1) {
    feuilleRapport.appendRow([
      dateAujourdHui,
      nomVendeur,
      totaux.get("Menu Classic"),
      totaux.get("Menu Double"),
      totaux.get("Menu Contrat"),
      totaux.get("Tenders"),
      totaux.get("Petite Salade"),
      totaux.get("Boisson"),
      totaux.get("MilkShake")
    ]);
  } else {
    const valeursActuellesRapport = feuilleRapport.getRange(ligneExistante, 3, 1, 7).getValues()[0];
    const nouveauxTotauxRapport = [
      valeursActuellesRapport[0] + totaux.get("Menu Classic"),
      valeursActuellesRapport[1] + totaux.get("Menu Double"),
      valeursActuellesRapport[2] + totaux.get("Menu Contrat"),
      valeursActuellesRapport[3] + totaux.get("Tenders"),
      valeursActuellesRapport[4] + totaux.get("Petite Salade"),
      valeursActuellesRapport[5] + totaux.get("Boisson"),
      valeursActuellesRapport[6] + totaux.get("MilkShake")
    ];
    feuilleRapport.getRange(ligneExistante, 3, 1, 7).setValues([nouveauxTotauxRapport]);
  }

  SpreadsheetApp.getUi().alert("Les ventes de " + nomVendeur + " ont été mises à jour dans la feuille : " + nomFeuille + " et enregistrées dans le rapport des ventes.");
}

function envoyerNotificationDiscord(nomVendeur, article, quantite, total) {
  const webhookURL = "https://discord.com/api/webhooks/1341426672225878027/AwfUXS9gwrkMESCT8tz2JeQqX8e0O2GitOAIpb8fsunTqjyFfZgkSpmNWfhP21z-gQmJ";

  const message = {
    content: null,
    embeds: [
      {
        title: "Nouvelle vente enregistrée !",
        color: 0x00ff00, 
        fields: [
          {
            name: "Vendeur",
            value: nomVendeur,
            inline: true
          },
          {
            name: "Article",
            value: article,
            inline: true
          },
          {
            name: "Quantité",
            value: quantite.toString(),
            inline: true
          },
          {
            name: "Total",
            value: total.toString(),
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }
    ]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(message)
  };

  UrlFetchApp.fetch(webhookURL, options);
}

function formatDate(date) {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}`;
}