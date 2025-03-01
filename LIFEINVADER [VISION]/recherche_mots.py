import http.client
import json

conn = http.client.HTTPSConnection("api-lifeinvader.visionrp.fr")

payload = ""

headers = {
    'authority': "api-lifeinvader.visionrp.fr",
    'accept': "application/json, text/plain, */*",
    'accept-language': "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    'cookie': "", ## TOKEN ICI
    'dnt': "1",
    'if-none-match': "W/\"ae79-9q7VdDcrsJNMpZLXMvdufsMV1aQ\"",
    'origin': "https://lifeinvader.visionrp.fr",
    'referer': "https://lifeinvader.visionrp.fr/",
    'sec-ch-ua': "\"Not A(Brand\";v=\"99\", \"Opera GX\";v=\"107\", \"Chromium\";v=\"121\"",
    'sec-ch-ua-mobile': "?0",
    'sec-ch-ua-platform': "\"Windows\"",
    'sec-fetch-dest': "empty",
    'sec-fetch-mode': "cors",
    'sec-fetch-site': "same-site",
    'sec-gpc': "1",
    'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0"
}

conn.request("GET", "/posts/feed?server=WL&page=0&limit=250", payload, headers)

res = conn.getresponse()
data = res.read()
json_response = json.loads(data.decode("utf-8"))
posts_data = json_response.get('posts', {}).get('data', [])

for post in posts_data:
    body = post.get('body')
    picture_path = post.get('picturePath', 'Pas d\'images')
    if "" in body: ## TON MOT ICI
        print(f"Body: {body}")
        print(f"Picture Path: {picture_path}")
        print("------------------------------------------------------------------------------\n")
