function monitorSlideAccess() {
    try {
      var fileId = FILEID
  
      if (typeof Drive === "undefined" || typeof Drive.Activities === "undefined") {
        throw new Error("Le service Drive API n'est pas activé.");
      }
  
      var activities = Drive.Activities.list(fileId, {
        "pageSize": 10 
      });
  
      if (activities.items && activities.items.length > 0) {
        for (var i = 0; i < activities.items.length; i++) {
          var activity = activities.items[i];
          var eventType = activity.primaryActionDetail;

          if (eventType["view"]) {
            var user = activity.actors[0].caller.displayName; 
            var timestamp = activity.timestamp;
  
            sendDiscordWebhook(user, timestamp);
          }
        }
      } else {
        Logger.log("Aucune activité trouvée.");
      }
    } catch (e) {
      Logger.log("Erreur : " + e.toString());
    }
  }
  
  function sendDiscordWebhook(user, timestamp) {
    try {
      var webhookUrl = WEBHOOK
      var data = {
        "embeds": [
          {
            "title": "Accès détecté à Google Slide", 
            "description": "Un utilisateur a accédé à ton Google Slide.", 
            "color": 16711680, 
            "fields": [ 
              {
                "name": "Événement",
                "value": "slide_accessed",
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