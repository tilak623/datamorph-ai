import urllib.request
import urllib.error
import json
import time
import sys

RENDER_API_KEY = "rnd_YrSPKQxbmeakT0fKCMNdmGUFu5wZ"
OWNER_ID = "tea-dbb52he1egvs7394sghg"
REPO_URL = "https://github.com/tilak623/datamorph-ai"
SERVICE_NAME = "datamorph-ai"

def create_render_service(repo_url=REPO_URL, service_name=SERVICE_NAME):
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    payload = {
        "type": "web_service",
        "name": service_name,
        "ownerId": OWNER_ID,
        "repo": repo_url,
        "branch": "main",
        "autoDeploy": "yes",
        "serviceDetails": {
            "env": "node",
            "plan": "free",
            "region": "oregon",
            "envSpecificDetails": {
                "buildCommand": "npm install && npm run build",
                "startCommand": "npm run start"
            },
            "envVars": [
                {"key": "NODE_ENV", "value": "production"},
                {"key": "SESSION_SECRET", "value": "datamorph_super_secure_production_secret_32chars!"},
                {"key": "NEXT_PUBLIC_APP_URL", "value": f"https://{service_name}.onrender.com"}
            ]
        }
    }

    req = urllib.request.Request(
        "https://api.render.com/v1/services",
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        print(f"🚀 Creating Render Web Service '{service_name}' from {repo_url}...")
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            service_id = res_data.get("service", {}).get("id")
            service_url = res_data.get("service", {}).get("serviceDetails", {}).get("url")
            dashboard_url = res_data.get("service", {}).get("dashboardUrl")
            print(f"✅ Service created successfully!")
            print(f"   ID: {service_id}")
            print(f"   Live URL: {service_url}")
            print(f"   Dashboard: {dashboard_url}")
            return res_data
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        print(f"❌ Failed to create Render service ({e.code}): {error_msg}")
        return None

if __name__ == "__main__":
    repo = sys.argv[1] if len(sys.argv) > 1 else REPO_URL
    name = sys.argv[2] if len(sys.argv) > 2 else SERVICE_NAME
    create_render_service(repo, name)
