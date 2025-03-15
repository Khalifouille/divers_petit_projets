function logAccess() {
    try {
      var sheetId = "1O23pTkCVgjWkAUoAsjTbDOBtCJOCoCH-y4kp539lLps";
      var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
      var user = Session.getActiveUser().getUsername();
      var timestamp = new Date().toISOString(); 
      sheet.appendRow([user, timestamp]);
      sendWebhook(user, timestamp);
  
      Logger.log("Consultation enregistrée : " + user + " à " + timestamp);
    } catch (e) {
      Logger.log("Erreur : " + e.toString());
    }
  }
  
  function sendWebhook(user, timestamp) {
    try {
      var webhookUrl = "https://discord.com/api/webhooks/1350547715133542400/xVVRx6cMv3tqg5ix8fBXVmeuEYxknGcYW7-AFuZAGdY7QXxqds_T8-A8STxSvuUN3l_G";
  
      var data = {
        "content": "Nouvelle consultation détectée :",
        "embeds": [
          {
            "title": "Assistant Khalifouille - Nouvelle consultation détectée",
            "description": "Un utilisateur a consulté ton Google Slide.",
            "color": 16711680,
            "fields": [
              {
                "name": "Utilisateur",
                "value": user, 
                "inline": true
              },
              {
                "name": "Date et heure",
                "value": timestamp, 
                "inline": true
              }
            ]
          }
        ]
      };
  
      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(data)
      };
  
      var response = UrlFetchApp.fetch(webhookUrl, options);
      Logger.log("Réponse du webhook : " + response.getContentText());
    } catch (e) {
      Logger.log("Erreur (webhook) : " + e.toString());
    }
  }