"""Quick test of all ConstructAI endpoints."""
import urllib.request, json

BASE = "http://localhost:5000"

def post(path, data=None):
    body = json.dumps(data or {}).encode()
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

# 1. Simulate
print("=== POST /simulate ===")
r = post("/simulate", {"project_size": "medium", "workers": 80, "weather": "sunny", "material": "medium"})
print(f"success: {r['success']}")
for name, plan in r["plans"].items():
    print(f"  {name}:")
    print(f"    tag={plan.get('tag','MISSING')} dur={plan['duration_days']} cost={plan['cost']} risk={plan['risk_score']}")
    tl = plan.get("timeline", [])
    print(f"    timeline: {len(tl)} phases => {[t['phase'] for t in tl]}")

# 2. Disrupt
print("\n=== POST /disrupt ===")
r2 = post("/disrupt")
print(f"success: {r2['success']}")
print(f"disruption: {r2['disruption']}")
for name, plan in r2["disrupted_plans"].items():
    print(f"  {name}: tag={plan.get('tag','MISSING')} dur={plan['duration_days']}")

# 3. Optimize
print("\n=== POST /optimize ===")
r3 = post("/optimize")
print(f"success: {r3['success']}")
print(f"result keys: {list(r3['result'].keys())}")
print(f"original_plan keys: {list(r3['original_plan'].keys())}")
print(f"explanation keys: {list(r3['explanation'].keys())}")
print(f"improvements: {r3['result']['improvements']}")

print("\nAll endpoints OK!")
