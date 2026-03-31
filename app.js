// ============================================================
// Japanese Trainer - app.js
// Full SPA: SM-2 spaced repetition, flashcards, quiz (MC/
// typing/listening), kana tables, reference search, cities.
// All state persisted in localStorage.
// ============================================================

// --- State -----------------------------------------------
let state = {
  currentView: 'dashboard',
  cards: {},              // id -> SM-2 card object
  deck: 'all',            // active flashcard deck
  currentCardIndex: 0,    // index into due queue
  dueQueue: [],           // ordered list of card ids due today
  quizState: {
    active: false,
    type: null,           // 'mc' | 'typing' | 'listening'
    question: null,
    options: [],
    answered: false,
    correct: 0,
    wrong: 0,
    total: 10,
    current: 0,
    phrasesOnly: false
  },
  kanaTab: 'hiragana',
  refSearch: '',
  refCategory: 'all',
  streak: 0,
  lastActiveDate: null,
  reviewedToday: [],      // card ids reviewed today (for streak)
  masteredCards: {}       // id -> bool: true if interval >= 7
};

const STORAGE_KEY = 'jptrainer_v2';

// --- Persistence -----------------------------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge saved state, keeping defaults for any missing keys
      state = Object.assign({}, state, saved);
    }
  } catch (e) { console.warn('Could not load state', e); }
  // Ensure all cards exist for all items
  initCards();
  updateStreak();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.warn('Could not save state', e); }
}

function initCards() {
  // Init hiragana cards
  HIRAGANA.forEach(h => {
    const id = 'h_' + h.romaji;
    if (!state.cards[id]) state.cards[id] = createCard(id, 'hiragana');
  });
  // Init katakana cards
  KATAKANA.forEach(k => {
    const id = 'k_' + k.romaji;
    if (!state.cards[id]) state.cards[id] = createCard(id, 'katakana');
  });
  // Init phrase cards
  PHRASES.forEach(p => {
    if (!state.cards[p.id]) state.cards[p.id] = createCard(p.id, 'phrase');
  });
}

// --- SM-2 Algorithm -------------------------------------
// rating: 0=Again, 1=Hard, 2=Good, 3=Easy
// Maps to SM-2 quality: 0->1, 1->3, 2->4, 3->5
function sm2(card, rating) {
  const quality = [1, 3, 4, 5][rating];
  let { interval, repetitions, easeFactor } = card;

  if (quality < 3) {
    // Failed: reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (SM-2 formula)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReview = nextDate.toISOString().slice(0, 10);

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    nextReview,
    lastReview: new Date().toISOString().slice(0, 10),
    totalReviews: (card.totalReviews || 0) + 1,
    correctReviews: (card.correctReviews || 0) + (quality >= 3 ? 1 : 0)
  };
}

// Estimate next interval for display (without modifying card)
function previewInterval(card, rating) {
  const quality = [1, 3, 4, 5][rating];
  let { interval, repetitions, easeFactor } = card;
  if (quality < 3) return '1d';
  if (repetitions === 0) return '1d';
  if (repetitions === 1) return '6d';
  const ef = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.round(interval * ef) + 'd';
}

// --- Streak Management -----------------------------------
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (state.lastActiveDate === today) {
    // Already active today, streak unchanged
  } else if (state.lastActiveDate === yesterday) {
    // Was active yesterday, streak continues (will increment when they study)
  } else if (state.lastActiveDate && state.lastActiveDate < yesterday) {
    // Missed a day — reset streak
    state.streak = 0;
  }
}

function markActiveToday() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (state.lastActiveDate !== today) {
    if (state.lastActiveDate === yesterday) {
      state.streak = (state.streak || 0) + 1;
    } else if (!state.lastActiveDate) {
      state.streak = 1;
    } else if (state.lastActiveDate < yesterday) {
      state.streak = 1; // Reset
    }
    state.lastActiveDate = today;
    state.reviewedToday = [];
    saveState();
  }
}

