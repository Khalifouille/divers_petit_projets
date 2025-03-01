import cv2
import numpy as np
import pytesseract
import pyautogui
import time
import os
from PIL import Image
import psutil
import keyboard

pyautogui.FAILSAFE = False

game_name = 'opera.exe'
game_running = False
ID = 40000
bypass_count = 0

for proc in psutil.process_iter():
    try:
        process_info = proc.as_dict(attrs=['pid', 'name'])
        if process_info['name'] == game_name:
            game_running = True
            break
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        pass

if game_running:
    print("Opera est lancé. Wala mon akhi")
    test_folder = os.path.join(os.path.expanduser("~"), "Desktop", "test")
    hmm_folder = os.path.join(os.path.expanduser("~"), "Desktop", "test", "hmm")
    time.sleep(2)
    pyautogui.moveTo(732, 1030)
    pyautogui.click()
    time.sleep(2)
    pyautogui.moveTo(167, 13)
    pyautogui.click()
    time.sleep(2)

    while True:
        pyautogui.moveTo(844, 247)
        pyautogui.click()
        time.sleep(2)
        ID+=1
        print(ID)
        time.sleep(2)
        pyautogui.hotkey('ctrl', 'a')
        time.sleep(2)
        pyautogui.write(str(ID))
        time.sleep(2)
        pyautogui.moveTo(908, 306)
        time.sleep(2)
        pyautogui.click()
        time.sleep(2)
        pyautogui.click()
        time.sleep(2)

        left = 760
        top = 600
        width = 400
        height = 200

        screenshot = pyautogui.screenshot(region=(left, top, width, height))

        filename = os.path.join(test_folder, "douanier.png")

        screenshot.save(filename)

        image = cv2.imread(filename)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

        kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
        sharpened = cv2.filter2D(threshold, -1, kernel)

        processed_filename = os.path.join(test_folder, "processeddouanier.png")
        cv2.imwrite(processed_filename, sharpened)
        texte = pytesseract.image_to_string(Image.open(processed_filename), config="--psm 11")
        texte = texte.replace(" ", "").replace("\n", "").replace("\t", "").replace("\r", "")
        print(texte)
        if texte != "Infosinterneidentique":
            screenshot = pyautogui.screenshot()
            screen =+1
            filename = os.path.join(hmm_folder, f"{screen}.png")
            screenshot.save(filename)
            bypass_count += 1

            print(f"On est à l'ID {ID} et j'ai potentielement trouvé {bypass_count} bypass ")
        else:
            print("Ce n'est pas un bypass")

        time.sleep(5)
else:
    print("Opera n'est pas lancé !")