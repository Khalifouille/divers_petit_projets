function checkDriveActivity() {
    var fileId = SlidesApp.getActivePresentation().getId(); 
    var WEBHOOK = webhookUrl;

    var url = `https://www.googleapis.com/drive/v3/changes?key=${apiKey}`;
    var payload = {
      "fileId": fileId,
      "pageSize": 10
    };
  
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
  
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
        Logger.log("Error: " + response.getContentText());
        return;
    }
    var activities = JSON.parse(response.getContentText()).changes;
  
    if (activities && activities.length > 0) {
      var message = {
        "content": `Quelqu'un a consulté le document : ${SlidesApp.getActivePresentation().getName()}`
      };
  
      var discordOptions = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(message)
      };
  
      UrlFetchApp.fetch(webhookUrl, discordOptions);
    }
}