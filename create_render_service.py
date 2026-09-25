import requests
import json
import time

API_KEY = "rnd_01d3AOT5f3cdBnUn87xrW8mOMEmg"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Create new web service
payload = {
    "type": "web_service",
    "name": "code-engine-api-v2",
    "ownerId": "tea-d5ljfap4tr6s73c0nkv0",
    "repo": "https://github.com/anshullakra007/ai-integration-in-code-engine",
    "branch": "main",
    "autoDeploy": "yes",
    "serviceDetails": {
        "env": "docker",
        "region": "singapore",
        "plan": "free",
        "envSpecificDetails": {
            "dockerfilePath": "./Dockerfile"
        }
    }
}

response = requests.post("https://api.render.com/v1/services", json=payload, headers=HEADERS)
data = response.json()

if response.status_code == 201:
    print(f"Service created! Full data: {json.dumps(data, indent=2)}")
    print(f"Service ID: {data['id']}")
    
    with open("render_url.txt", "w") as f:
        f.write(data['serviceDetails']['url'])
else:
    print(f"Error creating service: {data}")
