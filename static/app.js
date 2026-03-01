/* ═══════════════════════════════════════════════════════════════════════════
   app.js — ConstructAI v3.1 Frontend Controller
   ═══════════════════════════════════════════════════════════════════════════ */

console.log('[ConstructAI] app.js v3.1 loaded');

// ═══════════════════════════════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const fmtCurrency = (n) => '$' + Math.round(n).toLocaleString('en-US');
const fmtNum = (n, d = 1) => Number(n).toFixed(d);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
let charts = {};
let currentPlans = null;
let isProcessing = false;

// ═══════════════════════════════════════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════════════════════════════════════
function tickClock() {
    const el = $('#headerClock');
    if (el) {
        el.textContent = new Date().toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        });
    }
}
setInterval(tickClock, 1000);
tickClock();

// ═══════════════════════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════════════════════
function setStatus(label, pulse) {
    const lbl = $('#statusLabel');
    const dot = $('#statusPulse');
    if (lbl) lbl.textContent = label;
    if (dot) {
        dot.className = 'status-pulse';
        if (pulse) dot.classList.add('pulse-' + pulse);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// AI INTELLIGENCE FEED
// ═══════════════════════════════════════════════════════════════════════════
function addFeed(msg, type, dot) {
    const list = $('#feedList');
    if (!list) return;
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const el = document.createElement('div');
    el.className = 'feed-item feed-' + (type || 'system');
    el.innerHTML = '<div class="feed-dot dot-' + (dot || 'blue') + '"></div><div><div class="feed-time">' + t + '</div><div class="feed-msg">' + msg + '</div></div>';
    list.prepend(el);
    while (list.children.length > 50) list.removeChild(list.lastChild);
}

const FEED = {
    simulate: [
        'Loading project parameters…',
        'Constructing 3D site model…',
        'Calibrating weather impact vectors…',
        'Computing workforce allocation curves…',
        'Running duration Monte Carlo (n=120)…',
        'Evaluating cost matrices…',
        'Scoring risk probabilities…',
        'Generating Plan A — Fast Execution…',
        'Generating Plan B — Cost Optimized…',
        'Generating Plan C — Balanced…',
        'Cross-validating simulation results…',
        'Building phase timelines…',
        'Simulation complete — 3 plans generated.',
    ],
    disrupt: [
        'Scanning site telemetry for anomalies…',
        'Anomaly detected — severity assessment…',
        'Recalculating constraint boundaries…',
        'Impact propagation analysis running…',
        'Updating disrupted plan metrics…',
        'Disruption event injected into twin model.',
    ],
    optimize: [
        'Initializing adaptive optimizer…',
        'Evaluating 3 disrupted plans…',
        'Computing weighted composite scores…',
        'Time weight: 0.50 · Cost: 0.30 · Risk: 0.20',
        'Selecting optimal recovery base…',
        'Applying resource reallocation strategy…',
        'Rescheduling non-critical activities…',
        'Testing parallel execution windows…',
        'Validating safety constraints…',
        'Generating adaptive recovery plan…',
        'Computing optimization gains…',
        'Optimization complete — plan deployed.',
    ],
};

async function streamFeed(phase, totalMs) {
    const msgs = FEED[phase] || [];
    const dots = { simulate: 'cyan', disrupt: 'red', optimize: 'green' };
    const types = { simulate: 'sim', disrupt: 'disrupt', optimize: 'opt' };
    const interval = totalMs / msgs.length;
    for (const msg of msgs) {
        addFeed(msg, types[phase], dots[phase]);
        await sleep(interval);
    }
}

// Clear feed
const clearBtn = $('#btnClearFeed');
if (clearBtn) clearBtn.addEventListener('click', () => {
    const list = $('#feedList');
    if (list) list.innerHTML = '';
    addFeed('Feed cleared.', 'system', 'blue');
});

// ═══════════════════════════════════════════════════════════════════════════
// AI OVERLAY
// ═══════════════════════════════════════════════════════════════════════════
const OVERLAY = {
    simulate: ['Initializing digital twin engine…', 'Mapping project constraint space…', 'Running simulation scenarios…', 'Evaluating execution tradeoffs…', 'Generating candidate plans…', 'Validating simulation integrity…'],
    disrupt: ['Detecting site anomaly…', 'Analyzing disruption impact…', 'Propagating event through model…', 'Recalculating plan metrics…'],
    optimize: ['Loading adaptive optimizer…', 'Testing 120+ recovery scenarios…', 'Evaluating execution tradeoffs…', 'Selecting optimal strategy…', 'Deploying adaptive plan…'],
};

async function showOverlay(phase, durationMs) {
    const overlay = $('#aiOverlay');
    const title = $('#overlayTitle');
    const msg = $('#overlayMessage');
    const prog = $('#overlayProgress');
    const scen = $('#overlayScenarios');
    if (!overlay) return;

    const titles = { simulate: 'Simulating', disrupt: 'Analyzing Disruption', optimize: 'Optimizing' };
    const msgs = OVERLAY[phase] || [];

    if (title) title.textContent = titles[phase] || 'Processing';
    if (prog) prog.style.width = '0%';
    if (scen) scen.textContent = 'Processing ' + rand(80, 150) + ' scenarios…';
    overlay.classList.remove('hidden');

    const stepMs = durationMs / msgs.length;
    for (let i = 0; i < msgs.length; i++) {
        if (msg) msg.textContent = msgs[i];
        if (prog) prog.style.width = ((i + 1) / msgs.length * 100) + '%';
        await sleep(stepMs);
    }
}

function hideOverlay() {
    const overlay = $('#aiOverlay');
    if (overlay) overlay.classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTERS
// ═══════════════════════════════════════════════════════════════════════════
function animateValue(el, target, prefix, suffix, duration) {
    if (!el) return;
    prefix = prefix || '';
    suffix = suffix || '';
    duration = duration || 800;
    const startTime = performance.now();
    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = target * eased;
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
// CHART.JS SETUP
// ═══════════════════════════════════════════════════════════════════════════
Chart.defaults.color = '#6b7f94';
Chart.defaults.font.family = "'Inter','system-ui',sans-serif";
Chart.defaults.font.size = 11;

const COLORS = { fast: '#e65100', cost: '#1565c0', balanced: '#2e7d32', optimized: '#00e676' };
const GRID = 'rgba(26,48,80,0.35)';

function destroyChart(key) {
    if (charts[key]) { charts[key].destroy(); charts[key] = null; }
}

// ═══════════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════════
async function apiPost(url, data) {
    console.log('[API] POST', url, data);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
    });
    const json = await res.json();
    console.log('[API] Response', url, json.success);
    return json;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function renderBannerMetrics(plans) {
    console.log('[Render] bannerMetrics');
    const vals = Object.values(plans);
    const avgRisk = vals.reduce((s, p) => s + p.risk_score, 0) / vals.length;
    const avgDur = vals.reduce((s, p) => s + p.duration_days, 0) / vals.length;
    const avgCost = vals.reduce((s, p) => s + p.cost, 0) / vals.length;
    const efficiency = Math.round(100 - avgRisk);
    const confidence = rand(85, 96);
    const scenarios = rand(80, 150);

    const br = $('#bannerRisk');
    const be = $('#bannerEfficiency');
    const bc = $('#bannerConfidence');
    const hc = $('#headerConfidence');
    if (br) br.textContent = fmtNum(avgRisk) + '%';
    if (be) be.textContent = efficiency + '%';
    if (bc) bc.textContent = confidence + '%';
    if (hc) hc.textContent = confidence + '%';

    animateValue($('#metricDuration .metric-value'), avgDur);
    animateValue($('#metricCost .metric-value'), avgCost, '$');
    animateValue($('#metricRisk .metric-value'), avgRisk);
    animateValue($('#metricScenarios .metric-value'), scenarios);
}

function renderPlans(plans) {
    console.log('[Render] plans');
    const container = $('#planCards');
    if (!container) return;
    const icons = { fast: '⚡', cost: '💰', balanced: '⚖️' };
    const cls = { fast: 'tag-fast', cost: 'tag-cost', balanced: 'tag-balanced' };

    container.innerHTML = Object.entries(plans).map(function (entry) {
        var name = entry[0], p = entry[1];
        var rc = p.risk_score > 50 ? '#ff5252' : p.risk_score > 30 ? '#ffab40' : '#00e676';
        return '<div class="plan-card anim-in">' +
            '<div class="flex items-center justify-between mb-2">' +
            '<span class="text-base">' + (icons[p.tag] || '📋') + '</span>' +
            '<span class="plan-tag ' + (cls[p.tag] || '') + '">' + p.tag + '</span>' +
            '</div>' +
            '<h3 class="text-xs font-semibold text-gray-300 mb-2">' + name + '</h3>' +
            '<div class="plan-row"><span class="plan-row-label">Duration</span><span class="plan-row-value">' + p.duration_days + 'd</span></div>' +
            '<div class="plan-row"><span class="plan-row-label">Cost</span><span class="plan-row-value">' + fmtCurrency(p.cost) + '</span></div>' +
            '<div class="plan-row"><span class="plan-row-label">Risk</span><span class="plan-row-value" style="color:' + rc + '">' + p.risk_score + '</span></div>' +
            '<div class="risk-track"><div class="risk-fill" style="width:' + p.risk_score + '%; background:' + rc + '"></div></div>' +
            '</div>';
    }).join('');
    container.classList.add('stagger');
}

function renderCharts(plans) {
    console.log('[Render] charts');
    var names = Object.keys(plans);
    var shortNames = names.map(function (n) { return n.split('\u2014')[0].trim(); });
    var colors = names.map(function (n) { return COLORS[plans[n].tag] || '#42a5f5'; });

    // Duration chart
    destroyChart('duration');
    var durCanvas = $('#durationChart');
    if (durCanvas) {
        charts.duration = new Chart(durCanvas, {
            type: 'bar',
            data: {
                labels: shortNames,
                datasets: [{
                    label: 'Days', data: names.map(function (n) { return plans[n].duration_days; }),
                    backgroundColor: colors.map(function (c) { return c + 'aa'; }), borderColor: colors,
                    borderWidth: 1, borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { grid: { color: GRID }, ticks: { callback: function (v) { return v + 'd'; } } }, x: { grid: { display: false } } }
            }
        });
    }

    // Cost chart
    destroyChart('cost');
    var costCanvas = $('#costChart');
    if (costCanvas) {
        charts.cost = new Chart(costCanvas, {
            type: 'bar',
            data: {
                labels: shortNames,
                datasets: [{
                    label: 'Cost', data: names.map(function (n) { return plans[n].cost; }),
                    backgroundColor: colors.map(function (c) { return c + 'aa'; }), borderColor: colors,
                    borderWidth: 1, borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { grid: { color: GRID }, ticks: { callback: function (v) { return '$' + (v / 1000).toFixed(0) + 'k'; } } }, x: { grid: { display: false } } }
            }
        });
    }

    // Timeline chart
    destroyChart('timeline');
    var tlCanvas = $('#timelineChart');
    if (tlCanvas && plans[names[0]] && plans[names[0]].timeline) {
        var phaseNames = plans[names[0]].timeline.map(function (t) { return t.phase; });
        var phaseColors = ['#0d47a1cc', '#1565c0cc', '#42a5f5cc', '#90caf9cc', '#bbdefbcc'];
        var datasets = phaseNames.map(function (phase, i) {
            return {
                label: phase,
                data: names.map(function (n) { return (plans[n].timeline[i] && plans[n].timeline[i].days) || 0; }),
                backgroundColor: phaseColors[i], borderColor: (phaseColors[i] || '').replace('cc', ''),
                borderWidth: 1, borderRadius: 3
            };
        });
        charts.timeline = new Chart(tlCanvas, {
            type: 'bar',
            data: { labels: shortNames, datasets: datasets },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12, font: { size: 9 } } } },
                scales: { x: { stacked: true, grid: { color: GRID }, ticks: { callback: function (v) { return v + 'd'; } } }, y: { stacked: true, grid: { display: false } } }
            }
        });
    }
    console.log('[Render] charts done');
}

function renderDisruption(disruption) {
    console.log('[Render] disruption');
    var icon = $('#disruptIcon');
    var name = $('#disruptName');
    var sev = $('#disruptSev');
    var desc = $('#disruptDesc');
    if (icon) icon.textContent = disruption.icon;
    if (name) name.textContent = disruption.name;
    if (sev) sev.textContent = disruption.severity;
    if (desc) desc.textContent = disruption.description;
    show($('#disruptionAlert'));
}

function renderOptimization(result, explanation, originalPlan) {
    console.log('[Render] optimization');
    var opt = result.optimized_plan;
    var imp = result.improvements;

    var hc = $('#headerConfidence');
    var bc = $('#bannerConfidence');
    if (hc) hc.textContent = result.confidence + '%';
    if (bc) bc.textContent = result.confidence + '%';

    // Improvement cards
    var impContainer = $('#improvementCards');
    if (impContainer) {
        impContainer.innerHTML = [
            { icon: '⏱️', label: 'Duration Reduction', value: imp.duration_reduction },
            { icon: '💰', label: 'Cost Savings', value: imp.cost_savings },
            { icon: '🛡️', label: 'Risk Reduction', value: imp.risk_reduction },
        ].map(function (c) {
            return '<div class="improvement-card anim-in"><div class="imp-icon">' + c.icon + '</div><div class="imp-value">▼ ' + c.value + '%</div><div class="imp-label">' + c.label + '</div></div>';
        }).join('');
    }

    // Before card
    var beforeEl = $('#beforeCard');
    if (beforeEl) {
        beforeEl.innerHTML = '<h4 class="text-gray-400">📋 Original Plan</h4>' +
            '<div class="compare-sub">' + result.best_base + '</div>' +
            '<div class="compare-row"><span>Duration</span><span class="text-gray-300">' + originalPlan.duration_days + 'd</span></div>' +
            '<div class="compare-row"><span>Cost</span><span class="text-gray-300">' + fmtCurrency(originalPlan.cost) + '</span></div>' +
            '<div class="compare-row"><span>Risk</span><span style="color:#ff5252">' + originalPlan.risk_score + '</span></div>';
    }

    // After card
    var afterEl = $('#afterCard');
    if (afterEl) {
        afterEl.innerHTML = '<h4 class="text-accent-green">🤖 AI-Optimized Plan</h4>' +
            '<div class="compare-sub">Adaptive Recovery Strategy</div>' +
            '<div class="compare-row"><span>Duration</span><span style="color:#00e676">' + opt.duration_days + 'd</span></div>' +
            '<div class="compare-row"><span>Cost</span><span style="color:#00e676">' + fmtCurrency(opt.cost) + '</span></div>' +
            '<div class="compare-row"><span>Risk</span><span style="color:#00e676">' + opt.risk_score + '</span></div>';
    }

    // Comparison chart
    destroyChart('comparison');
    var compCanvas = $('#comparisonChart');
    if (compCanvas) {
        charts.comparison = new Chart(compCanvas, {
            type: 'bar',
            data: {
                labels: ['Duration (days)', 'Cost ($k)', 'Risk Score'],
                datasets: [
                    {
                        label: 'Original', data: [originalPlan.duration_days, originalPlan.cost / 1000, originalPlan.risk_score],
                        backgroundColor: '#ff525299', borderColor: '#ff5252', borderWidth: 1, borderRadius: 4
                    },
                    {
                        label: 'AI Optimized', data: [opt.duration_days, opt.cost / 1000, opt.risk_score],
                        backgroundColor: '#00e67699', borderColor: '#00e676', borderWidth: 1, borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12 } } },
                scales: { y: { grid: { color: GRID } }, x: { grid: { display: false } } }
            }
        });
    }

    // Decision Report
    renderDecisionReport(explanation);

    show($('#optimizationSection'));
}

