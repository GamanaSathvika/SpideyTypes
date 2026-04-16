// ═══════════════════════════════════════════════
//  WORD BANKS
// ═══════════════════════════════════════════════
const wordBanks = {
  english: {
    simple: ["the","quick","brown","fox","jumps","over","lazy","dog","cat","sat","mat","hat","run","fun","sun","cup","pup","map","cap","tap","big","pig","dig","fig","wig","jig","log","fog","hog","cog","top","mop","hop","pop","cop","bed","red","fed","led","ned","bit","hit","sit","fit","kit","bus","gus","bun","gun","nun","run"],
    advanced: ["algorithm","synchronize","persistent","development","architecture","infrastructure","comprehensive","optimization","visualization","authentication","implementation","configuration","differentiation","sophisticated","revolutionary","entrepreneurship","collaboration","documentation","accessibility","customization"]
  },
  dutch: {
    simple: ["de","het","een","van","en","in","is","dat","op","te","met","zijn","voor","niet","aan","er","maar","om","door","ze"],
    advanced: ["ontwikkeling","samenwerking","beschikbaarheid","verantwoordelijkheid","organisatie","administratie","communicatie","infrastructuur","implementatie","documentatie"]
  },
  french: {
    simple: ["le","la","les","un","une","des","de","du","et","en","est","pas","que","qui","sur","par","avec","son","au","je"],
    advanced: ["développement","organisation","administration","communication","infrastructure","documentation","accessibilité","optimisation","visualisation","configuration"]
  },
  german: {
    simple: ["der","die","das","ein","und","ist","in","von","zu","mit","sich","des","auf","für","nicht","auch","an","er","sie","es"],
    advanced: ["Entwicklung","Zusammenarbeit","Verfügbarkeit","Verantwortung","Organisation","Infrastruktur","Dokumentation","Optimierung","Konfiguration","Implementierung"]
  }
};

const punctChars = [".", ",", "!", "?", ";", ":"];
const numberWords = ["0","1","2","3","4","5","6","7","8","9","10","100","42","365","2024"];

// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
let settings = {
  duration: 60,
  highlight: "char",   // char | word | caret
  errorFlash: true,
  wordList: "simple",
  punctuation: false,
  numbers: false,
  showWpm: true,
  showTimer: true,
  language: "english"
};

let words = [];
let wordIndex = 0;
let charIndex = 0;
let wc = 0, cwc = 0, wwc = 0;
let timestarted = false;
let seconds = 0;
let timer = null;
let testDone = false;

// ═══════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════
const paraEl     = document.getElementById('para');
const inputBox   = document.getElementById('inputBox');
const wpmChip    = document.getElementById('wpmChip');
const counterChip= document.getElementById('counterChip');
const resetBtn   = document.getElementById('resetBtn');
const dispSpeed  = document.getElementById('dispSpeed');
const dispRaw    = document.getElementById('dispRaw');
const dispAcc    = document.getElementById('dispAcc');
const dispCC     = document.getElementById('dispCC');
const dispWC     = document.getElementById('dispWC');
const toastEl    = document.getElementById('toast');

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ═══════════════════════════════════════════════
//  GENERATE WORD LIST
// ═══════════════════════════════════════════════
function generateWords(count = 60) {
  const bank = [...wordBanks[settings.language][settings.wordList]];
  let pool = [];

  for (let i = 0; i < count; i++) {
    let w = bank[Math.floor(Math.random() * bank.length)];
    if (settings.numbers && Math.random() < 0.15) {
      w = numberWords[Math.floor(Math.random() * numberWords.length)];
    }
    if (settings.punctuation && Math.random() < 0.2) {
      w += punctChars[Math.floor(Math.random() * punctChars.length)];
    }
    pool.push(w);
  }
  return pool;
}