// --- Navigation ------------------------------------------
function navigate(view) {
  state.currentView = view;
  // Reset transient view state
  if (view === 'flashcards') {
    buildDueQueue();
    state.currentCardIndex = 0;
  }
  if (view === 'quiz') {
    resetQuiz();
  }
  // Update nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  // Close mobile nav
  const nav = document.getElementById('mainNav');
  const ham = document.getElementById('hamburger');
  if (nav) nav.classList.remove('open');
  if (ham) ham.classList.remove('open');
  // Render
  const main = document.getElementById('mainContent');
  if (main) {
    main.innerHTML = '';
    main.appendChild(renderView(view));
    // Scroll to top
    main.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  saveState();
}

function renderView(view) {
  const views = {
    dashboard:  renderDashboard,
    curriculum: renderCurriculum,
    flashcards: renderFlashcards,
    quiz:       renderQuiz,
    kana:       renderKana,
    reference:  renderReference,
    cities:     renderCities
  };
  const fn = views[view] || renderDashboard;
  return fn();
}

// --- Build DOM helper ------------------------------------
function mkEl(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function html(strings, ...vals) {
  return strings.reduce((acc, s, i) => acc + s + (vals[i] !== undefined ? vals[i] : ''), '');
}

// --- Progress Calculations ------------------------------
function getToday() { return new Date().toISOString().slice(0, 10); }

function getDueCards(deckFilter) {
  const today = getToday();
  return Object.values(state.cards).filter(c => {
    if (!matchesDeck(c, deckFilter)) return false;
    return c.nextReview <= today;
  });
}

function matchesDeck(card, deck) {
  if (!deck || deck === 'all') return true;
  if (deck === 'hiragana')  return card.type === 'hiragana';
  if (deck === 'katakana')  return card.type === 'katakana';
  // Phrase category filter
  if (card.type === 'phrase') {
    const phrase = PHRASES.find(p => p.id === card.id);
    return phrase && phrase.category === deck;
  }
  return false;
}

function getMastered(type) {
  return Object.values(state.cards).filter(c => c.type === type && c.interval >= 7).length;
}

function getTotalByType(type) {
  if (type === 'hiragana') return HIRAGANA.length;
  if (type === 'katakana') return KATAKANA.length;
  if (type === 'phrase')   return PHRASES.length;
  return 0;
}

function getPct(mastered, total) {
  if (!total) return 0;
  return Math.round((mastered / total) * 100);
}

function buildDueQueue() {
  const today = getToday();
  const due = Object.values(state.cards).filter(c => {
    if (!matchesDeck(c, state.deck)) return false;
    return c.nextReview <= today;
  });
  // Sort: overdue first, then by nextReview
  due.sort((a, b) => a.nextReview.localeCompare(b.nextReview));
  state.dueQueue = due.map(c => c.id);
}

function getCardData(cardId) {
  const card = state.cards[cardId];
  if (!card) return null;
  if (card.type === 'hiragana') {
    const h = HIRAGANA.find(h => 'h_' + h.romaji === cardId);
    return h ? { type: 'hiragana', japanese: h.char, romaji: h.romaji, english: h.romaji.toUpperCase() + ' (hiragana)', category: 'hiragana' } : null;
  }
  if (card.type === 'katakana') {
    const k = KATAKANA.find(k => 'k_' + k.romaji === cardId);
    return k ? { type: 'katakana', japanese: k.char, romaji: k.romaji, english: k.romaji.toUpperCase() + ' (katakana)', category: 'katakana' } : null;
  }
  if (card.type === 'phrase') {
    return PHRASES.find(p => p.id === cardId) || null;
  }
  return null;
}

// --- SVG Ring helper ------------------------------------
function ringHTML(pct, color, size) {
  size = size || 80;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ;
  const offset = circ - (pct / 100) * circ;
  return `
    <div class="ring-wrap" style="width:${size}px;height:${size}px;position:relative;">
      <svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${r}"/>
        <circle class="ring-fg" cx="${size/2}" cy="${size/2}" r="${r}"
          stroke="${color}"
          stroke-dasharray="${dash}"
          stroke-dashoffset="${offset}"
          style="transition: stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"/>
      </svg>
      <div class="ring-pct" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:${size>70?'0.95rem':'0.8rem'};font-weight:700;color:var(--text)">${pct}%</div>
    </div>`;
}

// --- DASHBOARD ------------------------------------------
function renderDashboard() {
  const hMastered = getMastered('hiragana');
  const kMastered = getMastered('katakana');
  const pMastered = getMastered('phrase');
  const hPct = getPct(hMastered, HIRAGANA.length);
  const kPct = getPct(kMastered, KATAKANA.length);
  const pPct = getPct(pMastered, PHRASES.length);
  const dueCount = getDueCards(null).length;
  const today = getToday();

  const wrap = mkEl('div', 'fade-in');
  wrap.innerHTML = `
    <div class="section-header">
      <h1 class="section-title"><span class="jp">おかえり！</span> Welcome Back</h1>
      <p class="section-subtitle">Your Japanese learning journey continues — ${dueCount} card${dueCount !== 1 ? 's' : ''} due today.</p>
    </div>
    <div class="dashboard-grid stagger">
      <!-- Welcome banner -->
      <div class="dash-welcome fade-in">
        <div class="welcome-text">
          <h2>今日も頑張ろう！<br><span style="font-size:1rem;color:var(--text2);font-family:var(--font-en)">Let's do our best today!</span></h2>
          <p>7-day immersive speedrun to survival Japanese.</p>
        </div>
        <div class="welcome-cta">
          <button class="btn btn-primary" id="startTodayBtn">
            <span>▶</span> Study Now
          </button>
          <button class="btn btn-secondary" id="goFlashBtn">
            Flashcards
          </button>
        </div>
      </div>

      <!-- Streak -->
      <div class="streak-card fade-in">
        <div class="streak-flame">🔥</div>
        <div class="streak-number">${state.streak || 0}</div>
        <div class="streak-label">Day Streak</div>
        <div class="streak-sub">Keep it up!</div>
      </div>

      <!-- Progress Rings -->
      <div class="rings-card fade-in">
        <div class="rings-title">MASTERY PROGRESS</div>
        <div class="rings-row">
          <div class="ring-item">
            ${ringHTML(hPct, 'var(--pink)')}
            <div class="ring-label">ひらがな<br><small style="color:var(--text3)">${hMastered}/${HIRAGANA.length}</small></div>
          </div>
          <div class="ring-item">
            ${ringHTML(kPct, 'var(--blue)')}
            <div class="ring-label">カタカナ<br><small style="color:var(--text3)">${kMastered}/${KATAKANA.length}</small></div>
          </div>
          <div class="ring-item">
            ${ringHTML(pPct, 'var(--gold)')}
            <div class="ring-label">Phrases<br><small style="color:var(--text3)">${pMastered}/${PHRASES.length}</small></div>
          </div>
        </div>
      </div>

      <!-- Due card -->
      <div class="due-card fade-in">
        <div class="due-info">
          <div class="due-count">${dueCount}</div>
          <div class="due-label">Cards due for review</div>
        </div>
        <button class="btn btn-primary" id="reviewDueBtn">Review →</button>
      </div>

      <!-- Stats row -->
      <div class="stat-cards-row stagger">
        <div class="stat-card fade-in">
          <div class="stat-icon">📚</div>
          <div class="stat-value">${Object.values(state.cards).filter(c => c.totalReviews > 0).length}</div>
          <div class="stat-name">Cards Reviewed</div>
        </div>
        <div class="stat-card fade-in">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${hMastered + kMastered + pMastered}</div>
          <div class="stat-name">Mastered</div>
        </div>
        <div class="stat-card fade-in">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${calcAccuracy()}%</div>
          <div class="stat-name">Accuracy</div>
        </div>
        <div class="stat-card fade-in">
          <div class="stat-icon">📅</div>
          <div class="stat-value">${getDayProgress()}</div>
          <div class="stat-name">Day Progress</div>
        </div>
      </div>
    </div>
  `;

  // Bind dashboard buttons
  setTimeout(() => {
    const startBtn = document.getElementById('startTodayBtn');
    if (startBtn) startBtn.onclick = () => navigate('curriculum');
    const flashBtn = document.getElementById('goFlashBtn');
    if (flashBtn) flashBtn.onclick = () => navigate('flashcards');
    const reviewBtn = document.getElementById('reviewDueBtn');
    if (reviewBtn) reviewBtn.onclick = () => navigate('flashcards');
  }, 0);

  return wrap;
}

function calcAccuracy() {
  const cards = Object.values(state.cards).filter(c => c.totalReviews > 0);
  if (!cards.length) return 0;
  const totalCorrect = cards.reduce((acc, c) => acc + (c.correctReviews || 0), 0);
  const totalReviews = cards.reduce((acc, c) => acc + c.totalReviews, 0);
  return Math.round((totalCorrect / totalReviews) * 100);
}

function getDayProgress() {
  // Which curriculum day are we effectively on?
  const reviewedPhraseIds = Object.values(state.cards)
    .filter(c => c.type === 'phrase' && c.totalReviews > 0)
    .map(c => c.id);
  for (let i = CURRICULUM.length - 1; i >= 0; i--) {
    const day = CURRICULUM[i];
    const covered = day.phraseIds.filter(id => reviewedPhraseIds.includes(id)).length;
    if (covered > 0) return `Day ${i + 1}/7`;
  }
  return 'Day 1/7';
}

// --- CURRICULUM -----------------------------------------
function renderCurriculum() {
  const today = getToday();
  const wrap = mkEl('div', 'fade-in');

  const reviewedPhraseIds = new Set(
    Object.values(state.cards)
      .filter(c => c.type === 'phrase' && c.totalReviews > 0)
      .map(c => c.id)
  );

  let html = `
    <div class="section-header">
      <h1 class="section-title">7-Day <span class="jp">カリキュラム</span></h1>
      <p class="section-subtitle">Your structured path to survival Japanese. Complete each day's lessons to unlock the next.</p>
    </div>
    <div class="curriculum-container stagger">
  `;

  CURRICULUM.forEach((day, idx) => {
    const reviewedCount = day.phraseIds.filter(id => reviewedPhraseIds.has(id)).length;
    const total = day.phraseIds.length;
    const pct = Math.round((reviewedCount / total) * 100);
    const isCompleted = pct === 100;
    const isCurrent = idx === 0 || CURRICULUM[idx - 1].phraseIds.every(id => reviewedPhraseIds.has(id));
    const isLocked = !isCurrent && !isCompleted;

    let badgeClass = isCompleted ? 'completed' : (isCurrent ? 'today' : (isLocked ? 'locked' : 'upcoming'));
    let badgeIcon = isCompleted ? '✓' : (isLocked ? '🔒' : (idx + 1));
    let cardClass = isCompleted ? 'day-card completed' : (isCurrent && !isCompleted ? 'day-card today' : (isLocked ? 'day-card locked' : 'day-card'));

    html += `
      <div class="${cardClass} fade-in">
        <div class="day-badge ${badgeClass}">
          <span class="day-num">DAY</span>
          <span class="day-d">${badgeIcon}</span>
        </div>
        <div class="day-content">
          <div class="day-title">${day.title} <span style="font-family:var(--font-jp);color:var(--text2);font-size:0.85rem">${day.titleJp}</span></div>
          <div class="day-desc">${day.description}</div>
          <div class="day-topics">
            ${day.topics.map(t => `<span class="day-topic">${t}</span>`).join('')}
          </div>
          <div style="margin-top:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:0.78rem;color:var(--text3)">Phrases covered</span>
              <span style="font-size:0.78rem;color:var(--text2)">${reviewedCount}/${total}</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="day-action">
          ${!isLocked ? `<button class="btn btn-primary btn-sm study-day-btn" data-day="${idx + 1}">
            ${isCompleted ? '🔄 Review' : '▶ Study'}
          </button>` : '<span style="font-size:0.78rem;color:var(--text3)">Complete prev. day</span>'}
          <span style="font-size:0.7rem;color:var(--text3)">${day.kanaFocus}</span>
        </div>
      </div>
    `;
  });

  html += '</div>';
  wrap.innerHTML = html;

  // Bind study buttons
  setTimeout(() => {
    wrap.querySelectorAll('.study-day-btn').forEach(btn => {
      btn.onclick = () => {
        const dayNum = parseInt(btn.dataset.day);
        const dayData = CURRICULUM[dayNum - 1];
        // Set deck to first phrase category of this day
        const firstPhrase = PHRASES.find(p => dayData.phraseIds.includes(p.id));
        state.deck = 'all';
        navigate('flashcards');
      };
    });
  }, 0);

  return wrap;
}

// --- FLASHCARDS -----------------------------------------
function renderFlashcards() {
  const wrap = mkEl('div', 'fade-in');
  const dueCount = getDueCards(state.deck).length;

  if (state.dueQueue.length === 0 || state.currentCardIndex >= state.dueQueue.length) {
    // Session complete
    wrap.innerHTML = `
      <div class="section-header">
        <h1 class="section-title">フラッシュカード <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">Flashcards</span></h1>
      </div>
      <div class="deck-selector" id="deckSelector">
        ${DECK_CATEGORIES.map(d => `
          <button class="deck-btn ${state.deck === d.id ? 'active' : ''}" data-deck="${d.id}">
            ${d.label} <span style="color:var(--text3);font-size:0.7rem">(${d.count})</span>
          </button>`).join('')}
      </div>
      <div class="fc-complete fade-in">
        <div class="fc-complete-icon">🎉</div>
        <h3>Session Complete!</h3>
        <p style="color:var(--text2)">${dueCount > 0 ? `${dueCount} cards still due — try a different deck.` : 'No cards due right now. Come back tomorrow!'}</p>
        <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-primary" id="restartBtn">Restart Session</button>
          <button class="btn btn-secondary" id="goDashBtn">Back to Dashboard</button>
        </div>
      </div>
    `;
    setTimeout(() => {
      setupDeckSelector(wrap);
      const restartBtn = wrap.querySelector('#restartBtn');
      if (restartBtn) restartBtn.onclick = () => { state.currentCardIndex = 0; buildDueQueue(); navigate('flashcards'); };
      const dashBtn = wrap.querySelector('#goDashBtn');
      if (dashBtn) dashBtn.onclick = () => navigate('dashboard');
    }, 0);
    return wrap;
  }

  const cardId = state.dueQueue[state.currentCardIndex];
  const card = state.cards[cardId];
  const data = getCardData(cardId);

  if (!data) {
    // Skip invalid card
    state.currentCardIndex++;
    return renderFlashcards();
  }

  const remaining = state.dueQueue.length - state.currentCardIndex;

  wrap.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">フラッシュカード <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">Flashcards</span></h1>
    </div>
    <div class="deck-selector" id="deckSelector">
      ${DECK_CATEGORIES.map(d => `
        <button class="deck-btn ${state.deck === d.id ? 'active' : ''}" data-deck="${d.id}">
          ${d.label} <span style="color:var(--text3);font-size:0.7rem">(${d.count})</span>
        </button>`).join('')}
    </div>
    <div class="flashcard-container">
      <div class="fc-meta">
        <span class="fc-meta-badge">📚 ${remaining} remaining</span>
        <span class="fc-meta-badge">Interval: ${card.interval}d</span>
        <span class="fc-meta-badge" style="color:var(--gold)">EF: ${card.easeFactor.toFixed(1)}</span>
        <span style="color:var(--text3);font-size:0.8rem">Click card to reveal</span>
      </div>

      <div class="card-scene" id="cardScene">
        <div class="card-flipper" id="cardFlipper">
          <div class="card-face card-front">
            <div class="fc-hint">FRONT — What is this?</div>
            ${data.type === 'hiragana' || data.type === 'katakana'
              ? `<div class="fc-char">${data.japanese}</div>`
              : `<div class="fc-japanese">${data.japanese}</div>`
            }
            <div class="fc-category">${data.category}</div>
          </div>
          <div class="card-face card-back">
            <div class="fc-hint">BACK</div>
            ${data.type === 'hiragana' || data.type === 'katakana'
              ? `<div class="fc-char">${data.japanese}</div>
                 <div class="fc-romaji">${data.romaji}</div>
                 <div class="fc-english">${data.type === 'hiragana' ? 'Hiragana' : 'Katakana'}</div>`
              : `<div class="fc-japanese">${data.japanese}</div>
                 <div class="fc-romaji">${data.romaji}</div>
                 <div class="fc-english">${data.english}</div>`
            }
            <div class="fc-category">${data.category}</div>
          </div>
        </div>
      </div>

      <div class="rating-buttons" id="ratingButtons" style="opacity:0.35;pointer-events:none">
        ${[
          { rating: 0, label: '😰 Again',  cls: 'again' },
          { rating: 1, label: '😓 Hard',   cls: 'hard'  },
          { rating: 2, label: '🙂 Good',   cls: 'good'  },
          { rating: 3, label: '😄 Easy',   cls: 'easy'  }
        ].map(r => `
          <button class="rating-btn ${r.cls}" data-rating="${r.rating}">
            ${r.label}
            <span class="rating-interval">${previewInterval(card, r.rating)}</span>
          </button>`).join('')}
      </div>

      <div class="fc-queue">
        <span>📖 New: ${state.dueQueue.filter(id => (state.cards[id] && state.cards[id].repetitions === 0)).length}</span>
        <span>🔄 Review: ${state.dueQueue.filter(id => (state.cards[id] && state.cards[id].repetitions > 0)).length}</span>
      </div>
    </div>
  `;

  // Events
  setTimeout(() => {
    setupDeckSelector(wrap);
    const flipper = wrap.querySelector('#cardFlipper');
    const ratingBtns = wrap.querySelector('#ratingButtons');
    let flipped = false;

    if (flipper) {
      flipper.onclick = () => {
        flipped = !flipped;
        flipper.classList.toggle('flipped', flipped);
        if (flipped && ratingBtns) {
          ratingBtns.style.opacity = '1';
          ratingBtns.style.pointerEvents = 'auto';
        }
      };
    }

    wrap.querySelectorAll('.rating-btn').forEach(btn => {
      btn.onclick = () => {
        if (!flipped) return;
        const rating = parseInt(btn.dataset.rating);
        const updated = sm2(card, rating);
        state.cards[cardId] = updated;
        // Mark reviewed today
        if (!state.reviewedToday.includes(cardId)) {
          state.reviewedToday.push(cardId);
        }
        markActiveToday();
        state.currentCardIndex++;
        saveState();
        navigate('flashcards');
      };
    });
  }, 0);

  return wrap;
}

function setupDeckSelector(wrap) {
  const selector = wrap.querySelector('#deckSelector');
  if (!selector) return;
  selector.querySelectorAll('.deck-btn').forEach(btn => {
    btn.onclick = () => {
      state.deck = btn.dataset.deck;
      buildDueQueue();
      state.currentCardIndex = 0;
      saveState();
      navigate('flashcards');
    };
  });
}

// --- QUIZ -----------------------------------------------
function resetQuiz() {
  state.quizState = {
    active: true,
    type: null,
    question: null,
    options: [],
    answered: false,
    correct: 0,
    wrong: 0,
    total: 10,
    current: 0
  };
}

function pickQuizType() {
  const types = ['mc', 'typing', 'listening'];
  return types[Math.floor(Math.random() * types.length)];
}

function pickQuizQuestion() {
  // Pick a random phrase or kana
  const all = [
    ...HIRAGANA.map(h => ({ type: 'hiragana', japanese: h.char, romaji: h.romaji, english: h.romaji.toUpperCase(), category: 'hiragana' })),
    ...KATAKANA.map(k => ({ type: 'katakana', japanese: k.char, romaji: k.romaji, english: k.romaji.toUpperCase(), category: 'katakana' })),
    ...PHRASES.map(p => ({ type: 'phrase', japanese: p.japanese, romaji: p.romaji, english: p.english, category: p.category }))
  ];
  return all[Math.floor(Math.random() * all.length)];
}

function pickMCOptions(correct) {
  const pool = [
    ...HIRAGANA.map(h => h.romaji.toUpperCase()),
    ...PHRASES.map(p => p.english)
  ].filter(e => e !== correct.english);
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const opts = [...shuffled, correct.english].sort(() => Math.random() - 0.5);
  return opts;
}

function renderQuiz() {
  const qs = state.quizState;
  const wrap = mkEl('div', 'fade-in');

  // Session complete
  if (qs.current >= qs.total) {
    const score = Math.round((qs.correct / qs.total) * 100);
    const emoji = score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚';
    wrap.innerHTML = `
      <div class="section-header">
        <h1 class="section-title">クイズ <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">Quiz</span></h1>
      </div>
      <div class="quiz-container">
        <div class="quiz-summary fade-in">
          <div style="font-size:3rem">${emoji}</div>
          <h3>${score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Work!' : 'Keep Practicing!'}</h3>
          <div class="quiz-summary-score">${score}%</div>
          <p style="color:var(--text2)">${qs.correct} correct out of ${qs.total} questions</p>
          <div style="width:100%;max-width:300px">
            <div class="progress-bar-wrap" style="height:10px">
              <div class="progress-bar-fill" style="width:${score}%"></div>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;justify-content:center">
            <button class="btn btn-primary" id="retryQuizBtn">Try Again</button>
            <button class="btn btn-secondary" id="quizToDashBtn">Dashboard</button>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const retryBtn = wrap.querySelector('#retryQuizBtn');
      if (retryBtn) retryBtn.onclick = () => { resetQuiz(); navigate('quiz'); };
      const dashBtn = wrap.querySelector('#quizToDashBtn');
      if (dashBtn) dashBtn.onclick = () => navigate('dashboard');
    }, 0);
    return wrap;
  }

  // Generate a new question if needed
  if (!qs.question) {
    qs.type = pickQuizType();
    qs.question = pickQuizQuestion();
    if (qs.type === 'mc') {
      qs.options = pickMCOptions(qs.question);
    }
    qs.answered = false;
    qs.userAnswer = null;
  }

  const q = qs.question;
  const pct = Math.round((qs.current / qs.total) * 100);

  let questionHTML = '';
  let answerAreaHTML = '';

  if (qs.type === 'mc') {
    questionHTML = `
      <div class="quiz-prompt-label">What does this mean?</div>
      <div class="quiz-prompt">${q.japanese}</div>
      ${q.romaji ? `<div style="font-size:0.85rem;color:var(--text3);margin-top:4px">${q.type !== 'phrase' ? q.romaji : ''}</div>` : ''}
    `;
    answerAreaHTML = `
      <div class="mc-options" id="mcOptions">
        ${qs.options.map(opt => `
          <button class="mc-btn ${qs.answered ? (opt === q.english ? 'correct' : (opt === qs.userAnswer && opt !== q.english ? 'wrong' : '')) : ''}"
            data-opt="${escHtml(opt)}" ${qs.answered ? 'disabled' : ''}>
            ${escHtml(opt)}
          </button>`).join('')}
      </div>
    `;
  } else if (qs.type === 'typing') {
    questionHTML = `
      <div class="quiz-prompt-label">Type the romaji for:</div>
      <div class="quiz-prompt">${q.japanese}</div>
      <div style="font-size:0.85rem;color:var(--text3);margin-top:4px">${q.english}</div>
    `;
    answerAreaHTML = `
      <div class="typing-area">
        <input type="text" class="typing-input ${qs.answered ? (qs.correct_last ? 'correct' : 'wrong') : ''}"
          id="typingInput" placeholder="Type romaji here..."
          value="${qs.userAnswer || ''}" ${qs.answered ? 'disabled' : ''}
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        ${!qs.answered ? `<button class="btn btn-primary btn-sm" id="submitTypingBtn">Check</button>` : ''}
      </div>
    `;
  } else if (qs.type === 'listening') {
    questionHTML = `
      <div class="quiz-prompt-label">Listen and type what you hear (romaji)</div>
      <button class="quiz-tts-btn" id="ttsBtn">🔊 Play Audio</button>
      <div style="font-size:0.8rem;color:var(--text3)">Tip: click to hear the phrase</div>
    `;
    answerAreaHTML = `
      <div class="typing-area">
        <input type="text" class="typing-input ${qs.answered ? (qs.correct_last ? 'correct' : 'wrong') : ''}"
          id="typingInput" placeholder="Type what you heard..."
          value="${qs.userAnswer || ''}" ${qs.answered ? 'disabled' : ''}
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        ${!qs.answered ? `<button class="btn btn-primary btn-sm" id="submitTypingBtn">Check</button>` : ''}
        ${qs.answered ? `<div style="color:var(--text2);font-size:0.85rem">Japanese: <span style="font-family:var(--font-jp)">${q.japanese}</span></div>` : ''}
      </div>
    `;
  }

  const resultHTML = qs.answered ? `
    <div class="quiz-result ${qs.correct_last ? 'correct' : 'wrong'}">
      ${qs.correct_last ? `✓ Correct!` : `✗ Answer: ${escHtml(q.romaji)}`}
    </div>
  ` : '';

  wrap.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">クイズ <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">Quiz</span></h1>
    </div>
    <div class="quiz-container">
      <div class="quiz-header">
        <div class="quiz-score">
          <span class="correct">✓ ${qs.correct}</span>
          <span class="wrong">✗ ${qs.wrong}</span>
        </div>
        <div class="quiz-progress-bar">
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="quiz-type-badge ${qs.type}">${qs.type === 'mc' ? 'Multiple Choice' : qs.type === 'typing' ? 'Typing' : 'Listening'}</span>
        <span style="font-size:0.8rem;color:var(--text2)">${qs.current + 1}/${qs.total}</span>
      </div>

      <div class="quiz-card fade-in">
        ${questionHTML}
      </div>

      ${answerAreaHTML}
      ${resultHTML}

      ${qs.answered ? `
        <div class="quiz-next">
          <button class="btn btn-primary" id="nextQuestionBtn">Next →</button>
        </div>` : ''}
    </div>
  `;

  // Events
  setTimeout(() => {
    // TTS button
    const ttsBtn = wrap.querySelector('#ttsBtn');
    if (ttsBtn) {
      ttsBtn.onclick = () => {
        speakJapanese(q.japanese);
      };
      // Auto-play for listening quiz
      if (qs.type === 'listening') {
        speakJapanese(q.japanese);
      }
    }

    // MC options
    wrap.querySelectorAll('.mc-btn').forEach(btn => {
      btn.onclick = () => {
        if (qs.answered) return;
        const chosen = btn.dataset.opt;
        qs.userAnswer = chosen;
        qs.answered = true;
        qs.correct_last = chosen === q.english;
        if (qs.correct_last) {
          qs.correct++;
          showToast('Correct! 正解！', 'success');
        } else {
          qs.wrong++;
        }
        saveState();
        navigate('quiz');
      };
    });

    // Typing submit
    const submitBtn = wrap.querySelector('#submitTypingBtn');
    const typingInput = wrap.querySelector('#typingInput');
    if (submitBtn && typingInput) {
      submitBtn.onclick = () => checkTypingAnswer(typingInput.value.trim(), q, qs);
      typingInput.onkeydown = e => {
        if (e.key === 'Enter') checkTypingAnswer(typingInput.value.trim(), q, qs);
      };
      typingInput.focus();
    }

    // Next question
    const nextBtn = wrap.querySelector('#nextQuestionBtn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        qs.current++;
        qs.question = null;
        qs.answered = false;
        qs.correct_last = false;
        saveState();
        navigate('quiz');
      };
    }
  }, 0);

  return wrap;
}

function checkTypingAnswer(answer, q, qs) {
  if (qs.answered) return;
  const normalized = answer.toLowerCase().trim();
  const correct = q.romaji.toLowerCase().trim();
  // Allow partial match for long phrases (must contain key word)
  const isCorrect = normalized === correct ||
    (q.type === 'phrase' && correct.split(' ').length > 2 && normalized.length > 2 && correct.includes(normalized));
  qs.userAnswer = answer;
  qs.answered = true;
  qs.correct_last = isCorrect;
  if (isCorrect) {
    qs.correct++;
    showToast('Correct! 正解！', 'success');
  } else {
    qs.wrong++;
  }
  saveState();
  navigate('quiz');
}

function speakJapanese(text) {
  if (!window.speechSynthesis) {
    showToast('Speech synthesis not supported in this browser', 'error');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  // Prefer a Japanese voice if available
  const voices = window.speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja');
  if (jpVoice) utterance.voice = jpVoice;
  window.speechSynthesis.speak(utterance);
}

// --- KANA TABLES ----------------------------------------
function renderKana() {
  const wrap = mkEl('div', 'fade-in');

  const buildGrid = (data) => {
    return data.map(item => `
      <div class="kana-cell">
        <span class="kana-char">${item.char}</span>
        <span class="kana-romaji">${item.romaji}</span>
      </div>`).join('');
  };

  wrap.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">仮名 <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">Kana Tables</span></h1>
      <p class="section-subtitle">Hover over any character to highlight its romaji. Master all 92 base kana characters.</p>
    </div>
    <div class="kana-tabs" id="kanaTabs">
      <button class="kana-tab ${state.kanaTab === 'hiragana' ? 'active' : ''}" data-tab="hiragana">
        ひらがな Hiragana (${HIRAGANA.length})
      </button>
      <button class="kana-tab ${state.kanaTab === 'katakana' ? 'active' : ''}" data-tab="katakana">
        カタカナ Katakana (${KATAKANA.length})
      </button>
    </div>

    <div id="kanaContent">
      ${state.kanaTab === 'hiragana' ? `
        <p class="kana-section-title">あ行 VOWELS (a-row)</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(0, 5))}</div>
        <p class="kana-section-title">か行 KA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(5, 10))}</div>
        <p class="kana-section-title">さ行 SA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(10, 15))}</div>
        <p class="kana-section-title">た行 TA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(15, 20))}</div>
        <p class="kana-section-title">な行 NA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(20, 25))}</div>
        <p class="kana-section-title">は行 HA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(25, 30))}</div>
        <p class="kana-section-title">ま行 MA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(30, 35))}</div>
        <p class="kana-section-title">や行 YA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(35, 38))}</div>
        <p class="kana-section-title">ら行 RA-ROW</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(38, 43))}</div>
        <p class="kana-section-title">わ行 WA-ROW + ん</p>
        <div class="kana-grid">${buildGrid(HIRAGANA.slice(43))}</div>
      ` : `
        <p class="kana-section-title">ア行 VOWELS (a-row)</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(0, 5))}</div>
        <p class="kana-section-title">カ行 KA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(5, 10))}</div>
        <p class="kana-section-title">サ行 SA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(10, 15))}</div>
        <p class="kana-section-title">タ行 TA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(15, 20))}</div>
        <p class="kana-section-title">ナ行 NA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(20, 25))}</div>
        <p class="kana-section-title">ハ行 HA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(25, 30))}</div>
        <p class="kana-section-title">マ行 MA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(30, 35))}</div>
        <p class="kana-section-title">ヤ行 YA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(35, 38))}</div>
        <p class="kana-section-title">ラ行 RA-ROW</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(38, 43))}</div>
        <p class="kana-section-title">ワ行 WA-ROW + ン</p>
        <div class="kana-grid">${buildGrid(KATAKANA.slice(43))}</div>
      `}
    </div>
  `;

  setTimeout(() => {
    wrap.querySelectorAll('.kana-tab').forEach(tab => {
      tab.onclick = () => {
        state.kanaTab = tab.dataset.tab;
        saveState();
        navigate('kana');
      };
    });
  }, 0);

  return wrap;
}

