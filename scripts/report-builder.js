#!/usr/bin/env node
// Builds a Richard-ready weekly PDF report from this week's log files.
// Called by every slash command after it appends its content.
// Usage: node scripts/report-builder.js [--week=YYYY-Www] [--silent]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

const PROJECT_DIR = '/Users/phobos/Desktop/OneSourceGasBuild';
const LOGS_DIR = path.join(PROJECT_DIR, 'logs');
const DAILY_DIR = path.join(LOGS_DIR, 'daily');
const REPORTS_DIR = path.join(LOGS_DIR, 'reports', 'richard');
const LOGO_PATH = path.join(PROJECT_DIR, 'assets', 'one-source-gas-logo.png');
const TMP_HTML = path.join(REPORTS_DIR, '.weekly-report.html');
const PDF_OUT = path.join(REPORTS_DIR, 'weekly-report.pdf');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SILENT = process.argv.includes('--silent');
const log = (...a) => { if (!SILENT) console.log(...a); };

// Brand colors (matched to the logo + onesourcegasatx.com)
const COLORS = {
  primary: '#259409',
  accent: '#384C8B',
  light: '#E4F5FD',
  dark: '#1F2937',
  text: '#313131',
  muted: '#6B7280',
  border: '#E5E7EB',
};

// --- Date helpers ---
function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function fmtDate(d) {
  return d.toISOString().split('T')[0];
}
function fmtRange(start, end) {
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${end.getFullYear()}`;
}

// --- Read this week's daily logs ---
function loadWeeklyLogs() {
  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d > new Date()) break; // don't include future days
    const dateStr = fmtDate(d);
    const file = path.join(DAILY_DIR, `${dateStr}.md`);
    if (fs.existsSync(file)) {
      days.push({ date: dateStr, content: fs.readFileSync(file, 'utf8') });
    }
  }
  return { days, start, end: new Date(Math.min(end, new Date())) };
}

// --- Extract sections from markdown ---
function extractSection(md, heading) {
  const lines = md.split('\n');
  const out = [];
  let inSection = false;
  for (const line of lines) {
    if (line.match(new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`, 'i'))) {
      inSection = true;
      continue;
    }
    if (inSection && line.match(/^##\s/)) {
      inSection = false;
    }
    if (inSection) out.push(line);
  }
  return out.join('\n').trim();
}

// --- Compose the report markdown ---
function buildReport() {
  const { days, start, end } = loadWeeklyLogs();
  const weekId = isoWeek();

  const shipped = [];
  const forRichard = [];
  const blockers = [];

  for (const day of days) {
    const work = extractSection(day.content, 'What I worked on');
    const richardSection = extractSection(day.content, 'For Richard');
    const notes = extractSection(day.content, 'Decisions / blockers / notes');

    if (work && !work.match(/^_\(.*\)_$/m)) {
      shipped.push(`**${day.date}:**\n${work}`);
    }
    if (richardSection && !richardSection.match(/^_\(.*\)_$/m)) {
      forRichard.push(richardSection);
    }
    if (notes) {
      const blockerLines = notes.split('\n').filter(l => /\b(blocker|blocked|stuck|waiting on)\b/i.test(l));
      blockers.push(...blockerLines);
    }
  }

  // Decisions made this week
  const decisionsFile = path.join(LOGS_DIR, 'decisions.md');
  let decisions = '';
  if (fs.existsSync(decisionsFile)) {
    const all = fs.readFileSync(decisionsFile, 'utf8');
    const weekStart = fmtDate(start);
    const recent = all.split('\n').filter(l => l.includes(weekStart) || days.some(d => l.includes(d.date)));
    if (recent.length > 0) decisions = recent.join('\n');
  }

  // Scope state
  const scopeFile = path.join(LOGS_DIR, 'scope.md');
  let scope = '_Original SOW: $24,500. No change orders yet._';
  if (fs.existsSync(scopeFile)) {
    scope = fs.readFileSync(scopeFile, 'utf8').trim() || scope;
  }

  // Build the report markdown
  const md = `# Weekly Status Report

**Week of:** ${fmtRange(start, end)} (${weekId})
**Project:** One Source Gas — Customer Portal & Website
**For:** Richard Strever
**From:** Brad Ferrer

---

## Shipped this week

${shipped.length ? shipped.join('\n\n') : '_No work logged yet this week._'}

---

## For Richard

${forRichard.length ? forRichard.join('\n\n') : '_No specific items flagged this week._'}

---

## Blockers / things I need from you

${blockers.length ? blockers.map(l => l.trim()).join('\n') : '_None this week._'}

---

## Decisions made

${decisions || '_No new architectural or scope decisions logged this week._'}

---

## Scope status

${scope}

---

*Generated automatically from project logs at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}.*
`;

  return md;
}