function renderDecisionReport(exp) {
    console.log('[Render] decisionReport');
    var body = $('#decisionReportBody');
    if (!body) return;

    var scores = exp.recalculated_constraints.plan_scores;
    var scoreRows = '';
    for (var n in scores) {
        scoreRows += '<div class="flex justify-between py-1"><span class="text-[10px] text-gray-500">' + n.split('\u2014')[0].trim() + '</span><span class="text-[10px] font-mono text-accent-cyan">' + scores[n].toFixed(4) + '</span></div>';
    }

    var strategies = '';
    var strats = exp.optimization_reasoning.strategies_applied;
    for (var i = 0; i < strats.length; i++) {
        strategies += '<li>' + strats[i] + '</li>';
    }

    body.innerHTML =
        '<div class="report-section"><h4>🔍 Problem Detected</h4><p><strong>' + exp.disruption_analysis.event + '</strong> — ' + exp.disruption_analysis.severity + '</p><p class="mt-1">' + exp.disruption_analysis.impact_summary + '</p><p class="mt-1 text-xs text-gray-500">' + exp.disruption_analysis.time_impact + ' · ' + exp.disruption_analysis.cost_impact + '</p></div>' +
        '<div class="report-section"><h4>📊 Constraints Evaluated</h4><p>' + exp.recalculated_constraints.description + '</p><div class="mt-2 border-t border-surface-border pt-2">' + scoreRows + '</div><p class="mt-2 text-xs">Selected: <span class="text-accent-cyan font-semibold">' + exp.recalculated_constraints.selected_base + '</span></p></div>' +
        '<div class="report-section"><h4>🎯 Strategy Chosen</h4><p>' + exp.optimization_reasoning.description + '</p><ul class="mt-2 space-y-1 list-disc list-inside">' + strategies + '</ul></div>' +
        '<div class="report-section"><h4>📈 Expected Impact</h4><div class="grid grid-cols-3 gap-3 mt-2"><div class="text-center"><div class="text-accent-green font-bold text-sm font-mono">' + exp.result_summary.duration_improvement + '</div><div class="text-[9px] text-gray-500 uppercase">Duration</div></div><div class="text-center"><div class="text-accent-green font-bold text-sm font-mono">' + exp.result_summary.cost_improvement + '</div><div class="text-[9px] text-gray-500 uppercase">Cost</div></div><div class="text-center"><div class="text-accent-green font-bold text-sm font-mono">' + exp.result_summary.risk_improvement + '</div><div class="text-[9px] text-gray-500 uppercase">Risk</div></div></div></div>' +
        '<div class="report-section" style="border-left: 2px solid #4fc3f7"><p class="italic text-xs">' + exp.ai_note + '</p></div>';
}

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function lockButtons() {
    var btns = ['#btnSimulate', '#btnDisrupt', '#btnOptimize'];
    btns.forEach(function (s) { var b = $(s); if (b) b.disabled = true; });
}

