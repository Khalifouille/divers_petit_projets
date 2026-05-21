document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');
    
    messageDiv.innerText = "Envoi de la demande...";
    messageDiv.style.color = "#ffcc00";

    try {
        const response = await fetch('/api/inscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailInput })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.innerText = "Inscription réussie ! En attente de validation sur Discord.";
            messageDiv.style.color = "#00ff00";
            document.getElementById('email').value = "";
        } else {
            messageDiv.innerText = `Erreur : ${data.error}`;
            messageDiv.style.color = "#ff0000";
        }
    } catch (error) {
        console.error("Erreur de connexion :", error);
        messageDiv.innerText = "Impossible de joindre le serveur du bot.";
        messageDiv.style.color = "#ff0000";
    }
});