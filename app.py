"""
app.py — ConstructAI Flask Server
====================================
REST API backend serving the Adaptive Construction Digital Twin.

Endpoints:
  POST /simulate  — Generate 3 execution plans
  POST /disrupt   — Trigger a random site disruption
  POST /optimize  — Run AI adaptive optimizer
  GET  /status    — Digital twin status info
"""

from flask import Flask, render_template, request, jsonify
from datetime import datetime

from simulator import generate_plans
from disruption import trigger_disruption, apply_disruption
from optimizer import optimize_plan
from explanation import generate_explanation

app = Flask(__name__)

# ─── In-Memory State (simulates digital twin state) ───────────────────────
twin_state = {
    "status": "IDLE",
    "plans": None,
    "disruption": None,
    "disrupted_plans": None,
    "optimized_result": None,
    "params": None,
    "last_updated": None,
}


@app.route("/")
def index():
    """Serve the main dashboard."""
    return render_template("index.html")


@app.route("/simulate", methods=["POST"])
def simulate():
    """
    Generate 3 execution plans from project parameters.
    Expects JSON: {project_size, workers, weather, material}
    """
    data = request.get_json()
    params = {
        "project_size": data.get("project_size", "medium"),
        "workers": int(data.get("workers", 80)),
        "weather": data.get("weather", "sunny"),
        "material": data.get("material", "medium"),
    }

    plans = generate_plans(
        params["project_size"],
        params["workers"],
        params["weather"],
        params["material"],
    )

    # Update twin state
    twin_state["status"] = "SIMULATED"
    twin_state["plans"] = plans
    twin_state["params"] = params
    twin_state["disruption"] = None
    twin_state["disrupted_plans"] = None
    twin_state["optimized_result"] = None
    twin_state["last_updated"] = datetime.now().isoformat()

    return jsonify({"success": True, "plans": plans})


@app.route("/disrupt", methods=["POST"])
def disrupt():
    """
    Trigger a random site disruption and apply impacts to current plans.
    """
    if twin_state["plans"] is None:
        return jsonify({"success": False, "error": "No simulation to disrupt."}), 400

    disruption = trigger_disruption()
    disrupted_plans = apply_disruption(twin_state["plans"], disruption)

    twin_state["status"] = "DISRUPTED"
    twin_state["disruption"] = disruption
    twin_state["disrupted_plans"] = disrupted_plans
    twin_state["optimized_result"] = None
    twin_state["last_updated"] = datetime.now().isoformat()

    return jsonify({
        "success": True,
        "disruption": disruption,
        "disrupted_plans": disrupted_plans,
    })


@app.route("/optimize", methods=["POST"])
def optimize():
    """
    Run the AI adaptive optimizer on disrupted plans.
    Returns optimized plan, scores, improvements, and explanation.
    """
    if twin_state["disrupted_plans"] is None:
        return jsonify({"success": False, "error": "No disruption to optimize."}), 400

    result = optimize_plan(twin_state["disrupted_plans"], twin_state["plans"])
    explanation = generate_explanation(twin_state["disruption"], result)

    twin_state["status"] = "OPTIMIZED"
    twin_state["optimized_result"] = result
    twin_state["last_updated"] = datetime.now().isoformat()

    return jsonify({
        "success": True,
        "result": result,
        "explanation": explanation,
        "original_plan": twin_state["plans"].get(result["best_base"]),
    })


@app.route("/status", methods=["GET"])
def status():
    """Return current digital twin status."""
    return jsonify({
        "status": twin_state["status"],
        "has_plans": twin_state["plans"] is not None,
        "has_disruption": twin_state["disruption"] is not None,
        "has_optimization": twin_state["optimized_result"] is not None,
        "last_updated": twin_state["last_updated"],
        "params": twin_state["params"],
    })


if __name__ == "__main__":
    print("\n  ConstructAI — Adaptive Construction Digital Twin")
    print("  Open http://localhost:5000 in your browser\n")
    app.run(debug=True, port=5000)
