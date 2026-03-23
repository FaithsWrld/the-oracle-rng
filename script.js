const facts = [
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
  "A day on Venus is longer than a year on Venus.",
  "Honey found in ancient Egyptian tombs is still perfectly edible after 3,000 years.",
  "The human body contains enough iron to make a nail about 3 inches long.",
  "Sharks are older than trees — they've existed for over 450 million years.",
  "All the ants on Earth weigh more than all the humans combined.",
  "A group of flamingos is called a 'flamboyance.'",
  "You share 50% of your DNA with a banana.",
  "Oxford University is older than the Aztec Empire.",
  "The inventor of the Pringles can is buried in one.",
  "Crows can recognize human faces and hold grudges for years.",
  "The average person walks enough in a lifetime to circle the Earth five times.",
  "Octopuses have three hearts, blue blood, and their arms have a mind of their own.",
  "There's a planet made almost entirely of diamond, twice the size of Earth.",
  "Humans share 60% of their DNA with a fruit fly.",
  "A bolt of lightning contains enough energy to toast about 100,000 slices of bread.",
  "The shortest war in history lasted 38 to 45 minutes.",
  "Butterflies taste with their feet.",
  "Every atom in your body is billions of years old and was forged inside a dying star.",
  "The total weight of all bacteria on Earth outweighs all animals combined.",
  "A single cloud can weigh over a million pounds.",
  "Your body replaces most of its cells every 7-10 years. You are mostly not who you were.",
  "There are more trees on Earth than stars in the Milky Way.",
  "Wombats produce cube-shaped droppings — the only animal known to do so.",
  "Tardigrades can survive in the vacuum of space, radiation, and boiling water.",
  "The Eiffel Tower grows about 6 inches taller in summer due to heat expansion.",
  "A photon of light takes about 100,000 years to travel from the Sun's core to its surface, then just 8 minutes to reach Earth.",
  "The smell of rain has a name: petrichor. It comes from bacteria in the soil.",
  "A strawberry is not technically a berry, but a banana is.",
];

let count = 0;
let history = [];
let currentNumber = null;

// ── Theme toggle ──────────────────────────────────────────────────────────────

function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('themeBtn');
  if (html.classList.contains('blood-moon')) {
    html.classList.remove('blood-moon');
    localStorage.setItem('theme', 'default');
    btn.textContent = '🌙';
  } else {
    html.classList.add('blood-moon');
    localStorage.setItem('theme', 'blood-moon');
    btn.textContent = '☀️';
  }
}

(function applyTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'blood-moon') {
    document.documentElement.classList.add('blood-moon');
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = '☀️';
  }
})();

// ── Web Audio chime ───────────────────────────────────────────────────────────

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  } catch (e) {
    // Audio not available — silently ignore
  }
}

// ── Sparkle particles ─────────────────────────────────────────────────────────

function spawnSparkles() {
  const display = document.getElementById('display');
  const rect = display.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  for (let i = 0; i < 10; i++) {
    const span = document.createElement('span');
    span.className = 'sparkle';
    const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist = 60 + Math.random() * 60;
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist);
    span.style.left = cx + 'px';
    span.style.top = cy + 'px';
    span.style.setProperty('--dx', dx + 'px');
    span.style.setProperty('--dy', dy + 'px');
    display.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }
}

// ── Copy to clipboard ─────────────────────────────────────────────────────────

function copyNumber() {
  if (currentNumber === null) return;
  navigator.clipboard.writeText(String(currentNumber)).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1500);
  }).catch(() => {});
}

// ── Core generate ─────────────────────────────────────────────────────────────

function updateDisplay(num) {
  count++;
  currentNumber = num;

  const numEl = document.getElementById('numberValue');
  const display = document.getElementById('display');
  numEl.classList.remove('rolling');
  void numEl.offsetWidth;
  numEl.textContent = num;
  numEl.classList.add('rolling');
  display.classList.remove('flash');
  void display.offsetWidth;
  display.classList.add('flash');
  document.getElementById('cornerCount').textContent = `GEN #${count}`;
  document.getElementById('genCount').textContent = count;

  const copyBtn = document.getElementById('copyBtn');
  copyBtn.style.display = 'flex';

  history.unshift(num);
  if (history.length > 8) history.pop();
  const strip = document.getElementById('historyStrip');
  strip.innerHTML = history.map((n, i) =>
    `<div class="history-pill" style="opacity:${1 - i * 0.1}">${n}</div>`
  ).join('');

  playChime();
  spawnSparkles();
}

async function fetchFact(num) {
  const factCard = document.getElementById('factCard');
  const factText = document.getElementById('factText');
  factCard.classList.remove('visible');
  factText.classList.add('loading');
  factText.textContent = 'Consulting the universe';

  await new Promise(r => setTimeout(r, 600));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are a source of the most bizarre, mind-bending, verified facts about life, the universe, science, history, and nature. Return ONLY a single fact as plain text — no quotes, no preamble, no label. Make it weird, surprising, and true. Vary widely: biology, physics, history, geology, animals, time, space. Never repeat yourself.",
        messages: [{ role: "user", content: `Give me one weird fact. The random number generated was ${num}. Use it as a seed for the category.` }]
      })
    });
    const data = await response.json();
    const aiFactText = data.content?.[0]?.text?.trim();
    if (aiFactText) {
      factText.classList.remove('loading');
      factText.textContent = aiFactText;
    } else {
      throw new Error('no content');
    }
  } catch (e) {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    factText.classList.remove('loading');
    factText.textContent = fact;
  }

  factCard.classList.add('visible');
}

function getRandom() {
  const min = parseInt(document.getElementById('minVal').value);
  const max = parseInt(document.getElementById('maxVal').value);
  if (isNaN(min) || isNaN(max) || min >= max) {
    alert('Please enter a valid range (min must be less than max).');
    return null;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generate() {
  const num = getRandom();
  if (num === null) return;
  updateDisplay(num);
  await fetchFact(num);
}

async function roll3() {
  const nums = [getRandom(), getRandom(), getRandom()];
  if (nums[0] === null) return;

  // Add all 3 to history and play chimes; display last one
  for (let i = 0; i < nums.length; i++) {
    await new Promise(r => setTimeout(r, i * 200));
    updateDisplay(nums[i]);
  }

  await fetchFact(nums[nums.length - 1]);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') generate();
});
