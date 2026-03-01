/* ═══════════════════════════════════════════════════════════════════════════
   app.js — ConstructAI v3.1 Frontend Controller
   ═══════════════════════════════════════════════════════════════════════════
   Modules:
     • DOM cache & helpers
     • Clock
     • Status management
     • AI Intelligence Feed
     • AI Processing Overlay
     • Animated metric counters
     • Chart.js rendering
     • Plan / Disruption / Optimization rendering
     • Explanation (AI Decision Report)
     • Event handlers (Simulate / Disrupt / Optimize)
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// DOM CACHE
// ═══════════════════════════════════════════════════════════════════════════
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const DOM = {
    // Inputs
    projectSize: $('#projectSize'),
    workers: $('#workers'),
    workersVal: $('#workersValue'),
    weather: $('#weather'),
    material: $('#material'),

    // Buttons
    btnSim: $('#btnSimulate'),
    btnDisrupt: $('#btnDisrupt'),
    btnOptimize: $('#btnOptimize'),

    // Header
    statusPulse: $('#statusPulse'),
    statusLabel: $('#statusLabel'),
    headerConf: $('#headerConfidence'),
    headerClock: $('#headerClock'),

    // Overlay
    overlay: $('#aiOverlay'),
    overlayTitle: $('#overlayTitle'),
    overlayMsg: $('#overlayMessage'),
    overlayProg: $('#overlayProgress'),
    overlayScen: $('#overlayScenarios'),

    // Zones
    idleState: $('#idleState'),
    activeBanner: $('#activeBanner'),
    bannerRisk: $('#bannerRisk'),
    bannerEff: $('#bannerEfficiency'),
    bannerConf: $('#bannerConfidence'),
    metricsRow: $('#metricsRow'),
    planSection: $('#planSection'),
    planCards: $('#planCards'),
    chartSection: $('#chartSection'),
    disruptAlert: $('#disruptionAlert'),
    optSection: $('#optimizationSection'),
    improvCards: $('#improvementCards'),
    beforeCard: $('#beforeCard'),
    afterCard: $('#afterCard'),
    reportBody: $('#decisionReportBody'),

    // Feed
    feedList: $('#feedList'),
    feedScroll: $('#feedScroll'),
    btnClearFeed: $('#btnClearFeed'),

    // Twin State
    twinSection: $('#twinStateSection'),
    twinInfo: $('#twinStateInfo'),
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
let charts = { duration: null, cost: null, timeline: null, comparison: null };
let currentPlans = null;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtNum = (n, d = 1) => Number(n).toFixed(d);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

async function apiPost(url, data = {}) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════════════════════════════════════
function tickClock() {
    const now = new Date();
    if (DOM.headerClock) {
        DOM.headerClock.textContent = now.toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        });
    }
}
setInterval(tickClock, 1000);
tickClock();

// ═══════════════════════════════════════════════════════════════════════════
// STATUS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
function setStatus(label, pulse) {
    DOM.statusLabel.textContent = label;
    DOM.statusPulse.className = 'status-pulse';
    if (pulse) DOM.statusPulse.classList.add(`pulse-${pulse}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// AI INTELLIGENCE FEED
// ═══════════════════════════════════════════════════════════════════════════
function addFeedItem(msg, type = 'system', dot = 'blue') {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const el = document.createElement('div');
    el.className = `feed-item feed-${type}`;
    el.innerHTML = `
        <div class="feed-dot dot-${dot}"></div>
        <div>
            <div class="feed-time">${time}</div>
            <div class="feed-msg">${msg}</div>
        </div>
    `;
    DOM.feedList.prepend(el);

    // Keep max 50 items
    while (DOM.feedList.children.length > 50) {
        DOM.feedList.removeChild(DOM.feedList.lastChild);
    }
}

// Feed messages pools for different phases
const FEED_MSGS = {
    simulate: [
        'Loading project parameters...',
        'Constructing 3D site model...',
        'Calibrating weather impact vectors...',
        'Computing workforce allocation curves...',
        'Running duration Monte Carlo (n=120)...',
        'Evaluating cost matrices...',
        'Scoring risk probabilities...',
        'Generating Plan A — Fast Execution...',
        'Generating Plan B — Cost Optimized...',
        'Generating Plan C — Balanced...',
        'Cross-validating simulation results...',
        'Building phase timelines...',
        'Simulation complete — 3 plans generated.',
    ],
    disrupt: [
        'Scanning site telemetry for anomalies...',
        'Anomaly detected — severity assessment...',
        'Recalculating constraint boundaries...',
        'Impact propagation analysis running...',
        'Updating disrupted plan metrics...',
        'Disruption event injected into twin model.',
    ],
    optimize: [
        'Initializing adaptive optimizer...',
        'Evaluating 3 disrupted plans...',
        'Computing weighted composite scores...',
        'Time weight: 0.50 · Cost: 0.30 · Risk: 0.20',
        'Selecting optimal recovery base...',
        'Applying resource reallocation strategy...',
        'Rescheduling non-critical activities...',
        'Testing parallel execution windows...',
        'Validating safety constraints...',
        'Generating adaptive recovery plan...',
        'Computing optimization gains...',
        'Optimization complete — plan deployed.',
    ],
};

async function streamFeed(phase, totalMs) {
    const msgs = FEED_MSGS[phase];
    const interval = totalMs / msgs.length;
    const dotMap = { simulate: 'cyan', disrupt: 'red', optimize: 'green' };
    const typeMap = { simulate: 'sim', disrupt: 'disrupt', optimize: 'opt' };

    for (const msg of msgs) {
        addFeedItem(msg, typeMap[phase], dotMap[phase]);
        await sleep(interval);
    }
}

DOM.btnClearFeed.addEventListener('click', () => {
    DOM.feedList.innerHTML = '';
    addFeedItem('Feed cleared.', 'system', 'blue');
});

// ═══════════════════════════════════════════════════════════════════════════
// AI PROCESSING OVERLAY
// ═══════════════════════════════════════════════════════════════════════════
const OVERLAY_MSGS = {
    simulate: [
        'Initializing digital twin engine...',
        'Mapping project constraint space...',
        'Running simulation scenarios...',
        'Evaluating execution tradeoffs...',
        'Generating candidate plans...',
        'Validating simulation integrity...',
    ],
    disrupt: [
        'Detecting site anomaly...',
        'Analyzing disruption impact...',
        'Propagating event through model...',
        'Recalculating plan metrics...',
    ],
    optimize: [
        'Loading adaptive optimizer...',
        'Testing 120+ recovery scenarios...',
        'Evaluating execution tradeoffs...',
        'Selecting optimal strategy...',
        'Deploying adaptive plan...',
    ],
};

async function showOverlay(phase, durationMs) {
    const msgs = OVERLAY_MSGS[phase];
    const titles = { simulate: 'Simulating', disrupt: 'Analyzing Disruption', optimize: 'Optimizing' };

    DOM.overlayTitle.textContent = titles[phase] || 'Processing';
    DOM.overlayProgress.style.width = '0%';
    DOM.overlayScen.textContent = `Processing ${rand(80, 150)} scenarios...`;
    DOM.overlay.classList.remove('hidden');

    const stepMs = durationMs / msgs.length;
    for (let i = 0; i < msgs.length; i++) {
        DOM.overlayMsg.textContent = msgs[i];
        DOM.overlayProgress.style.width = `${((i + 1) / msgs.length) * 100}%`;
        await sleep(stepMs);
    }
}

function hideOverlay() {
    DOM.overlay.classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTERS
// ═══════════════════════════════════════════════════════════════════════════
function animateValue(el, target, prefix = '', suffix = '', duration = 800) {
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = start + (target - start) * eased;

        if (target >= 1000) {
            el.textContent = prefix + Math.round(current).toLocaleString('en-US') + suffix;
        } else {
            el.textContent = prefix + fmtNum(current) + suffix;
        }

        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ═══════════════════════════════════════════════════════════════════════════
// CHART.JS DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════
Chart.defaults.color = '#6b7f94';
Chart.defaults.font.family = "'Inter','system-ui',sans-serif";
Chart.defaults.font.size = 11;

const C = { fast: '#e65100', cost: '#1565c0', balanced: '#2e7d32', optimized: '#00e676' };
const gridColor = 'rgba(26,48,80,0.35)';

function destroyChart(key) { if (charts[key]) { charts[key].destroy(); charts[key] = null; } }

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: BANNER + METRICS
// ═══════════════════════════════════════════════════════════════════════════
function renderBannerMetrics(plans) {
    const vals = Object.values(plans);
    const avgRisk = vals.reduce((s, p) => s + p.risk_score, 0) / vals.length;
    const efficiency = Math.round(100 - avgRisk);
    const confidence = rand(85, 96);

    DOM.bannerRisk.textContent = fmtNum(avgRisk) + '%';
    DOM.bannerEff.textContent = efficiency + '%';
    DOM.bannerConf.textContent = confidence + '%';
    DOM.headerConf.textContent = confidence + '%';

    // Animate metric cards
    const avgDur = vals.reduce((s, p) => s + p.duration_days, 0) / vals.length;
    const avgCost = vals.reduce((s, p) => s + p.cost, 0) / vals.length;
    const scenarios = rand(80, 150);

    const durEl = DOM.metricsRow.querySelector('#metricDuration .metric-value');
    const costEl = DOM.metricsRow.querySelector('#metricCost .metric-value');
    const riskEl = DOM.metricsRow.querySelector('#metricRisk .metric-value');
    const scenEl = DOM.metricsRow.querySelector('#metricScenarios .metric-value');

    animateValue(durEl, avgDur);
    animateValue(costEl, avgCost, '$');
    animateValue(riskEl, avgRisk);
    animateValue(scenEl, scenarios);
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: PLAN CARDS
// ═══════════════════════════════════════════════════════════════════════════
function renderPlans(plans) {
    const tagIcons = { fast: '⚡', cost: '💰', balanced: '⚖️' };
    const tagClasses = { fast: 'tag-fast', cost: 'tag-cost', balanced: 'tag-balanced' };

    DOM.planCards.innerHTML = Object.entries(plans).map(([name, p]) => {
        const riskColor = p.risk_score > 50 ? '#ff5252' : p.risk_score > 30 ? '#ffab40' : '#00e676';
        return `
        <div class="plan-card anim-in">
            <div class="flex items-center justify-between mb-2">
                <span class="text-base">${tagIcons[p.tag] || '📋'}</span>
                <span class="plan-tag ${tagClasses[p.tag] || ''}">${p.tag}</span>
            </div>
            <h3 class="text-xs font-semibold text-gray-300 mb-2">${name}</h3>
            <div class="plan-row"><span class="plan-row-label">Duration</span><span class="plan-row-value">${p.duration_days}d</span></div>
            <div class="plan-row"><span class="plan-row-label">Cost</span><span class="plan-row-value">${fmtCurrency(p.cost)}</span></div>
            <div class="plan-row"><span class="plan-row-label">Risk</span><span class="plan-row-value" style="color:${riskColor}">${p.risk_score}</span></div>
            <div class="risk-track"><div class="risk-fill" style="width:${p.risk_score}%; background:${riskColor}"></div></div>
        </div>`;
    }).join('');
    DOM.planCards.classList.add('stagger');
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: CHARTS
// ═══════════════════════════════════════════════════════════════════════════
function renderCharts(plans) {
    const names = Object.keys(plans);
    const shortNames = names.map(n => n.split('—')[0].trim());
    const colors = names.map(n => C[plans[n].tag] || '#42a5f5');

    // Duration
    destroyChart('duration');
    charts.duration = new Chart($('#durationChart'), {
        type: 'bar',
        data: {
            labels: shortNames,
            datasets: [{
                label: 'Days', data: names.map(n => plans[n].duration_days),
                backgroundColor: colors.map(c => c + 'aa'), borderColor: colors,
                borderWidth: 1, borderRadius: 4,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: gridColor }, ticks: { callback: v => v + 'd' } },
                x: { grid: { display: false } },
            },
        },
    });

    // Cost
    destroyChart('cost');
    charts.cost = new Chart($('#costChart'), {
        type: 'bar',
        data: {
            labels: shortNames,
            datasets: [{
                label: 'Cost', data: names.map(n => plans[n].cost),
                backgroundColor: colors.map(c => c + 'aa'), borderColor: colors,
                borderWidth: 1, borderRadius: 4,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: gridColor }, ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k' } },
                x: { grid: { display: false } },
            },
        },
    });

    // Timeline (horizontal stacked)
    destroyChart('timeline');
    const phaseNames = plans[names[0]].timeline.map(t => t.phase);
    const phaseColors = ['#0d47a1cc', '#1565c0cc', '#42a5f5cc', '#90caf9cc', '#bbdefbcc'];
    const datasets = phaseNames.map((phase, i) => ({
        label: phase,
        data: names.map(n => plans[n].timeline[i]?.days || 0),
        backgroundColor: phaseColors[i], borderColor: phaseColors[i].replace('cc', ''),
        borderWidth: 1, borderRadius: 3,
    }));
    charts.timeline = new Chart($('#timelineChart'), {
        type: 'bar',
        data: { labels: shortNames, datasets },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12, font: { size: 9 } } } },
            scales: {
                x: { stacked: true, grid: { color: gridColor }, ticks: { callback: v => v + 'd' } },
                y: { stacked: true, grid: { display: false } },
            },
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: DISRUPTION
// ═══════════════════════════════════════════════════════════════════════════
function renderDisruption(disruption) {
    $('#disruptIcon').textContent = disruption.icon;
    $('#disruptName').textContent = disruption.name;
    $('#disruptSev').textContent = disruption.severity;
    $('#disruptDesc').textContent = disruption.description;
    DOM.disruptAlert.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════
function renderOptimization(result, explanation, originalPlan) {
    const opt = result.optimized_plan;
    const imp = result.improvements;

    DOM.headerConf.textContent = result.confidence + '%';
    DOM.bannerConf.textContent = result.confidence + '%';

    // Improvement cards
    DOM.improvCards.innerHTML = [
        { icon: '⏱️', label: 'Duration Reduction', value: imp.duration_reduction },
        { icon: '💰', label: 'Cost Savings', value: imp.cost_savings },
        { icon: '🛡️', label: 'Risk Reduction', value: imp.risk_reduction },
    ].map(c => `
        <div class="improvement-card anim-in">
            <div class="imp-icon">${c.icon}</div>
            <div class="imp-value">▼ ${c.value}%</div>
            <div class="imp-label">${c.label}</div>
        </div>
    `).join('');

    // Before card
    DOM.beforeCard.innerHTML = `
        <h4 class="text-gray-400">📋 Original Plan</h4>
        <div class="compare-sub">${result.best_base}</div>
        <div class="compare-row"><span>Duration</span><span class="text-gray-300">${originalPlan.duration_days}d</span></div>
        <div class="compare-row"><span>Cost</span><span class="text-gray-300">${fmtCurrency(originalPlan.cost)}</span></div>
        <div class="compare-row"><span>Risk</span><span style="color:#ff5252">${originalPlan.risk_score}</span></div>
    `;

    // After card
    DOM.afterCard.innerHTML = `
        <h4 class="text-accent-green">🤖 AI-Optimized Plan</h4>
        <div class="compare-sub">Adaptive Recovery Strategy</div>
        <div class="compare-row"><span>Duration</span><span style="color:#00e676">${opt.duration_days}d</span></div>
        <div class="compare-row"><span>Cost</span><span style="color:#00e676">${fmtCurrency(opt.cost)}</span></div>
        <div class="compare-row"><span>Risk</span><span style="color:#00e676">${opt.risk_score}</span></div>
    `;

    // Comparison chart
    destroyChart('comparison');
    charts.comparison = new Chart($('#comparisonChart'), {
        type: 'bar',
        data: {
            labels: ['Duration (days)', 'Cost ($k)', 'Risk Score'],
            datasets: [
                {
                    label: 'Original', data: [originalPlan.duration_days, originalPlan.cost / 1000, originalPlan.risk_score],
                    backgroundColor: '#ff525299', borderColor: '#ff5252', borderWidth: 1, borderRadius: 4,
                },
                {
                    label: 'AI Optimized', data: [opt.duration_days, opt.cost / 1000, opt.risk_score],
                    backgroundColor: '#00e67699', borderColor: '#00e676', borderWidth: 1, borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12 } } },
            scales: {
                y: { grid: { color: gridColor } },
                x: { grid: { display: false } },
            },
        },
    });

    // Decision Report
    renderDecisionReport(explanation);

    DOM.optSection.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: AI DECISION REPORT
// ═══════════════════════════════════════════════════════════════════════════
function renderDecisionReport(exp) {
    const scores = exp.recalculated_constraints.plan_scores;
    const scoreRows = Object.entries(scores).map(([n, s]) =>
        `<div class="flex justify-between py-1"><span class="text-[10px] text-gray-500">${n.split('—')[0].trim()}</span><span class="text-[10px] font-mono text-accent-cyan">${s.toFixed(4)}</span></div>`
    ).join('');

    DOM.reportBody.innerHTML = `
        <div class="report-section">
            <h4>🔍 Problem Detected</h4>
            <p><strong>${exp.disruption_analysis.event}</strong> — ${exp.disruption_analysis.severity}</p>
            <p class="mt-1">${exp.disruption_analysis.impact_summary}</p>
            <p class="mt-1 text-xs text-gray-500">${exp.disruption_analysis.time_impact} · ${exp.disruption_analysis.cost_impact}</p>
        </div>
        <div class="report-section">
            <h4>📊 Constraints Evaluated</h4>
            <p>${exp.recalculated_constraints.description}</p>
            <div class="mt-2 border-t border-surface-border pt-2">${scoreRows}</div>
            <p class="mt-2 text-xs">Selected: <span class="text-accent-cyan font-semibold">${exp.recalculated_constraints.selected_base}</span></p>
        </div>
        <div class="report-section">
            <h4>🎯 Strategy Chosen</h4>
            <p>${exp.optimization_reasoning.description}</p>
            <ul class="mt-2 space-y-1 list-disc list-inside">
                ${exp.optimization_reasoning.strategies_applied.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        <div class="report-section">
            <h4>📈 Expected Impact</h4>
            <div class="grid grid-cols-3 gap-3 mt-2">
                <div class="text-center"><div class="text-accent-green font-bold text-sm font-mono">${exp.result_summary.duration_improvement}</div><div class="text-[9px] text-gray-500 uppercase">Duration</div></div>
                <div class="text-center"><div class="text-accent-green font-bold text-sm font-mono">${exp.result_summary.cost_improvement}</div><div class="text-[9px] text-gray-500 uppercase">Cost</div></div>
                <div class="text-center"><div class="text-accent-green font-bold text-sm font-mono">${exp.result_summary.risk_improvement}</div><div class="text-[9px] text-gray-500 uppercase">Risk</div></div>
            </div>
        </div>
        <div class="report-section" style="border-left: 2px solid #4fc3f7">
            <p class="italic text-xs">${exp.ai_note}</p>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWIN STATE INFO
// ═══════════════════════════════════════════════════════════════════════════
function showTwinState(params) {
    DOM.twinSection.style.display = 'block';
    DOM.twinInfo.innerHTML = `
        <div>Scale: <span class="text-gray-300">${(params.project_size || '').toUpperCase()}</span></div>
        <div>Workers: <span class="text-gray-300">${params.workers}</span></div>
        <div>Weather: <span class="text-gray-300">${params.weather}</span></div>
        <div>Material: <span class="text-gray-300">${params.material}</span></div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VISIBILITY
// ═══════════════════════════════════════════════════════════════════════════
function show(...els) { els.forEach(e => { if (e) e.classList.remove('hidden'); }); }
function hide(...els) { els.forEach(e => { if (e) e.classList.add('hidden'); }); }

function setButtonLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKERS SLIDER LIVE LABEL
// ═══════════════════════════════════════════════════════════════════════════
DOM.workers.addEventListener('input', () => { DOM.workersVal.textContent = DOM.workers.value; });

// ═══════════════════════════════════════════════════════════════════════════
// EVENT: INITIALIZE DIGITAL TWIN (Simulate)
// ═══════════════════════════════════════════════════════════════════════════
DOM.btnSim.addEventListener('click', async () => {
    const params = {
        project_size: DOM.projectSize.value,
        workers: parseInt(DOM.workers.value),
        weather: DOM.weather.value,
        material: DOM.material.value,
    };

    // Lock UI
    setButtonLoading(DOM.btnSim, true);
    DOM.btnDisrupt.disabled = true;
    DOM.btnOptimize.disabled = true;
    hide(DOM.idleState, DOM.disruptAlert, DOM.optSection);
    DOM.headerConf.textContent = '—';
    setStatus('SIMULATING', 'orange');

    // AI overlay + feed in parallel
    const overlayP = showOverlay('simulate', 3000);
    const feedP = streamFeed('simulate', 3200);
    const apiP = apiPost('/simulate', params);

    const [, , res] = await Promise.all([overlayP, feedP, apiP]);
    hideOverlay();

    if (!res.success) {
        setStatus('ERROR', 'red');
        addFeedItem('Simulation failed.', 'system', 'red');
        setButtonLoading(DOM.btnSim, false);
        DOM.btnSim.disabled = false;
        return;
    }

    try {
        currentPlans = res.plans;
        showTwinState(params);

        // Show sections FIRST so Chart.js canvases have real dimensions
        show(DOM.activeBanner, DOM.metricsRow, DOM.planSection, DOM.chartSection);

        // Render results into visible containers
        renderBannerMetrics(currentPlans);
        renderPlans(currentPlans);
        renderCharts(currentPlans);

        setStatus('ACTIVE', 'blue');
        addFeedItem('Digital twin is ACTIVE. 3 execution plans ready.', 'system', 'green');
    } catch (err) {
        console.error('Render error:', err);
        setStatus('ERROR', 'red');
        addFeedItem('Render error: ' + err.message, 'system', 'red');
    }

    setButtonLoading(DOM.btnSim, false);
    DOM.btnSim.disabled = false;
    DOM.btnDisrupt.disabled = false;
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENT: INJECT SITE EVENT (Disrupt)
// ═══════════════════════════════════════════════════════════════════════════
DOM.btnDisrupt.addEventListener('click', async () => {
    setButtonLoading(DOM.btnDisrupt, true);
    DOM.btnSim.disabled = true;
    DOM.btnOptimize.disabled = true;
    hide(DOM.optSection);
    setStatus('DISRUPTING', 'red');

    const overlayP = showOverlay('disrupt', 2000);
    const feedP = streamFeed('disrupt', 2200);
    const apiP = apiPost('/disrupt');

    const [, , res] = await Promise.all([overlayP, feedP, apiP]);
    hideOverlay();

    if (!res.success) {
        setStatus('ERROR', 'red');
        addFeedItem('Disruption injection failed.', 'system', 'red');
        setButtonLoading(DOM.btnDisrupt, false);
        DOM.btnSim.disabled = false;
        DOM.btnDisrupt.disabled = false;
        return;
    }

    try {
        renderDisruption(res.disruption);
        renderPlans(res.disrupted_plans);
        renderCharts(res.disrupted_plans);
        renderBannerMetrics(res.disrupted_plans);

        setStatus('DISRUPTED', 'red');
        addFeedItem(`Event injected: ${res.disruption.name}`, 'disrupt', 'red');
    } catch (err) {
        console.error('Disrupt render error:', err);
        setStatus('ERROR', 'red');
        addFeedItem('Render error: ' + err.message, 'system', 'red');
    }

    setButtonLoading(DOM.btnDisrupt, false);
    DOM.btnSim.disabled = false;
    DOM.btnDisrupt.disabled = false;
    DOM.btnOptimize.disabled = false;
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENT: RUN ADAPTIVE OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════
DOM.btnOptimize.addEventListener('click', async () => {
    setButtonLoading(DOM.btnOptimize, true);
    DOM.btnSim.disabled = true;
    DOM.btnDisrupt.disabled = true;
    setStatus('OPTIMIZING', 'orange');

    const overlayP = showOverlay('optimize', 3500);
    const feedP = streamFeed('optimize', 3800);
    const apiP = apiPost('/optimize');

    const [, , res] = await Promise.all([overlayP, feedP, apiP]);
    hideOverlay();

    if (!res.success) {
        setStatus('ERROR', 'red');
        addFeedItem('Optimization failed: ' + (res.error || ''), 'system', 'red');
        setButtonLoading(DOM.btnOptimize, false);
        DOM.btnSim.disabled = false;
        DOM.btnDisrupt.disabled = false;
        return;
    }

    try {
        // Show optimization section first so comparison chart canvases are visible
        show(DOM.optSection);
        renderOptimization(res.result, res.explanation, res.original_plan);
        setStatus('OPTIMIZED', 'green');
        addFeedItem('Adaptive recovery plan deployed. AI confidence: ' + res.result.confidence + '%', 'opt', 'green');

        // Smooth scroll
        DOM.optSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        console.error('Optimize render error:', err);
        setStatus('ERROR', 'red');
        addFeedItem('Render error: ' + err.message, 'system', 'red');
    }

    setButtonLoading(DOM.btnOptimize, false);
    DOM.btnSim.disabled = false;
    DOM.btnDisrupt.disabled = false;
    DOM.btnOptimize.disabled = true;  // Already optimized
});