// --- QUICK REFERENCE ------------------------------------
function renderReference() {
  const wrap = mkEl('div', 'fade-in');

  const filtered = PHRASES.filter(p => {
    const matchCat = state.refCategory === 'all' || p.category === state.refCategory;
    const search = state.refSearch.toLowerCase();
    const matchSearch = !search ||
      p.japanese.toLowerCase().includes(search) ||
      p.romaji.toLowerCase().includes(search) ||
      p.english.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  wrap.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">クイックリファレンス <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">Quick Reference</span></h1>
      <p class="section-subtitle">${PHRASES.length} survival phrases. Search or filter by category.</p>
    </div>
    <div class="reference-container">
      <div class="reference-controls">
        <input type="text" class="search-input" id="refSearch"
          placeholder="Search phrases..." value="${escHtml(state.refSearch)}"
          autocomplete="off">
        <div class="cat-filters">
          <button class="cat-btn ${state.refCategory === 'all' ? 'active' : ''}" data-cat="all">All</button>
          ${PHRASE_CATEGORIES.map(cat => `
            <button class="cat-btn ${state.refCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>`).join('')}
        </div>
      </div>
      <div class="phrase-list" id="phraseList">
        ${filtered.length === 0
          ? `<div class="no-results">No phrases found. Try a different search term.</div>`
          : filtered.map((p, i) => `
            <div class="phrase-card fade-in" style="animation-delay:${i * 0.03}s">
              <div class="phrase-number">${String(i + 1).padStart(2, '0')}</div>
              <div class="phrase-content">
                <div class="phrase-jp">${p.japanese}</div>
                <div class="phrase-romaji">${p.romaji}</div>
                <div class="phrase-en">${p.english}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <span class="phrase-cat">${p.category}</span>
                <button class="btn btn-sm btn-secondary tts-phrase-btn" data-jp="${escHtml(p.japanese)}" title="Play audio">🔊</button>
              </div>
            </div>`).join('')
        }
      </div>
    </div>
  `;

  setTimeout(() => {
    const searchInput = wrap.querySelector('#refSearch');
    if (searchInput) {
      searchInput.oninput = () => {
        state.refSearch = searchInput.value;
        saveState();
        // Re-render only the phrase list
        rerenderPhraseList(wrap);
      };
    }

    wrap.querySelectorAll('.cat-btn').forEach(btn => {
      btn.onclick = () => {
        state.refCategory = btn.dataset.cat;
        saveState();
        navigate('reference');
      };
    });

    wrap.querySelectorAll('.tts-phrase-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        speakJapanese(btn.dataset.jp);
      };
    });
  }, 0);

  return wrap;
}

function rerenderPhraseList(wrap) {
  const filtered = PHRASES.filter(p => {
    const matchCat = state.refCategory === 'all' || p.category === state.refCategory;
    const search = state.refSearch.toLowerCase();
    const matchSearch = !search ||
      p.japanese.toLowerCase().includes(search) ||
      p.romaji.toLowerCase().includes(search) ||
      p.english.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  const list = wrap.querySelector('#phraseList');
  if (!list) return;
  list.innerHTML = filtered.length === 0
    ? `<div class="no-results">No phrases found. Try a different search term.</div>`
    : filtered.map((p, i) => `
        <div class="phrase-card">
          <div class="phrase-number">${String(i + 1).padStart(2, '0')}</div>
          <div class="phrase-content">
            <div class="phrase-jp">${p.japanese}</div>
            <div class="phrase-romaji">${p.romaji}</div>
            <div class="phrase-en">${p.english}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <span class="phrase-cat">${p.category}</span>
            <button class="btn btn-sm btn-secondary tts-phrase-btn" data-jp="${escHtml(p.japanese)}" title="Play audio">🔊</button>
          </div>
        </div>`).join('');

  list.querySelectorAll('.tts-phrase-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      speakJapanese(btn.dataset.jp);
    };
  });
}

// --- CITIES ---------------------------------------------
function renderCities() {
  const wrap = mkEl('div', 'fade-in');

  const cityConfig = [
    { key: 'tokyo',  nameJp: '東京', nameEn: 'Tokyo',  cls: 'tokyo', romaji: 'TOUKYOU' },
    { key: 'osaka',  nameJp: '大阪', nameEn: 'Osaka',  cls: 'osaka', romaji: 'OOSAKA'  },
    { key: 'kyoto',  nameJp: '京都', nameEn: 'Kyoto',  cls: 'kyoto', romaji: 'KYOUTO'  }
  ];

  wrap.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">都市の語彙 <span style="font-size:1rem;font-family:var(--font-en);color:var(--text2)">City Vocabulary</span></h1>
      <p class="section-subtitle">Key words and landmarks for Japan's three most-visited cities.</p>
    </div>
    <div class="cities-grid stagger">
      ${cityConfig.map(city => `
        <div class="city-card fade-in">
          <div class="city-header ${city.cls}" data-kanji="${city.nameJp}">
            <div class="city-name ${city.cls}">${city.nameJp}</div>
            <div class="city-romaji">${city.romaji}</div>
          </div>
          <div class="city-vocab">
            ${CITY_VOCAB[city.key].map(v => `
              <div class="vocab-item">
                <div class="vocab-jp">${v.japanese}</div>
                <div class="vocab-right">
                  <span class="vocab-romaji">${v.romaji}</span>
                  <span class="vocab-en">${v.english}</span>
                  <span class="vocab-cat">${v.category}</span>
                </div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
  `;

  return wrap;
}

// --- Toast Notifications --------------------------------
function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = mkEl('div', `toast ${type}`);
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span>${escHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 2500);
}

// --- Nav Setup ------------------------------------------
function setupNav() {
  const nav = document.getElementById('mainNav');
  const ham = document.getElementById('hamburger');

  if (nav) {
    nav.querySelectorAll('.nav-btn').forEach(btn => {
      btn.onclick = () => navigate(btn.dataset.view);
    });
  }

  if (ham) {
    ham.onclick = () => {
      ham.classList.toggle('open');
      if (nav) nav.classList.toggle('open');
    };
  }

  // Close nav when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (ham && nav && !ham.contains(e.target) && !nav.contains(e.target)) {
      ham.classList.remove('open');
      nav.classList.remove('open');
    }
  });
}

// --- Sakura petals (decorative) -------------------------
function spawnSakura() {
  const container = mkEl('div', 'sakura-container');
  document.body.appendChild(container);
  const petals = ['🌸', '🌺', '🌼'];
  const count = 8;
  for (let i = 0; i < count; i++) {
    const petal = mkEl('div', 'petal');
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (8 + Math.random() * 10) + 's';
    petal.style.animationDelay = (Math.random() * 12) + 's';
    petal.style.fontSize = (0.8 + Math.random() * 0.6) + 'rem';
    petal.style.opacity = '0';
    container.appendChild(petal);
  }
}

// --- Utility --------------------------------------------
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Pre-load voices for TTS
function initTTS() {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
  }
}

// --- Init -----------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupNav();
  initTTS();
  spawnSakura();
  navigate('dashboard');
});
