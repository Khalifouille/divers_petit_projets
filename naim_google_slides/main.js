function sendDiscordWebhook() {
    const webhookURL = "https://discord.com/api/webhooks/1350547715133542400/xVVRx6cMv3tqg5ix8fBXVmeuEYxknGcYW7-AFuZAGdY7QXxqds_T8-A8STxSvuUN3l_G"; 
    const message = {
      content: "Quelqu'un a consulté votre Google Slides !",
      username: "QUI A CHECK?", 
    };
  
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(message),
    };
  
    UrlFetchApp.fetch(webhookURL, options);
  }