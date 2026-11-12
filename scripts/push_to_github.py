import urllib.request
import urllib.error
import json
import subprocess
import sys

def setup_github_repo(token, repo_name="datamorph-ai", username="tilak623"):
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DataMorph-Setup"
    }

    # 1. Create repository if not already created
    create_url = "https://api.github.com/user/repos"
    payload = {
        "name": repo_name,
        "description": "AI-Powered Dataset-to-Interactive-Website Generator with Grounded AI Chatbot",
        "private": False
    }

    try:
        print(f"📦 Checking / creating repository '{repo_name}' on GitHub under user '{username}'...")
        req = urllib.request.Request(create_url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req) as res:
            repo_info = json.loads(res.read().decode())
            print(f"✅ Created repository: {repo_info.get('html_url')}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "already exists" in body or e.code == 422:
            print(f"ℹ️ Repository '{repo_name}' already exists on GitHub. Continuing with push...")
        else:
            print(f"❌ GitHub API Error ({e.code}): {body}")
            return False

    # 2. Push repository using authenticated remote
    remote_url = f"https://{username}:{token}@github.com/{username}/{repo_name}.git"
    print(f"🚀 Pushing main branch to GitHub...")

    try:
        subprocess.run(["git", "remote", "set-url", "origin", remote_url], check=False)
        res = subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"🎉 Successfully pushed all code to https://github.com/{username}/{repo_name}!")
            # Reset remote to clean public URL without embedding token
            subprocess.run(["git", "remote", "set-url", "origin", f"https://github.com/{username}/{repo_name}.git"], check=False)
            return True
        else:
            print(f"❌ Git push failed: {res.stderr}")
            return False
    except Exception as ex:
        print(f"❌ Git push exception: {ex}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/push_to_github.py <GITHUB_TOKEN> [REPO_NAME]")
        sys.exit(1)
    tok = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else "datamorph-ai"
    setup_github_repo(tok, name)
