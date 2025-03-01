import http.client
import json
import time

conn = http.client.HTTPSConnection("api-lifeinvader.visionrp.fr")

id_list = [

"65d120b9e413387107c9dc7d","65d120d6e413387107c9dd34","65d120d6e413387107c9dd36","65d120dbe413387107c9dd96","65d120dce413387107c9dd9c","65d120f6e413387107c9de9a","65d120fee413387107c9dec6","65d12101e413387107c9def7","65d1212be413387107c9e017","65d1218ee413387107c9e315","65d121d4e413387107c9e520","65d121d9e413387107c9e55c","65d1222be413387107c9e819","65d1222be413387107c9e81b","65d12244e413387107c9e926","65d122bee413387107c9ee80","65d1230ce413387107c9f085","65d1232be413387107c9f292","65d1232fe413387107c9f2ee","65d12347e413387107c9f457","65d12351e413387107c9f501","65d12384e413387107c9f93e","65d12389e413387107c9f979","65d123a0e413387107c9fad7","65d123d1e413387107c9fd7f","65d123d6e413387107c9fe2f","65d123f1e413387107c9ff4e","65d123f5e413387107c9ff61","65d1245be413387107ca04e5","65d1248ce413387107ca06e8","65d1249ae413387107ca0755","65d124bae413387107ca0884","65d12580e413387107ca0fe6","65d1258fe413387107ca1065","65d12595e413387107ca1092","65d125cae413387107ca11f3","65d12664e413387107ca15b4","65d12674e413387107ca166e","65d126f8e413387107ca19d5","65d12701e413387107ca19fd","65d1275de413387107ca1d6d","65d12764e413387107ca1dc8","65d1277fe413387107ca1eb6","65d12786e413387107ca1f06","65d127eae413387107ca22f9","65d128ade413387107ca2a46","65d128b1e413387107ca2a60","65d128b7e413387107ca2a84","65d128c1e413387107ca2ada","65d12928e413387107ca2d29","65d12942e413387107ca2e37","65d12948e413387107ca2e6c","65d129a7e413387107ca330e","65d12a08e413387107ca3983","65d12a3ee413387107ca3bb8","65d12a9ce413387107ca403c","65d12adae413387107ca4251","65d12ae6e413387107ca42bb","65d12b10e413387107ca43ea","65d12cf6e413387107ca5226","65d12d17e413387107ca533e","65d12d54e413387107ca54c9","65d12d59e413387107ca551f","65d12ddbe413387107ca5800","65d12de1e413387107ca5844","65d12de9e413387107ca5881","65d12e26e413387107ca5b07","65d12e8ce413387107ca5f17","65d12eaae413387107ca5f6a","65d12ec0e413387107ca5fb1","65d12f0de413387107ca613c","65d12ff0e413387107ca6682","65d13008e413387107ca6715","65d1303ae413387107ca67d8","65d13043e413387107ca681d","65d130b2e413387107ca6afe","65d130d1e413387107ca6c4a","65d13131e413387107ca70cc","65d131ace413387107ca7390","65d131d8e413387107ca7424","65d1323be413387107ca7663","65d1323be413387107ca7665","65d1325ee413387107ca7771","65d1337fe413387107ca83e8","65d133d4e413387107ca868e","65d133d4e413387107ca8691","65d13422e413387107ca88b3","65d13428e413387107ca88ed","65d13445e413387107ca898d","65d1348de413387107ca8b67","65d134bee413387107ca8cfb","65d1354de413387107ca9137","65d1365be413387107ca98db","65d1368ee413387107ca9a82","65d13691e413387107ca9ab2","65d1376ee413387107caa6dc","65d13889e413387107caadcb","65d13c9061d8426c1743809a","65d13ea261d8426c17438dd5"
] 

common_payload = {
    "followId": "65df89641fcb20a4762f817c"
}

headers = {
    'authority': "api-lifeinvader.visionrp.fr",
    'accept': "application/json, text/plain, */*",
    'accept-language': "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    'content-type': "application/json",
    'cookie': "", ## TOKEN ICI
    'origin': "https://lifeinvader.visionrp.fr",
    'referer': "https://lifeinvader.visionrp.fr/",
    'sec-ch-ua': "Not A(Brand;v=99, Opera GX;v=107, Chromium;v=121",
    'sec-ch-ua-mobile': "?0",
    'sec-ch-ua-platform': "Windows",
    'sec-fetch-dest': "empty",
    'sec-fetch-mode': "cors",
    'sec-fetch-site': "same-site",
    'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0"
    }

for user_id in id_list:
    current_payload = common_payload.copy()
    current_payload["_id"] = user_id
    json_payload = json.dumps(current_payload)
    conn.request("POST", "/users/follow", json_payload, headers)
    res = conn.getresponse()
    data = res.read()
    print(f"Response for user {user_id}: {data.decode('utf-8')}")
    time.sleep(1)

conn.close()