// ═══════════════════════════════════════════════
//  RENDER PARAGRAPH
// ═══════════════════════════════════════════════
function renderPara() {
  paraEl.innerHTML = '';
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word' + (wi === wordIndex ? ' current-word' : '');
    wordSpan.dataset.wi = wi;

    [...word].forEach((ch, ci) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.dataset.wi = wi;
      charSpan.dataset.ci = ci;
      charSpan.textContent = ch;
      wordSpan.appendChild(charSpan);
    });

    // caret mode: add caret span at end of current word
    if (settings.highlight === 'caret' && wi === wordIndex) {
      const caret = document.createElement('span');
      caret.className = 'char current';
      caret.textContent = '';
      caret.style.borderLeft = '2px solid var(--caret)';
      caret.style.animation = 'blink 0.9s step-end infinite';
      wordSpan.appendChild(caret);
    }

    paraEl.appendChild(wordSpan);
    if (wi < words.length - 1) paraEl.appendChild(document.createTextNode(' '));
  });
}

// ═══════════════════════════════════════════════
//  UPDATE CHAR HIGHLIGHTING
// ═══════════════════════════════════════════════
function updateHighlight(typed) {
  if (settings.highlight === 'word') {
    // just highlight current word block — no per-char coloring
    document.querySelectorAll('.word').forEach((w, wi) => {
      w.className = 'word' + (wi === wordIndex ? ' current-word' : '');
    });
    return;
  }

  if (settings.highlight === 'caret') {
    // show caret position only
    document.querySelectorAll('.char').forEach(c => c.classList.remove('current','correct','wrong'));
    const wordSpan = paraEl.querySelector(`.word[data-wi="${wordIndex}"]`);
    if (!wordSpan) return;
    const chars = wordSpan.querySelectorAll('.char');
    const pos = Math.min(typed.length, chars.length - 1);
    if (chars[pos]) chars[pos].classList.add('current');
    return;
  }

  // CHAR mode: color each character
  const wordSpan = paraEl.querySelector(`.word[data-wi="${wordIndex}"]`);
  if (!wordSpan) return;
  const chars = wordSpan.querySelectorAll('.char');

  chars.forEach((c, ci) => {
    c.classList.remove('correct', 'wrong', 'current');
    if (ci < typed.length) {
      c.classList.add(typed[ci] === c.textContent ? 'correct' : 'wrong');
    } else if (ci === typed.length) {
      c.classList.add('current');
    }
  });
}

// ═══════════════════════════════════════════════
//  GET MAX TIME
// ═══════════════════════════════════════════════
function getMaxTime() { return settings.duration; }

// ═══════════════════════════════════════════════
//  FORMAT TIME
// ═══════════════════════════════════════════════
function fmtTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════
//  START TIMER
// ═══════════════════════════════════════════════
function startTimer() {
  timestarted = true;
  seconds = getMaxTime();
  timer = setInterval(() => {
    seconds--;
    counterChip.textContent = fmtTime(seconds);
    updateLiveWpm();
    if (seconds <= 0) endTest();
  }, 1000);
}

// ═══════════════════════════════════════════════
//  LIVE WPM
// ═══════════════════════════════════════════════
function updateLiveWpm() {
  const elapsed = getMaxTime() - seconds;
  if (elapsed > 0 && settings.showWpm) {
    wpmChip.textContent = `${Math.floor((cwc / elapsed) * 60)} WPM`;
  }
}

// ═══════════════════════════════════════════════
//  END TEST
// ═══════════════════════════════════════════════
function endTest() {
  clearInterval(timer);
  testDone = true;
  inputBox.disabled = true;

  // count last partial word
  const typed = inputBox.value.trim();
  if (typed && wordIndex < words.length) {
    wc++;
    if (typed === words[wordIndex]) cwc++; else wwc++;
  }

  const elapsed = getMaxTime() - seconds;
  const wpm = elapsed > 0 ? Math.floor((cwc / elapsed) * 60) : 0;
  const raw  = elapsed > 0 ? Math.floor((wc  / elapsed) * 60) : 0;
  const acc  = wc > 0 ? Math.floor((cwc / wc) * 100) : 100;

  dispSpeed.textContent = `${wpm}`;
  dispRaw.textContent   = `${raw} WPM`;
  dispAcc.textContent   = `${acc}%`;
  dispCC.textContent    = `${cwc}`;
  dispWC.textContent    = `${wwc}`;

  wpmChip.textContent = `${wpm} WPM`;
}