// --- Render to HTML and PDF ---
function renderHtml(reportMd) {
  const logoBase64 = fs.readFileSync(LOGO_PATH).toString('base64');
  const logoUrl = `data:image/png;base64,${logoBase64}`;
  const html = marked.parse(reportMd);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Weekly Status Report</title>
<style>
  @page { size: letter; margin: 0.85in 0.8in 1in 0.8in;
    @bottom-right { content: counter(page) " / " counter(pages); color: ${COLORS.muted}; font-size: 9pt; font-family: 'Helvetica Neue', sans-serif; }
    @bottom-left { content: "Weekly Status — One Source Gas"; color: ${COLORS.muted}; font-size: 9pt; font-family: 'Helvetica Neue', sans-serif; }
  }
  @page :first { margin: 0; @bottom-right { content: ""; } @bottom-left { content: ""; } }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; color: ${COLORS.text}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.55; -webkit-print-color-adjust: exact; }
  .cover { page-break-after: always; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 1in; background: linear-gradient(135deg, #ffffff 0%, ${COLORS.light} 100%); }
  .cover-logo { max-width: 4.5in; margin-bottom: 0.4in; }
  .cover-divider { width: 80px; height: 4px; background: ${COLORS.primary}; margin: 0.3in 0; }
  .cover-title { font-size: 26pt; font-weight: 700; color: ${COLORS.dark}; margin: 0 0 0.5in 0; letter-spacing: -0.5px; }
  .cover-meta { font-size: 11pt; line-height: 1.9; }
  .cover-meta strong { color: ${COLORS.primary}; }
  .cover-date { margin-top: 0.4in; color: ${COLORS.muted}; font-size: 10pt; letter-spacing: 0.5px; text-transform: uppercase; }
  h1 { font-size: 22pt; color: ${COLORS.dark}; border-bottom: 3px solid ${COLORS.primary}; padding-bottom: 0.08in; margin: 0.3in 0 0.2in 0; page-break-after: avoid; }
  h1:first-child { margin-top: 0; }
  h2 { font-size: 15pt; color: ${COLORS.primary}; margin: 0.35in 0 0.12in 0; page-break-after: avoid; border-bottom: 1px solid ${COLORS.border}; padding-bottom: 0.05in; }
  h3 { font-size: 12pt; color: ${COLORS.dark}; margin: 0.25in 0 0.08in 0; page-break-after: avoid; }
  p { margin: 0 0 0.12in 0; }
  ul, ol { margin: 0 0 0.15in 0; padding-left: 0.25in; }
  li { margin-bottom: 0.05in; }
  strong { color: ${COLORS.dark}; }
  hr { border: none; border-top: 1px solid ${COLORS.border}; margin: 0.3in 0; }
  blockquote { border-left: 4px solid ${COLORS.primary}; background: ${COLORS.light}; padding: 0.15in 0.2in; margin: 0.15in 0; font-style: italic; }
  table { border-collapse: collapse; width: 100%; margin: 0.15in 0; font-size: 9.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid ${COLORS.border}; padding: 0.08in 0.1in; text-align: left; }
  th { background: ${COLORS.primary}; color: white; font-weight: 600; }
  code { font-family: 'SF Mono', Menlo, monospace; background: #F3F4F6; padding: 0.02in 0.05in; border-radius: 3px; font-size: 9pt; color: ${COLORS.accent}; }
  em { color: ${COLORS.muted}; }
</style></head><body>
<section class="cover">
  <img src="${logoUrl}" alt="One Source Gas of Austin" class="cover-logo" />
  <div class="cover-divider"></div>
  <h1 class="cover-title">Weekly Status Report</h1>
  <div class="cover-meta">
    <div>For <strong>Richard Strever</strong></div>
    <div>One Source Gas of Austin, LLC</div>
    <div>From <strong>Brad Ferrer</strong></div>
    <div class="cover-date">${isoWeek()}</div>
  </div>
</section>
<div class="doc">${html}</div>
</body></html>`;
}

// --- Main ---
function main() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const reportMd = buildReport();
  const html = renderHtml(reportMd);
  fs.writeFileSync(TMP_HTML, html);

  log('Building Richard weekly report...');
  execSync(`"${CHROME}" --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${PDF_OUT}" "file://${TMP_HTML}" 2>/dev/null`, { stdio: 'pipe' });

  // Save the report markdown alongside (so it's git-tracked even if PDF isn't)
  const reportMdPath = path.join(REPORTS_DIR, 'weekly-report.md');
  fs.writeFileSync(reportMdPath, reportMd);

  // Clean up tmp html
  try { fs.unlinkSync(TMP_HTML); } catch {}

  const size = fs.statSync(PDF_OUT).size;
  log(`✓ PDF updated: ${PDF_OUT} (${(size/1024).toFixed(1)} KB)`);
}

main();
