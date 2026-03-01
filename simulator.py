"""
simulator.py — ConstructAI Plan Generation Engine
===================================================
Generates three execution plans (Fast, Cost-Optimized, Balanced)
with computed duration, cost, and risk metrics based on project parameters.
"""

import math
import random

# ─── Factor Maps ───────────────────────────────────────────────────────────

WEATHER_FACTORS = {"sunny": 1.0, "humid": 1.15, "rainy": 1.35}
MATERIAL_FACTORS = {"high": 0.9, "medium": 1.0, "low": 1.25}

BASE_TIMES = {"small": 60, "medium": 120, "large": 240}
DAILY_COSTS = {"small": 8_000, "medium": 18_000, "large": 35_000}

# Plan-specific profiles: speed/cost tradeoffs
PLAN_PROFILES = {
    "Plan A — Fast Execution": {
        "time_mult": 0.80,
        "cost_mult": 1.25,
        "risk_base": 0.35,
        "tag": "fast",
    },
    "Plan B — Cost Optimized": {
        "time_mult": 1.15,
        "cost_mult": 0.78,
        "risk_base": 0.20,
        "tag": "cost",
    },
    "Plan C — Balanced": {
        "time_mult": 1.00,
        "cost_mult": 1.00,
        "risk_base": 0.25,
        "tag": "balanced",
    },
}

# Timeline phase breakdown (fraction of total duration)
PHASES = [
    {"name": "Foundation",  "fraction": 0.15},
    {"name": "Structure",   "fraction": 0.30},
    {"name": "Envelope",    "fraction": 0.20},
    {"name": "MEP Systems", "fraction": 0.20},
    {"name": "Finishing",   "fraction": 0.15},
]


def generate_plans(project_size: str, workers: int,
                   weather: str, material: str) -> dict:
    """
    Generate three candidate execution plans.

    Duration = base_time * weather_factor * material_factor / log(workers)
    Cost     = duration * daily_cost * cost_multiplier
    Risk     = composite of weather, workforce, and plan-level base risk
    """
    size = project_size.lower()
    base_time = BASE_TIMES.get(size, 120)
    daily_cost = DAILY_COSTS.get(size, 18_000)
    weather_factor = WEATHER_FACTORS.get(weather.lower(), 1.0)
    material_factor = MATERIAL_FACTORS.get(material.lower(), 1.0)
    worker_divisor = max(math.log(max(workers, 2)), 1.0)

    plans = {}
    for plan_name, profile in PLAN_PROFILES.items():
        duration = round(
            base_time * profile["time_mult"]
            * weather_factor * material_factor
            / worker_divisor, 1
        )

        cost = round(duration * daily_cost * profile["cost_mult"], 0)

        # Risk score 0-100
        weather_risk = {"sunny": 0, "humid": 12, "rainy": 28}.get(weather.lower(), 0)
        workforce_risk = max(0, 25 - (workers / 8))
        base_risk = profile["risk_base"] * 100
        noise = random.uniform(-5, 5)
        risk = round(min(95, max(5, base_risk + weather_risk + workforce_risk + noise)), 1)

        # Build phase timeline
        timeline = []
        offset = 0
        for phase in PHASES:
            days = round(duration * phase["fraction"], 1)
            timeline.append({
                "phase": phase["name"],
                "start_day": round(offset, 1),
                "end_day": round(offset + days, 1),
                "days": days,
            })
            offset += days

        plans[plan_name] = {
            "duration_days": duration,
            "cost": cost,
            "risk_score": risk,
            "tag": profile["tag"],
            "timeline": timeline,
        }

    return plans