// ═══════════════════════════════════════════════
//  RESET
// ═══════════════════════════════════════════════
function reset() {
  clearInterval(timer);
  wc = 0; cwc = 0; wwc = 0;
  wordIndex = 0; charIndex = 0;
  timestarted = false; testDone = false;
  seconds = 0;
  inputBox.value = '';
  inputBox.disabled = false;
  inputBox.classList.remove('error-highlight');
  wpmChip.textContent = '0 WPM';
  wpmChip.style.opacity = settings.showWpm ? '1' : '0';
  counterChip.textContent = fmtTime(getMaxTime());
  counterChip.style.opacity = settings.showTimer ? '1' : '0';
  dispSpeed.textContent = '—';
  dispRaw.textContent = '—';
  dispAcc.textContent = '—';
  dispCC.textContent = '—';
  dispWC.textContent = '—';
  words = generateWords(80);
  renderPara();
  inputBox.focus();
}

// ═══════════════════════════════════════════════
//  INPUT HANDLING
// ═══════════════════════════════════════════════
inputBox.addEventListener('keydown', function(e) {
  if (testDone) { e.preventDefault(); return; }

  if (!timestarted && e.key.length === 1) startTimer();

  if (e.key === ' ') {
    e.preventDefault();
    const typed = inputBox.value.trim();
    if (!typed) return;

    wc++;
    if (typed === words[wordIndex]) {
      cwc++;
    } else {
      wwc++;
      if (settings.errorFlash) {
        inputBox.classList.add('error-highlight');
        setTimeout(() => inputBox.classList.remove('error-highlight'), 300);
      }
    }

    inputBox.value = '';
    wordIndex++;

    // clear old word highlight
    document.querySelectorAll('.word').forEach((w, wi) => {
      w.className = 'word' + (wi === wordIndex ? ' current-word' : '');
    });

    updateLiveWpm();

    if (wordIndex >= words.length) endTest();
  }
});

inputBox.addEventListener('input', function() {
  if (testDone) return;
  updateHighlight(inputBox.value);
});

// Esc to reset
document.addEventListener('keydown', e => { if (e.key === 'Escape') reset(); });
resetBtn.addEventListener('click', reset);

// ═══════════════════════════════════════════════
//  SETTINGS WIRING
// ═══════════════════════════════════════════════

// Generic exclusive button group helper
function wireGroup(groupId, onChange) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onChange(btn);
    });
  });
}

// Duration
wireGroup('durationGroup', btn => {
  settings.duration = parseInt(btn.dataset.val);
  reset();
  showToast(`Duration: ${btn.textContent}`);
});

// Highlight style
wireGroup('highlightGroup', btn => {
  settings.highlight = btn.dataset.mode;
  renderPara();
  showToast(`Highlight: ${btn.textContent}`);
});

// Error flash
wireGroup('errorGroup', btn => {
  settings.errorFlash = btn.dataset.val === 'on';
  showToast(`Error flash: ${btn.textContent}`);
});

// Word list
wireGroup('wordsGroup', btn => {
  settings.wordList = btn.dataset.val;
  reset();
  showToast(`Words: ${btn.textContent}`);
});

// Punctuation
wireGroup('punctGroup', btn => {
  settings.punctuation = btn.dataset.val === 'on';
  reset();
  showToast(`Punctuation: ${btn.textContent}`);
});

// Numbers
wireGroup('numbersGroup', btn => {
  settings.numbers = btn.dataset.val === 'on';
  reset();
  showToast(`Numbers: ${btn.textContent}`);
});

// Show WPM
wireGroup('wpmGroup', btn => {
  settings.showWpm = btn.dataset.val === 'show';
  wpmChip.style.opacity = settings.showWpm ? '1' : '0';
  showToast(`WPM: ${btn.textContent}`);
});

// Show Timer
wireGroup('timerGroup', btn => {
  settings.showTimer = btn.dataset.val === 'show';
  counterChip.style.opacity = settings.showTimer ? '1' : '0';
  showToast(`Timer: ${btn.textContent}`);
});

// Language
document.getElementById('langSelect').addEventListener('change', function() {
  settings.language = this.value;
  reset();
  showToast(`Language: ${this.options[this.selectedIndex].text}`);
});

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
reset();