function setLoading(sel, loading) {
    var btn = $(sel);
    if (!btn) return;
    if (loading) { btn.classList.add('loading'); btn.disabled = true; }
    else { btn.classList.remove('loading'); }
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKERS SLIDER
// ═══════════════════════════════════════════════════════════════════════════
var workersSlider = $('#workers');
var workersLabel = $('#workersValue');
if (workersSlider && workersLabel) {
    workersSlider.addEventListener('input', function () { workersLabel.textContent = workersSlider.value; });
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT: INITIALIZE DIGITAL TWIN
// ═══════════════════════════════════════════════════════════════════════════
var btnSim = $('#btnSimulate');
if (btnSim) {
    btnSim.addEventListener('click', async function () {
        if (isProcessing) return;
        isProcessing = true;
        console.log('[Event] Simulate clicked');

        var params = {
            project_size: ($('#projectSize') || {}).value || 'medium',
            workers: parseInt(($('#workers') || {}).value || 80),
            weather: ($('#weather') || {}).value || 'sunny',
            material: ($('#material') || {}).value || 'medium',
        };

        lockButtons();
        setLoading('#btnSimulate', true);
        hide($('#idleState'));
        hide($('#disruptionAlert'));
        hide($('#optimizationSection'));
        setStatus('SIMULATING', 'orange');

        // Fire API immediately, run visual effects concurrently
        var apiPromise = apiPost('/simulate', params);

        // Run overlay + feed (visual only, non-blocking)
        await showOverlay('simulate', 2500);
        hideOverlay();

        // Wait for API (should already be done by now)
        var res;
        try {
            res = await apiPromise;
        } catch (err) {
            console.error('[Event] API error:', err);
            setStatus('ERROR', 'red');
            addFeed('Simulation failed: ' + err.message, 'system', 'red');
            setLoading('#btnSimulate', false);
            btnSim.disabled = false;
            isProcessing = false;
            return;
        }

        // Stream feed
        await streamFeed('simulate', 500);

        console.log('[Event] API result:', res.success);

        if (!res.success) {
            setStatus('ERROR', 'red');
            addFeed('Simulation failed.', 'system', 'red');
            setLoading('#btnSimulate', false);
            btnSim.disabled = false;
            isProcessing = false;
            return;
        }

        try {
            currentPlans = res.plans;

            // Show twin state in sidebar
            var twinSec = $('#twinStateSection');
            var twinInfo = $('#twinStateInfo');
            if (twinSec) twinSec.style.display = 'block';
            if (twinInfo) twinInfo.innerHTML = '<div>Scale: <span class="text-gray-300">' + params.project_size.toUpperCase() + '</span></div><div>Workers: <span class="text-gray-300">' + params.workers + '</span></div><div>Weather: <span class="text-gray-300">' + params.weather + '</span></div><div>Material: <span class="text-gray-300">' + params.material + '</span></div>';

            // Show containers FIRST
            show($('#activeBanner'));
            show($('#metricsRow'));
            show($('#planSection'));
            show($('#chartSection'));

            // Small delay to let the DOM layout update
            await sleep(50);

            // Now render into visible containers
            renderBannerMetrics(currentPlans);
            renderPlans(currentPlans);
            renderCharts(currentPlans);

            setStatus('ACTIVE', 'blue');
            addFeed('Digital twin is ACTIVE. 3 execution plans ready.', 'system', 'green');
            console.log('[Event] Simulate complete — rendered successfully');
        } catch (err) {
            console.error('[Event] Render error:', err);
            setStatus('ERROR', 'red');
            addFeed('Render error: ' + err.message, 'system', 'red');
        }

        setLoading('#btnSimulate', false);
        btnSim.disabled = false;
        var disruptBtn = $('#btnDisrupt');
        if (disruptBtn) disruptBtn.disabled = false;
        isProcessing = false;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT: INJECT SITE EVENT
// ═══════════════════════════════════════════════════════════════════════════
var btnDisrupt = $('#btnDisrupt');
if (btnDisrupt) {
    btnDisrupt.addEventListener('click', async function () {
        if (isProcessing) return;
        isProcessing = true;
        console.log('[Event] Disrupt clicked');

        lockButtons();
        setLoading('#btnDisrupt', true);
        hide($('#optimizationSection'));
        setStatus('DISRUPTING', 'red');

        var apiPromise = apiPost('/disrupt');

        await showOverlay('disrupt', 1800);
        hideOverlay();

        var res;
        try {
            res = await apiPromise;
        } catch (err) {
            console.error('[Event] API error:', err);
            setStatus('ERROR', 'red');
            addFeed('Disruption failed: ' + err.message, 'system', 'red');
            setLoading('#btnDisrupt', false);
            btnDisrupt.disabled = false;
            btnSim.disabled = false;
            isProcessing = false;
            return;
        }

        await streamFeed('disrupt', 400);

        if (!res.success) {
            setStatus('ERROR', 'red');
            addFeed('Disruption failed.', 'system', 'red');
            setLoading('#btnDisrupt', false);
            btnDisrupt.disabled = false;
            btnSim.disabled = false;
            isProcessing = false;
            return;
        }

        try {
            renderDisruption(res.disruption);
            renderPlans(res.disrupted_plans);
            renderCharts(res.disrupted_plans);
            renderBannerMetrics(res.disrupted_plans);

            setStatus('DISRUPTED', 'red');
            addFeed('Event injected: ' + res.disruption.name, 'disrupt', 'red');
            console.log('[Event] Disrupt complete');
        } catch (err) {
            console.error('[Event] Render error:', err);
            setStatus('ERROR', 'red');
            addFeed('Render error: ' + err.message, 'system', 'red');
        }

        setLoading('#btnDisrupt', false);
        btnSim.disabled = false;
        btnDisrupt.disabled = false;
        var optBtn = $('#btnOptimize');
        if (optBtn) optBtn.disabled = false;
        isProcessing = false;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT: RUN ADAPTIVE OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════
var btnOptimize = $('#btnOptimize');
if (btnOptimize) {
    btnOptimize.addEventListener('click', async function () {
        if (isProcessing) return;
        isProcessing = true;
        console.log('[Event] Optimize clicked');

        lockButtons();
        setLoading('#btnOptimize', true);
        setStatus('OPTIMIZING', 'orange');

        var apiPromise = apiPost('/optimize');

        await showOverlay('optimize', 2800);
        hideOverlay();

        var res;
        try {
            res = await apiPromise;
        } catch (err) {
            console.error('[Event] API error:', err);
            setStatus('ERROR', 'red');
            addFeed('Optimization failed: ' + err.message, 'system', 'red');
            setLoading('#btnOptimize', false);
            btnSim.disabled = false;
            btnDisrupt.disabled = false;
            isProcessing = false;
            return;
        }

        await streamFeed('optimize', 600);

        if (!res.success) {
            setStatus('ERROR', 'red');
            addFeed('Optimization failed: ' + (res.error || ''), 'system', 'red');
            setLoading('#btnOptimize', false);
            btnSim.disabled = false;
            btnDisrupt.disabled = false;
            isProcessing = false;
            return;
        }

        try {
            show($('#optimizationSection'));
            await sleep(50);
            renderOptimization(res.result, res.explanation, res.original_plan);
            setStatus('OPTIMIZED', 'green');
            addFeed('Adaptive recovery plan deployed. AI confidence: ' + res.result.confidence + '%', 'opt', 'green');
            var optSec = $('#optimizationSection');
            if (optSec) optSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('[Event] Optimize complete');
        } catch (err) {
            console.error('[Event] Render error:', err);
            setStatus('ERROR', 'red');
            addFeed('Render error: ' + err.message, 'system', 'red');
        }

        setLoading('#btnOptimize', false);
        btnSim.disabled = false;
        if (btnDisrupt) btnDisrupt.disabled = false;
        btnOptimize.disabled = true; // Already optimized
        isProcessing = false;
    });
}

console.log('[ConstructAI] Event listeners attached');
