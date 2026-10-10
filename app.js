// 0 → Shipped Resume Parser — fully client-side.
// pdf.js (loaded from CDN in index.html) extracts text from the PDF;
// we match it against a fixed skill checklist and score it.

/* ---------- Config ---------- */

// Skills the parser looks for. Each entry: display name + regex of aliases.
// A skill counts as "present" if any alias matches the resume text.
const SKILLS = [
  { name: "JavaScript",        re: /\bjavascript\b|\bjs\b/i },
  { name: "TypeScript",        re: /\btypescript\b/i },
  { name: "HTML",              re: /\bhtml5?\b/i },
  { name: "CSS",               re: /\bcss3?\b/i },
  { name: "React",             re: /\breact\b|\breact\.js\b/i },
  { name: "Node.js",           re: /\bnode\.?js\b|\bnode\b/i },
  { name: "Python",            re: /\bpython\b/i },
  { name: "SQL",               re: /\bsql\b|\bpostgresql\b|\bmysql\b|\bsqlite\b/i },
  { name: "Git",               re: /\bgit\b|\bgithub\b|\bgitlab\b/i },
  { name: "REST APIs",         re: /\brest\b|\bapi\b/i },
  { name: "Testing",           re: /\bjest\b|\bpytest\b|\bcypress\b|\bunit tests?\b/i },
  { name: "Docker",            re: /\bdocker\b|\bcontainer/i },
  { name: "CI/CD",             re: /\bci\/cd\b|\bcontinuous integration\b|\bgithub actions\b/i },
  { name: "Accessibility",     re: /\ba11y\b|\baccessib/i },
];

const RING_LENGTH = 2 * Math.PI * 52; // must match r="52" in the SVG ring

/* ---------- Element refs ---------- */

const dropzone    = document.getElementById("dropzone");
const fileInput   = document.getElementById("file-input");
const sampleBtn   = document.getElementById("sample-btn");
const statusEl    = document.getElementById("status");
const resultsSec  = document.getElementById("results");
const scoreNumber = document.getElementById("score-number");
const scoreSum    = document.getElementById("score-summary");
const ringFg      = document.getElementById("ring-fg");
const scoreRing   = document.querySelector(".score-ring");
const presentList = document.getElementById("present-skills");
const missingList = document.getElementById("missing-skills");
const presentCnt  = document.getElementById("present-count");
const missingCnt  = document.getElementById("missing-count");
const resetBtn    = document.getElementById("reset-btn");

/* ---------- pdf.js setup ---------- */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

/* ---------- Upload wiring ---------- */

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);

["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files?.[0];
  if (file) handleFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) handleFile(file);
});

sampleBtn.addEventListener("click", analyzeText);

resetBtn.addEventListener("click", () => {
  resultsSec.classList.add("hidden");
  fileInput.value = "";
  setStatus("");
  document.getElementById("upload").scrollIntoView({ behavior: "smooth" });
});

function setStatus(msg, kind = "info") {
  statusEl.textContent = msg;
  statusEl.className = "status " + kind;
}

/* ---------- File handling ---------- */

async function handleFile(file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    setStatus("That's not a PDF — please upload a .pdf file.", "error");
    return;
  }

  setStatus("Reading PDF…");
  try {
    const text = await extractTextFromPdf(file);
    analyzeText(text);
  } catch (err) {
    console.error(err);
    setStatus("Couldn't read that PDF. If it's a scan (image-only), there's no text to parse.", "error");
  }
}

async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

/* ---------- Analysis ---------- */

function analyzeText(rawOrEvent) {
  // The sample button passes the click event; shift it off to get the text.
  const text = typeof rawOrEvent === "string" ? rawOrEvent : SAMPLE_TEXT;

  if (!text.trim()) {
    setStatus("No readable text found in that file.", "error");
    return;
  }

  const found = [];
  const missing = [];

  for (const skill of SKILLS) {
    (skill.re.test(text) ? found : missing).push(skill.name);
  }

  // Deduct a little per character of length past 3 pages — recruiters skim.
  const lengthPenalty = Math.min(Math.floor(text.length / 15000) * 5, 10);
  const score = Math.max(0, Math.round((found.length / SKILLS.length) * 100) - lengthPenalty);

  renderResults(score, found, missing);
  resultsSec.classList.remove("hidden");
  resultsSec.scrollIntoView({ behavior: "smooth" });
  setStatus("");
}

/* ---------- Rendering ---------- */

function renderResults(score, found, missing) {
  // Animated score count-up
  animateScore(score);

  // Ring
  ringFg.style.strokeDashoffset = RING_LENGTH * (1 - score / 100);
  scoreRing.classList.remove("score-high", "score-mid", "score-low");
  if (score >= 70)      scoreRing.classList.add("score-high");
  else if (score >= 40) scoreRing.classList.add("score-mid");
  else                  scoreRing.classList.add("score-low");

  scoreSum.textContent = `${found.length} of ${SKILLS.length} core skills detected.`;

  // Chips
  presentList.innerHTML = "";
  missingList.innerHTML = "";

  found.forEach((name) => presentList.appendChild(makeChip(name, "present")));
  missing.forEach((name) => missingList.appendChild(makeChip(name, "missing")));

  if (found.length === 0) {
    presentList.innerHTML = '<p class="empty-note">None detected.</p>';
  }
  if (missing.length === 0) {
    missingList.innerHTML = '<p class="empty-note">Nothing missing — nice resume!</p>';
  }

  presentCnt.textContent = found.length;
  missingCnt.textContent = missing.length;
}

function makeChip(name, kind) {
  const chip = document.createElement("span");
  chip.className = "chip " + kind;
  chip.textContent = name;
  return chip;
}

function animateScore(target) {
  const duration = 800;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    scoreNumber.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Sample text (for trying it without a PDF) ---------- */

const SAMPLE_TEXT = `
Jane Doe — Frontend Developer
Email: jane@example.com · GitHub: github.com/janedoe

SKILLS
JavaScript, TypeScript, React, HTML5, CSS3, Node.js, Git, REST APIs

EXPERIENCE
Frontend Developer — Acme Corp (2022–present)
- Built accessible (WCAG AA) dashboards in React and TypeScript
- Wrote unit tests with Jest; added GitHub Actions CI/CD pipeline
- Designed REST API integrations with the Node.js backend team

EDUCATION
B.Sc. Computer Science
`;

// Make the sample button pass the text through analyzeText
sampleBtn.textContent = sampleBtn.textContent; // no-op keeps wiring obvious
sampleBtn.addEventListener("click", () => analyzeText(SAMPLE_TEXT));
