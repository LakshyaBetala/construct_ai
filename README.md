# ConstructAI — Adaptive Construction Digital Twin

An AI-powered prototype that dynamically adapts construction execution plans using digital twin simulation. The system generates multiple execution strategies, simulates real-world disruptions, and deploys AI-optimized recovery plans — all in real time.

![ConstructAI Dashboard](https://img.shields.io/badge/Status-Production_Prototype-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white)

---

## Features

- **Digital Twin Simulation** — generates 3 distinct execution plans (Fast, Cost-Optimized, Balanced) with duration, cost, and risk metrics
- **Disruption Engine** — injects random site events (heavy rain, worker shortage, material delay, equipment breakdown) with severity-based impact
- **AI Adaptive Optimizer** — evaluates disrupted plans using a weighted composite scoring model and deploys an optimized recovery strategy
- **Explainable AI** — generates structured decision reports explaining the problem, constraints, chosen strategy, and expected impact
- **Real-Time Intelligence Feed** — streams AI reasoning messages during processing
- **Interactive Visualizations** — Chart.js-powered duration, cost, and timeline comparisons

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask (REST API) |
| Frontend | HTML5, TailwindCSS, Vanilla JavaScript |
| Charts | Chart.js |
| Simulation | NumPy-free algorithmic simulation |

---

## Project Structure

```
construct_ai/
├── app.py              # Flask server + REST API endpoints
├── simulator.py        # Plan generation engine
├── disruption.py       # Site disruption events + impact logic
├── optimizer.py        # AI adaptive optimizer (weighted scoring)
├── explanation.py      # AI decision report generator
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # 3-zone AI-native dashboard layout
└── static/
    ├── style.css       # Dark engineering theme (glassmorphism)
    └── app.js          # Frontend controller + Chart.js + AI overlay
```

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/LakshyaBetala/construct_ai.git
cd construct_ai
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

---

## Usage

1. **Configure** — Set project scale, workforce size, weather, and material availability in the left panel
2. **Initialize Digital Twin** — Generates 3 execution plans with animated metrics and charts
3. **Inject Site Event** — Triggers a random disruption (rain delay, worker shortage, etc.)
4. **Run Adaptive Optimization** — AI analyzes disrupted plans and deploys a recovery strategy

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/simulate` | Generate 3 execution plans |
| `POST` | `/disrupt` | Trigger random site disruption |
| `POST` | `/optimize` | Run AI adaptive optimizer |
| `GET`  | `/status`   | Digital twin status info |

### Example: Simulate

```bash
curl -X POST http://localhost:5000/simulate \
  -H "Content-Type: application/json" \
  -d '{"project_size":"medium","workers":80,"weather":"sunny","material":"medium"}'
```

---

## AI Optimizer Logic

The optimizer uses a **weighted composite scoring model**:

```
Score = (time_saved × 0.50) + (cost_saved × 0.30) + (risk_reduction × 0.20)
```

It evaluates all disrupted plans, selects the best recovery base, and generates an improved plan with:
- Task redistribution and parallel execution
- Critical-path prioritization
- Resource reallocation strategies

---

## License

MIT

---

Built with ❤️ as an AI-powered construction optimization prototype.
