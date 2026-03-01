"""
disruption.py — ConstructAI Site Disruption Engine
====================================================
Randomly selects and applies a site disruption event,
modifying plan metrics to reflect real-world impact.
"""

import random
import copy

# ─── Disruption Catalog ───────────────────────────────────────────────────

DISRUPTIONS = [
    {
        "id": "rain_delay",
        "name": "Heavy Rain Delay",
        "icon": "🌧️",
        "severity": "HIGH",
        "description": (
            "Unexpected heavy rainfall has halted outdoor construction activities. "
            "Ground conditions are unsafe for heavy machinery and concrete pouring."
        ),
        "time_impact": 1.25,
        "cost_impact": 1.15,
        "risk_impact": 20,
    },
    {
        "id": "worker_shortage",
        "name": "Worker Shortage",
        "icon": "👷",
        "severity": "CRITICAL",
        "description": (
            "A critical labor shortage has occurred — 30%% of the workforce is "
            "unavailable due to a regional strike. On-site productivity is severely reduced."
        ),
        "time_impact": 1.30,
        "cost_impact": 1.20,
        "risk_impact": 15,
    },
    {
        "id": "material_delay",
        "name": "Material Supply Delay",
        "icon": "📦",
        "severity": "HIGH",
        "description": (
            "Key structural materials (steel reinforcement, precast panels) are delayed "
            "by the supplier. Site work on the structural phase is partially stalled."
        ),
        "time_impact": 1.20,
        "cost_impact": 1.25,
        "risk_impact": 10,
    },
    {
        "id": "equipment_breakdown",
        "name": "Equipment Breakdown",
        "icon": "🔧",
        "severity": "MEDIUM",
        "description": (
            "The primary tower crane has malfunctioned. Vertical material transport "
            "is severely limited until a replacement unit arrives."
        ),
        "time_impact": 1.18,
        "cost_impact": 1.12,
        "risk_impact": 18,
    },
]


def trigger_disruption() -> dict:
    """Select a random disruption event."""
    return random.choice(DISRUPTIONS)


def apply_disruption(plans: dict, disruption: dict) -> dict:
    """
    Apply disruption impacts to all plans.
    Returns new plan dicts with modified metrics (originals untouched).
    """
    disrupted = {}
    for name, plan in plans.items():
        d = copy.deepcopy(plan)
        d["duration_days"] = round(plan["duration_days"] * disruption["time_impact"], 1)
        d["cost"] = round(plan["cost"] * disruption["cost_impact"], 0)
        d["risk_score"] = round(min(95, plan["risk_score"] + disruption["risk_impact"]), 1)

        # Recalculate timeline
        offset = 0
        for phase in d["timeline"]:
            days = round(d["duration_days"] * phase["days"] / plan["duration_days"], 1)
            phase["start_day"] = round(offset, 1)
            phase["end_day"] = round(offset + days, 1)
            phase["days"] = days
            offset += days

        disrupted[name] = d
    return disrupted
