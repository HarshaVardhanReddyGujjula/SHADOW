import urllib.request
import json

def test():
    # 1. Test Chairman Harsha Login
    login_data = json.dumps({"username": "harsha", "password": "harsha"}).encode()
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as res:
        login_res = json.loads(res.read().decode())
        print("[SUCCESS] Chairman Harsha Login Passed:", login_res["user"])

    # 2. Test Generate User Credential
    gen_data = json.dumps({"name": "Rahul Sharma", "role": "Senior Threat Analyst"}).encode()
    req2 = urllib.request.Request("http://127.0.0.1:8000/api/admin/generate-user", data=gen_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req2) as res:
        gen_res = json.loads(res.read().decode())
        print("[SUCCESS] User Generation Passed:", gen_res["credential"])

    # 3. Test AI Security Chatbot
    chat_data = json.dumps({
        "message": "What is our current threat level and summary for Chairman Harsha?",
        "username": "Harsha",
        "is_chairman": True
    }).encode()
    req3 = urllib.request.Request("http://127.0.0.1:8000/api/ai/chat", data=chat_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req3) as res:
        chat_res = json.loads(res.read().decode())
        print("\n[AI CHATBOT] Response to Chairman Harsha:")
        print(chat_res["reply"])

if __name__ == "__main__":
    test()
