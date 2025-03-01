import os
import time
import json
from pynput.keyboard import Controller, Key

logs_directory = ## LOGS FIVEM DIRECTORY
processed_reports = set()
last_position = 0
keyboard = Controller()
initial_scan_done = False

def simulate_touch(key):
    keyboard.press(key)
    time.sleep(0.5)
    keyboard.release(key)
def get_latest_log_file():
    try:
        all_files = os.listdir(logs_directory)
        files = [f for f in all_files if f.endswith(".log") and f.startswith("CitizenFX_log_")]
        if not files:
            print("Aucun fichier de log correspondant trouvé.")
            return None

        latest_file = sorted(files)[-1]
        return os.path.join(logs_directory, latest_file)
    except Exception as e:
        print(f"Erreur lors de la recherche du fichier de log : {e}")
        return None


def check_new_report(log_file_path):

    global last_position, initial_scan_done

    try:
        with open(log_file_path, 'r', encoding='utf-8') as file:
            file.seek(last_position)

            new_lines = file.readlines()
            last_position = file.tell()

        for line in new_lines:
            if "new report" in line.lower():
                try:
                    start_index = line.index("{")
                    report_data = json.loads(line[start_index:])

                    report_id = report_data.get("reportId")
                    if report_id not in processed_reports:
                        processed_reports.add(report_id)

                        print("\nNouveau rapport détecté :")
                        print(f"Discord ID : {report_data.get('discordId')}")
                        print(f"Nom        : {report_data.get('name')}")
                        print(f"ID         : {report_data.get('id')}")
                        print(f"Report ID  : {report_id}")
                        print(f"Message    : {report_data.get('msg')}")
                        print(f"Temps      : {report_data.get('time')}")
                        print(f"Unique ID  : {report_data.get('uniqueID')}")
                        print(f"Timestamp  : {report_data.get('timestamp')}")

                        if initial_scan_done:
                            print("Appui sur la touche F10...")
                            simulate_touch(Key.f10)
                            simulate_touch(Key.down)
                            print("Appui sur la touche Bas...")
                            simulate_touch(Key.enter)
                            simulate_touch(Key.enter)
                            print("Appui sur la touche Entrer x2...")
                            simulate_touch(Key.backspace)
                            simulate_touch(Key.backspace)
                            print("Appui sur la touche Retour x2...")
                except (ValueError, json.JSONDecodeError) as e:
                    print(f"Erreur lors du parsing d'un log : {e}")
    except FileNotFoundError:
        print(f"Le fichier {log_file_path} n'existe pas.")
    except Exception as e:
        print(f"Erreur lors du traitement du fichier : {e}")


last_checked_file = None

while True:
    print("\n--- Vérification des logs ---")
    latest_file = get_latest_log_file()
    if latest_file:
        if latest_file != last_checked_file:
            print(f"Fichier analysé : {latest_file}")
            last_checked_file = latest_file
            last_position = 0

        check_new_report(latest_file)

        if not initial_scan_done:
            initial_scan_done = True
    else:
        print("Pas de fichier valide trouvé.")

    time.sleep(30)
