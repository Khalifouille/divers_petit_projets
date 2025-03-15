function monitorFileChanges() {
    try {
      var fileId = "1Vufm81734MFZpEQj5KNGoNakVP9PsQ_soZCD9KKP5cc";
      var file = Drive.Files.get(fileId);
      var lastModifiedBy = file.lastModifyingUser.displayName; 
      var lastModifiedTime = file.modifiedDate; 
  
      sendDiscordWebhook(lastModifiedBy, lastModifiedTime);
    } catch (e) {
      Logger.log("Erreur : " + e.toString());
    }
  }
  
  function sendDiscordWebhook(user, timestamp) {
    try {
      var webhookUrl = "https://discord.com/api/webhooks/1350547715133542400/xVVRx6cMv3tqg5ix8fBXVmeuEYxknGcYW7-AFuZAGdY7QXxqds_T8-A8STxSvuUN3l_G"; // Remplace par ton URL de webhook Discord
  
      var data = {
        "embeds": [
          {
            "title": "Modification détectée sur Google Slide",
            "description": "Un utilisateur a modifié ton Google Slide.", 
            "color": 16711680, 
            "fields": [ 
              {
                "name": "Événement",
                "value": "slide_modified",
                "inline": true
              },
              {
                "name": "Utilisateur",
                "value": user, 
                "inline": true
              },
              {
                "name": "Date et heure",
                "value": timestamp, 
                "inline": false
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
      Logger.log("Erreur : " + e.toString());
    }
  }