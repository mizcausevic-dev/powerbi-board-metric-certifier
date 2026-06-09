import { mkdir, writeFile } from "node:fs/promises";
import { buildCertification } from "../src/index.js";
import sample from "../fixtures/powerbi-metric-sample.json" with { type: "json" };

const certification = buildCertification(sample);

const escapeHtml = (value: string | number): string =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const cards = certification.metrics
  .map(
    (metric) => `
      <article class="card metric-card">
        <div class="top"><span>${escapeHtml(metric.tier)}</span><strong>${escapeHtml(metric.trustScore)}</strong></div>
        <h3>${escapeHtml(metric.name)}</h3>
        <p>${escapeHtml(metric.narrative)}</p>
        <dl>
          <div><dt>Dashboard</dt><dd>${escapeHtml(metric.dashboard)}</dd></div>
          <div><dt>Audience</dt><dd>${escapeHtml(metric.audience)}</dd></div>
          <div><dt>Lineage</dt><dd>${escapeHtml(metric.lineageCompleteness)}%</dd></div>
          <div><dt>Reconcile</dt><dd>${escapeHtml(metric.reconciliationCoverage)}%</dd></div>
          <div><dt>Owner</dt><dd>${escapeHtml(metric.owner)}</dd></div>
          <div><dt>Signoff age</dt><dd>${escapeHtml(metric.ownerSignoffAgeDays)}d</dd></div>
        </dl>
        <div class="next-action">
          <span>Next action</span>
          <p>${escapeHtml(metric.nextAction)}</p>
        </div>
        <p class="route">${escapeHtml(metric.route)}</p>
      </article>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Power BI Board Metric Certifier</title>
  <meta name="description" content="Board-readable Power BI metric certification for lineage, refresh health, reconciliation, owner signoff, and dashboard trust." />
  <style>
    :root{color-scheme:dark;--bg:#050914;--panel:#0c1726;--panel2:#101c2e;--ink:#f4f1e8;--text:#f4f1e8;--muted:#aab6c8;--soft:#d6def2;--cyan:#28ddf2;--mint:#55f2bc;--gold:#ffd166;--violet:#a78bfa;--line:rgba(40,221,242,.24);--hair:rgba(255,255,255,.09)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 14% 0%,rgba(255,209,102,.14),transparent 34rem),radial-gradient(circle at 90% 12%,rgba(40,221,242,.16),transparent 30rem),linear-gradient(180deg,#050914,#07101d 54%,#050914);color:var(--text);font-family:"Segoe UI",system-ui,sans-serif}
    a{color:inherit}main{width:min(1180px,calc(100vw - 32px));margin:auto;padding:56px 0}.hero{border:1px solid var(--line);border-radius:30px;background:linear-gradient(135deg,rgba(16,28,46,.96),rgba(7,10,21,.95));padding:clamp(28px,5vw,58px);box-shadow:0 30px 90px rgba(0,0,0,.35);position:relative;overflow:hidden}.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(167,139,250,.14),transparent 34%,rgba(85,242,188,.08));pointer-events:none}
    .hero>*{position:relative}.eyebrow{color:var(--gold);letter-spacing:.18em;text-transform:uppercase;font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace}h1{max-width:980px;margin:18px 0;font-size:clamp(44px,8vw,104px);line-height:.91;letter-spacing:-.06em}.lede{max-width:820px;color:var(--muted);font-size:clamp(18px,2.2vw,24px);line-height:1.55}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:34px}.metric{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.04);padding:20px}.metric strong{display:block;font-size:34px}.metric span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.12em}
    .section{margin-top:28px;border:1px solid var(--line);border-radius:28px;background:rgba(12,23,38,.78);padding:clamp(22px,3vw,34px)}.section-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.section-kicker{color:var(--mint);letter-spacing:.16em;text-transform:uppercase;font:800 12px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace}h2{margin:0 0 14px;font-size:clamp(30px,4vw,54px);line-height:1;letter-spacing:-.04em}.summary{max-width:720px;color:var(--muted);font-size:18px;line-height:1.55}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.three{grid-template-columns:repeat(3,1fr)}
    .card{border:1px solid rgba(255,255,255,.1);border-radius:22px;background:linear-gradient(180deg,rgba(16,28,46,.96),rgba(8,15,27,.96));padding:22px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.top{display:flex;justify-content:space-between;gap:18px;color:var(--cyan);font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em}.top strong{color:var(--mint);font-size:30px;letter-spacing:0}h3{margin:16px 0 10px;font-size:25px;line-height:1.08}p{color:var(--muted);line-height:1.55}
    dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}dt{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em}dd{margin:4px 0 0;font-weight:800;color:var(--soft)}.next-action{margin-top:16px;border:1px solid rgba(85,242,188,.18);border-radius:16px;background:rgba(85,242,188,.06);padding:14px}.next-action span{color:var(--mint);letter-spacing:.14em;text-transform:uppercase;font:800 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace}.next-action p{margin:8px 0 0;color:var(--text)}.route{color:var(--text);border-top:1px solid rgba(255,255,255,.08);padding-top:14px}.pill-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.pill{border:1px solid rgba(167,139,250,.3);border-radius:999px;background:rgba(167,139,250,.08);padding:10px 13px;color:var(--soft);font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace}
    .timeline{display:grid;gap:12px}.step{display:grid;grid-template-columns:48px 1fr;gap:14px;align-items:start;border:1px solid var(--hair);border-radius:18px;background:rgba(255,255,255,.035);padding:16px}.step strong{display:grid;place-items:center;width:38px;height:38px;border-radius:999px;background:rgba(40,221,242,.1);color:var(--cyan);border:1px solid var(--line)}.step h3{margin:0 0 6px;font-size:20px}.step p{margin:0}.boundary{border-color:rgba(255,209,102,.3);background:linear-gradient(135deg,rgba(255,209,102,.08),rgba(12,23,38,.76))}footer{color:var(--muted);padding:24px 0 8px;font-size:14px;display:flex;flex-wrap:wrap;gap:12px}footer a{color:var(--cyan);text-decoration:none}
    @media(max-width:900px){.metrics,.grid,.three{grid-template-columns:1fr}.section-head{display:block}}@media(max-width:760px){main{padding:28px 0}.hero,.section{border-radius:22px}h1{font-size:clamp(42px,16vw,70px)}dl{grid-template-columns:1fr}.step{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:460px){.metrics{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">Power BI metric trust</div>
      <h1>Board metrics should be certified before they become the story.</h1>
      <p class="lede">Power BI Board Metric Certifier turns lineage completeness, refresh health, reconciliation, owner signoff, and source variance into one dashboard-trust posture executives can use before a metric reaches the board packet.</p>
      <div class="metrics">
        <div class="metric"><strong>${escapeHtml(certification.summary.metricCount)}</strong><span>Board metrics</span></div>
        <div class="metric"><strong>${escapeHtml(certification.summary.meanTrustScore)}</strong><span>Mean trust score</span></div>
        <div class="metric"><strong>${escapeHtml(certification.summary.certifiedCount)}</strong><span>Certified</span></div>
        <div class="metric"><strong>${escapeHtml(certification.summary.blockedCount)}</strong><span>Blocked</span></div>
      </div>
      <div class="pill-list" aria-label="Signal tags">
        <span class="pill">Power BI</span><span class="pill">board metrics</span><span class="pill">lineage</span><span class="pill">reconciliation</span><span class="pill">owner signoff</span>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-kicker">Executive intelligence product</div>
          <h2>What this does</h2>
        </div>
        <p class="summary">The product gives finance, GTM, analytics, and operating leaders a shared certification lane for the numbers they are about to defend. It is not a dashboard gallery. It is a decision-control surface for whether a metric is safe to use, needs watch conditions, or should be blocked from board use until evidence improves.</p>
      </div>
      <div class="grid three">
        <article class="card">
          <div class="top"><span>GTM analyst lens</span></div>
          <h3>Stops metric debate from becoming pipeline theater.</h3>
          <p>Revenue leaders can show which conversion, retention, and margin metrics have source reconciliation and which ones still need definition cleanup before they influence forecast, compensation, or investor narrative.</p>
        </article>
        <article class="card">
          <div class="top"><span>SaaS value lens</span></div>
          <h3>Turns trust gaps into investable remediation.</h3>
          <p>Instead of arguing over whether a dashboard is right, teams can quantify the evidence gap: lineage, refresh, reconciliation, signoff age, source variance, and downstream blast radius.</p>
        </article>
        <article class="card">
          <div class="top"><span>Technical proof</span></div>
          <h3>Uses deterministic scoring and fixture-backed output.</h3>
          <p>The repo includes a typed certification engine, sample data, CLI output, tests, and a static proof surface so reviewers can inspect the calculation path without production credentials.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <h2>Metric certification register</h2>
      <p><strong>Primary recommendation:</strong> ${escapeHtml(certification.summary.primaryRecommendation)}</p>
      <div class="grid">${cards}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-kicker">Operating workflow</div>
          <h2>How a board metric gets cleared</h2>
        </div>
        <p class="summary">The workflow is designed for reusable diligence packs: intake the metric, score the evidence, route the gap, then publish the board-safe posture with the owner and next action attached.</p>
      </div>
      <div class="timeline">
        <div class="step"><strong>1</strong><div><h3>Register the metric and owner</h3><p>Capture the dashboard, business audience, accountable owner, source system, and business criticality before the metric is used in an executive room.</p></div></div>
        <div class="step"><strong>2</strong><div><h3>Score the evidence bundle</h3><p>Evaluate lineage completeness, refresh health, reconciliation coverage, definition clarity, owner signoff age, source variance, and downstream dashboard blast radius.</p></div></div>
        <div class="step"><strong>3</strong><div><h3>Route remediation by tier</h3><p>Certified metrics stay usable. Watch metrics get conditions. Review metrics need owner action. Blocked metrics stay out of the board packet until evidence is restored.</p></div></div>
        <div class="step"><strong>4</strong><div><h3>Publish the executive story</h3><p>Produce a board-readable posture that explains which numbers can be trusted, which need cleanup, and what investment or operating action follows.</p></div></div>
      </div>
    </section>

    <section class="section boundary">
      <div class="section-kicker">What these repos have in common</div>
      <h2>They convert platform complexity into board-ready operating proof.</h2>
      <p class="summary">This Power BI surface is part of the Kinetic Gain pattern: every repo should name a buyer pain, expose the operating evidence, produce a reusable artifact, and stay safe to review publicly. The public page uses synthetic data only; production analytics data, credentials, tenant IDs, and customer exports stay outside the repo.</p>
    </section>

    <footer>
      <span>Power BI Board Metric Certifier</span>
      <span>·</span>
      <a href="https://portfolio.kineticgain.com/">Portfolio</a>
      <a href="https://kineticgain.com/">Kinetic Gain</a>
      <a href="https://github.com/mizcausevic-dev/powerbi-board-metric-certifier">GitHub</a>
    </footer>
  </main>
</body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
