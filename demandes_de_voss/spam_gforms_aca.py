from selenium import webdriver
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from faker import Faker
import random

# ----------------------------------------------------------------------------------------------------------------------------------------- INITIALISATION

fake = Faker()

def generate_random_data():
    data = {
        "pseudo_discord": random.choice([
            "fanaxr", "ficelot", "jakeperalta4664", "flaway", "g2pppp", "goldo13", "gusepe73", "ids212",
            "pedritosss", "ixtoz", "madmav.", "kagaymin", "lagourgette", "lealily", "loan3769", "foxt0m",
            "semsss", "mmeloden", "malarkeyz", ".rottencorpse", ".matruks.", "mihajsrb", "butcher_1",
            "333milan", "mr_faya14", "mrpaul", "popsi.", "neyney.", "nico0891", ".nutss.", "enma2308",
            "tr0ppydtr", "elietaker", "phenix_7_", "anass10212", "azzsq.", "douks.s", "redwolfs", "xniitroxx",
            "mhhr__", "kariboufr", "_rosky", "ryomen6140", "sangoten932", "ninja_dore_tv", "ya_zuu_",
            "showkase", "skylou_", "sleepyolo", "18snaptyy", "s_baw", "sprrobotes", "sulyawrld", "sylyx",
            "tekzixxl", "teteaclak", "titusse", "totaspeedy", "unikzy0", "vapo", "vyrik", "wargurd",
            "wild2303_", "xeyyoffi_", "yass660", "yattann", "izeep", "zwelef", "fvres", "tkkey_", "chosmus",
            "gameplay_off01"
        ]),
        "name": fake.name(),
        "dob": fake.date_of_birth(minimum_age=20, maximum_age=40).strftime("%d/%m/%Y"),
        "nationality": random.choice(
            ["USA", "Americain", "United States", "Espagnol", "Italien", "Canadien", "Americaine", "Sud Americain"]),
        "experience": random.choice([
            "Agent de sécurité", "US Army", "Livreur", "Livreur de pizza", "Mineur", "Policier", "Secouriste",
            "Médecin", "Sans emploi", "Taximan", "Serveur", "Taxi", "Journaliste", "Vendeur LTD",
            "Vendeur Vignoble", "Vendeur Bijouterie", "Vendeur"
        ]),
        "phone": "555-" + str(random.randint(10000, 99999)),
        "availability": random.choice([
            "Tous les jours", "Tous les soirs", "Tous les soirs sauf le dimanche", "Tous les soirs à partir de 20h",
            "À partir de 20h", "À partir de 21h jusqu'à 00h", "Tout le temps", "Pas de limite",
            "Tous les soirs sauf les week-ends", "Pas de préférence"
        ]),
        "station": random.choice(["Vespucci", "Mission Row", "Pas de préférence"])
    }
    return data

data = generate_random_data()
options = Options()
options.add_argument("--headless")
driver = webdriver.Chrome(service=Service(EdgeChromiumDriverManager().install()), options=options)

form_url = "https://docs.google.com/forms/d/e/1FAIpQLScUrOsI_zhbcDF7dpfyp82IdNkYNg7Wf570kxIqt_kDkgKqxw/viewform"

# ----------------------------------------------------------------------------------------------------------------------------------------- SCRIPT

try:
    driver.get(form_url)
    wait = WebDriverWait(driver, 10)

    # PSEUDO DISCORD

    discord_input = wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input')))
    discord_input.send_keys(data["pseudo_discord"])

    # NOM PRENOM

    name_input = wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input')))
    name_input.send_keys(data["name"])

    # DATE DE NAISSANCE

    dob_input = wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div[1]/div/div[1]/input')))
    dob_input.send_keys(data["dob"])

    # MARRUECOS

    nationality_input = wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div[1]/div/div[1]/input')))
    nationality_input.send_keys(data["nationality"])

    # EXPERIENCE

    experience_input = wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div[1]/div[2]/textarea')))
    experience_input.send_keys(data["experience"])

    # TEL

    phone_input = wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div[1]/div/div[1]/input')))
    phone_input.send_keys(data["phone"])

    # DISPONIBILITE

    availability_input = driver.find_element(By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div[1]/div/div[1]/input')
    availability_input.send_keys(data["availability"])

    # POSTE DE POLICE

    if data["station"].lower() == "vespucci":
        driver.find_element(By.XPATH, '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/span/div/div[3]/label').click()
    elif data["station"].lower() == "mission row":
        driver.find_element(By.XPATH, '//div[@aria-label="Mission Row"]').click()
    else:
        driver.find_element(By.XPATH, '//div[@aria-label="Pas de préférence"]').click()

# ----------------------------------------------------------------------------------------------------------------------------------------- SENDING

    submit_button = driver.find_element(By.XPATH, '//span[contains(text(),"Envoyer")]')
    submit_button.click()

    print("Dossier envoyé !")

finally:
    driver.quit()
