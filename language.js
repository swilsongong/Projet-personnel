/* language.js — Language Learning guide logic
   Notes:
   - Audio: uses Speech Synthesis (built into the browser) for clear, slow speech.
   - Recording (optional): uses microphone for practice + volume meter.
   - Progress: stored in localStorage so seniors don't lose work.
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORAGE = {
    path: 'lang_path', // 'en' | 'fr'
    savedWords: 'lang_saved_words',
    streak: 'lang_streak',
    lastPracticeDate: 'lang_last_practice',
    conf: 'lang_conf',
    checklist: 'lang_checklist',
    goal: 'lang_goal',
    journal: 'lang_journal',
    script: 'lang_script',
  };

  const els = {
    progressMsg: qs('#progressMsg'),
    chooseEnglish: qs('#chooseEnglish'),
    chooseFrench: qs('#chooseFrench'),
    changePath: qs('#btnChangePath'),
    listenIntro: qs('#btnListenIntro'),
    alphabetGrid: qs('#alphabetGrid'),
    wordCategories: qs('#wordCategories'),
    sentenceList: qs('#sentenceList'),
    convoList: qs('#convoList'),
    // repeat
    repeatTarget: qs('#repeatTarget'),
    btnNewRepeat: qs('#btnNewRepeat'),
    btnPlayTarget: qs('#btnPlayTarget'),
    btnRecordMe: qs('#btnRecordMe'),
    btnPlayMe: qs('#btnPlayMe'),
    repeatMeter: qs('#repeatMeter'),
    repeatFeedback: qs('#repeatFeedback'),
    // signs
    signGrid: qs('#signGrid'),
    // writing
    copyTarget: qs('#copyTarget'),
    copyInput: qs('#copyInput'),
    copyResult: qs('#copyResult'),
    btnNewCopy: qs('#btnNewCopy'),
    btnSayCopy: qs('#btnSayCopy'),
    fillBox: qs('#fillBox'),
    freePrompt: qs('#freePrompt'),
    freeWrite: qs('#freeWrite'),
    btnSaveJournal: qs('#btnSaveJournal'),
    btnPrintJournal: qs('#btnPrintScript'),
    // speaking
    shadowPhrase: qs('#shadowPhrase'),
    btnShadowLoop: qs('#btnShadowLoop'),
    btnShadowStop: qs('#btnShadowStop'),
    chatLog: qs('#chatLog'),
    chatInput: qs('#chatInput'),
    chatSend: qs('#chatSend'),
    chatSay: qs('#chatSay'),
    scriptTask: qs('#scriptTask'),
    scriptName: qs('#scriptName'),
    scriptCard: qs('#scriptCard'),
    btnBuildScript: qs('#btnBuildScript'),
    btnSayScript: qs('#btnSayScript'),
    btnSaveScript: qs('#btnSaveScript'),
    btnPrintBuilt: qs('#btnPrintBuilt'),
    scriptOut: qs('#scriptOut'),
    // grammar
    cheatSheets: qs('#cheatSheets'),
    ruleList: qs('#ruleList'),
    // progress
    streak: qs('#streak'),
    btnPracticeToday: qs('#btnPracticeToday'),
    wordCount: qs('#wordCount'),
    btnViewWords: qs('#btnViewWords'),
    conf: qs('#conf'),
    confText: qs('#confText'),
    celebrate: qs('#celebrate'),
    canList: qs('#canList'),
    btnSaveGoal: qs('#btnSaveGoal'),
    goalSaved: qs('#goalSaved'),
    // print
    btnPrintKey: qs('#btnPrintKey'),
    btnPrintAll: qs('#btnPrintAll'),
  };

  // ----- Data -----
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // 50 words (10 per category). For each word, we store both EN/FR.
  const WORDS = {
    people: {
      title: 'People',
      items: [
        { en: 'I', fr: 'Je', icon: '🙋' },
        { en: 'you', fr: 'vous', icon: '👉' },
        { en: 'he', fr: 'il', icon: '👨' },
        { en: 'she', fr: 'elle', icon: '👩' },
        { en: 'family', fr: 'famille', icon: '👨‍👩‍👧‍👦' },
        { en: 'friend', fr: 'ami(e)', icon: '🤝' },
        { en: 'doctor', fr: 'médecin', icon: '🩺' },
        { en: 'nurse', fr: 'infirmier(ère)', icon: '🏥' },
        { en: 'police', fr: 'police', icon: '👮' },
        { en: 'help', fr: 'aide', icon: '🆘' },
      ],
    },
    places: {
      title: 'Places',
      items: [
        { en: 'home', fr: 'maison', icon: '🏠' },
        { en: 'store', fr: 'magasin', icon: '🏬' },
        { en: 'hospital', fr: 'hôpital', icon: '🏥' },
        { en: 'park', fr: 'parc', icon: '🌳' },
        { en: 'bank', fr: 'banque', icon: '🏦' },
        { en: 'pharmacy', fr: 'pharmacie', icon: '💊' },
        { en: 'bus stop', fr: 'arrêt d’autobus', icon: '🚏' },
        { en: 'metro', fr: 'métro', icon: '🚇' },
        { en: 'toilet', fr: 'toilettes', icon: '🚻' },
        { en: 'restaurant', fr: 'restaurant', icon: '🍽️' },
      ],
    },
    things: {
      title: 'Things',
      items: [
        { en: 'water', fr: 'eau', icon: '💧' },
        { en: 'food', fr: 'nourriture', icon: '🍲' },
        { en: 'medicine', fr: 'médicament', icon: '💊' },
        { en: 'money', fr: 'argent', icon: '💵' },
        { en: 'phone', fr: 'téléphone', icon: '📱' },
        { en: 'card', fr: 'carte', icon: '💳' },
        { en: 'address', fr: 'adresse', icon: '📍' },
        { en: 'name', fr: 'nom', icon: '🏷️' },
        { en: 'ticket', fr: 'billet', icon: '🎟️' },
        { en: 'key', fr: 'clé', icon: '🔑' },
      ],
    },
    actions: {
      title: 'Actions',
      items: [
        { en: 'go', fr: 'aller', icon: '➡️' },
        { en: 'come', fr: 'venir', icon: '⬅️' },
        { en: 'eat', fr: 'manger', icon: '🍴' },
        { en: 'drink', fr: 'boire', icon: '🥤' },
        { en: 'need', fr: 'avoir besoin', icon: '✅' },
        { en: 'want', fr: 'vouloir', icon: '⭐' },
        { en: 'pay', fr: 'payer', icon: '💳' },
        { en: 'call', fr: 'appeler', icon: '📞' },
        { en: 'wait', fr: 'attendre', icon: '⏳' },
        { en: 'stop', fr: 'arrêter', icon: '🛑' },
      ],
    },
    polite: {
      title: 'Polite words',
      items: [
        { en: 'hello', fr: 'bonjour', icon: '👋' },
        { en: 'goodbye', fr: 'au revoir', icon: '👋' },
        { en: 'please', fr: 's’il vous plaît', icon: '🙏' },
        { en: 'thank you', fr: 'merci', icon: '💚' },
        { en: 'sorry', fr: 'désolé(e)', icon: '🙇' },
        { en: 'yes', fr: 'oui', icon: '✅' },
        { en: 'no', fr: 'non', icon: '❌' },
        { en: 'excuse me', fr: 'excusez-moi', icon: '🙋' },
        { en: 'I understand', fr: 'je comprends', icon: '👍' },
        { en: "I don't understand", fr: 'je ne comprends pas', icon: '🤔' },
      ],
    },
  };

  const FIRST_SENTENCES = {
    en: [
      { text: 'Hello, how are you?', phon: '(Hel-lo, how ar yoo?)' },
      { text: 'I need help, please.', phon: '(I need help, pleez.)' },
      { text: 'Where is the bathroom?', phon: '(Ware is the bath-room?)' },
      { text: 'How much is this?', phon: '(How much iz this?)' },
      { text: 'I would like water, please.', phon: '(I wood like wah-ter, pleez.)' },
      { text: 'Can you speak slower, please?', phon: '(Can yoo speak slo-wer, pleez?)' },
      { text: 'I am from Montreal.', phon: '(I am from Mon-tree-awl.)' },
      { text: 'I have an appointment.', phon: '(I hav an a-point-ment.)' },
      { text: 'Where is the bus stop?', phon: '(Ware is the bus stop?)' },
      { text: 'Thank you very much.', phon: '(Thank yoo vairy much.)' },
    ],
    fr: [
      { text: 'Bonjour, comment allez-vous?', phon: '(Bon-zhoor, kom-mon tahlay voo?)' },
      { text: "J'ai besoin d'aide, s'il vous plaît.", phon: '(Zhay bez-wan ded, sil voo play.)' },
      { text: 'Où sont les toilettes?', phon: '(Oo son lay twa-let?)' },
      { text: 'Combien ça coûte?', phon: '(Kom-byen sa koot?)' },
      { text: "Je voudrais de l'eau, s'il vous plaît.", phon: '(Zhuh voo-dray deh lo, sil voo play.)' },
      { text: 'Pouvez-vous parler plus lentement?', phon: '(Poo-vay voo par-lay ploo lon-tuh-mon?)' },
      { text: 'Je viens de Montréal.', phon: '(Zhuh vyen de Mon-ray-al.)' },
      { text: "J'ai un rendez-vous.", phon: '(Zhay un ron-day-voo.)' },
      { text: "Où est l'arrêt d'autobus?", phon: '(Oo ay la-ray do-toh-boos?)' },
      { text: 'Merci beaucoup.', phon: '(Mer-see boh-koo.)' },
    ],
  };

  const CONVERSATIONS = {
    doctor: {
      title: "At the doctor's office",
      en: [
        'A: Hello. How can I help you?',
        'B: I have pain here.',
        'A: Since when?',
        'B: Since yesterday.',
      ],
      fr: [
        'A: Bonjour. Comment puis-je vous aider?',
        'B: J’ai mal ici.',
        'A: Depuis quand?',
        'B: Depuis hier.',
      ],
    },
    grocery: {
      title: 'At the grocery store',
      en: ['A: Excuse me. Where is the bread?', 'B: Aisle three.', 'A: Thank you!', 'B: You’re welcome.'],
      fr: ['A: Excusez-moi. Où est le pain?', 'B: Allée trois.', 'A: Merci!', 'B: De rien.'],
    },
    bus: {
      title: 'On the bus',
      en: ['A: Does this bus go downtown?', 'B: Yes. Next stop is the metro.', 'A: Great, thank you.'],
      fr: ['A: Est-ce que cet autobus va au centre-ville?', 'B: Oui. Prochain arrêt: le métro.', 'A: Merci.'],
    },
    bank: {
      title: 'At the bank',
      en: ['A: I need help with my account.', 'B: Do you have your ID?', 'A: Yes, here it is.'],
      fr: ['A: J’ai besoin d’aide avec mon compte.', 'B: Avez-vous votre pièce d’identité?', 'A: Oui, la voici.'],
    },
  };

  const SIGNS = [
    { sign: 'STOP', options: ['Stop', 'Exit', 'Open'], answer: 0 },
    { sign: 'SORTIE / EXIT', options: ['Bathroom', 'Exit', 'Bank'], answer: 1 },
    { sign: 'OPEN / OUVERT', options: ['Open', 'Closed', 'Danger'], answer: 0 },
    { sign: 'CAUTION / ATTENTION', options: ['Caution', 'Thank you', 'Restaurant'], answer: 0 },
  ];

  const FILL_IN = {
    en: { sentence: 'I would like ___ buy some bread.', options: ['to', 'for', 'at'], answer: 'to' },
    fr: { sentence: 'Je voudrais ___ acheter du pain.', options: ['de', 'à', 'pour'], answer: 'de' },
  };

  const CHEAT_SHEETS = {
    store: {
      title: 'At the store',
      en: ['How much is this?', 'Do you have…?', 'Where can I find…?'],
      fr: ['Combien ça coûte?', 'Avez-vous…?', 'Où puis-je trouver…?'],
    },
    clinic: {
      title: 'At the clinic',
      en: ['I have pain here.', 'I need a prescription.', 'What is this medicine for?'],
      fr: ['J’ai mal ici.', "J’ai besoin d’une prescription.", 'Ce médicament, c’est pour quoi?'],
    },
    phone: {
      title: 'On the phone',
      en: ['Could you speak slower, please?', 'Can you repeat that?', "I don't understand."],
      fr: ['Pouvez-vous parler plus lentement?', 'Pouvez-vous répéter?', 'Je ne comprends pas.'],
    },
  };

  const GRAMMAR_RULES = {
    en: [
      { title: 'Rule 1: “To be” (I am / You are / He is)', body: 'I am. You are. He is. She is. We are. They are.' },
      { title: 'Rule 2: Questions', body: 'You are here. → Are you here?' },
      { title: 'Rule 3: Negative', body: 'I understand. → I do not understand.' },
      { title: 'Rule 4: Simple past', body: 'I went to the store yesterday.' },
      { title: 'Rule 5: Don’t worry', body: 'Focus on being understood. Small mistakes are okay.' },
    ],
    fr: [
      { title: 'Règle 1: “Être” (je suis / vous êtes / il est)', body: 'Je suis. Vous êtes. Il est. Elle est. Nous sommes. Ils/elles sont.' },
      { title: 'Règle 2: Question', body: 'Vous êtes ici. → Êtes-vous ici?' },
      { title: 'Règle 3: Négation', body: 'Je comprends. → Je ne comprends pas.' },
      { title: 'Règle 4: Passé utile', body: 'Je suis allé(e) au magasin hier.' },
      { title: 'Règle 5: Genres (français)', body: 'Le / la. Les mots en -e sont souvent féminins, mais pas toujours. Les erreurs sont normales.' },
    ],
  };

  const CHECKLIST = [
    'I can say hello and introduce myself.',
    'I can ask for directions to a place.',
    'I can read a simple menu.',
    "I can understand a doctor's basic question.",
    'I can write a shopping list.',
  ];

  // ----- State -----
  let path = localStorage.getItem(STORAGE.path) || ''; // '' until chosen

  // ----- Helpers -----
  function setMsg(text) {
    if (els.progressMsg) els.progressMsg.textContent = text;
  }

  function normalize(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùüÿœæ\s']/gi, '').replace(/\s+/g, ' ').trim();
  }

  function speak(text, { rate = 0.85, langHint } = {}) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    if (langHint) {
      const v = window.speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith(langHint));
      if (v) u.voice = v;
    }
    speechSynthesis.speak(u);
  }

  function speakForPath(text, slow = true) {
    const langHint = path === 'fr' ? 'fr' : 'en';
    speak(text, { rate: slow ? 0.82 : 1.0, langHint });
  }

  function toggleSection(section) {
    const head = qs('[data-toggle]', section);
    const body = qs('[data-body]', section);
    if (!head || !body) return;
    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
    qs('.section__chev', head).textContent = open ? '▸' : '▾';
    body.toggleAttribute('hidden', open);
  }

  function scrollToSel(sel) {
    const el = qs(sel);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function celebrate(msg) {
    if (!els.celebrate) return;
    els.celebrate.textContent = msg;
    els.celebrate.removeAttribute('hidden');
    setTimeout(() => els.celebrate.setAttribute('hidden', ''), 1800);
  }

  // ----- Renderers -----
  function renderAlphabet() {
    if (!els.alphabetGrid) return;
    els.alphabetGrid.innerHTML = '';
    ALPHABET.forEach((ch) => {
      const b = document.createElement('button');
      b.className = 'letter';
      b.type = 'button';
      b.textContent = ch;
      b.addEventListener('click', () => speakForPath(ch, true));
      els.alphabetGrid.appendChild(b);
    });

    // special sound chips
    qsa('.chip').forEach((c) => c.addEventListener('click', () => speakForPath(c.getAttribute('data-say'), true)));
  }

  function renderWords() {
    if (!els.wordCategories) return;
    els.wordCategories.innerHTML = '';

    Object.values(WORDS).forEach((cat) => {
      const box = document.createElement('div');
      box.className = 'catbox';
      const h = document.createElement('h3');
      h.textContent = cat.title;
      box.appendChild(h);

      const grid = document.createElement('div');
      grid.className = 'wordgrid';

      cat.items.forEach((it) => {
        const btn = document.createElement('button');
        btn.className = 'wordbtn';
        btn.type = 'button';

        const main = path === 'fr' ? it.fr : it.en;
        const other = path === 'fr' ? it.en : it.fr;
        btn.innerHTML = `${it.icon} ${main}<small>${other}</small>`;

        btn.addEventListener('click', () => {
          speakForPath(main, true);
          addSavedWord(main);
          celebrate('Saved word: ' + main);
        });

        grid.appendChild(btn);
      });

      box.appendChild(grid);
      els.wordCategories.appendChild(box);
    });
  }

  function renderSentences() {
    if (!els.sentenceList) return;
    els.sentenceList.innerHTML = '';
    const list = path === 'fr' ? FIRST_SENTENCES.fr : FIRST_SENTENCES.en;

    list.forEach((s) => {
      const card = document.createElement('div');
      card.className = 'sentence';
      card.innerHTML = `
        <div class="top">
          <div>
            <div class="phrase">${s.text}</div>
            <div class="phon">${s.phon}</div>
          </div>
          <button class="pill" type="button">Play</button>
        </div>
      `;
      qs('button', card).addEventListener('click', () => speakForPath(s.text, true));
      els.sentenceList.appendChild(card);
    });
  }

  function renderConvos() {
    if (!els.convoList) return;
    els.convoList.innerHTML = '';

    Object.entries(CONVERSATIONS).forEach(([key, convo]) => {
      const card = document.createElement('div');
      card.className = 'convocard';

      const lines = path === 'fr' ? convo.fr : convo.en;
      const transcript = lines.join('\n');

      card.innerHTML = `
        <div class="row">
          <div class="label">${convo.title}</div>
          <div class="row">
            <button class="pill" type="button" data-play="slow">Play slowly</button>
            <button class="pill" type="button" data-play="normal">Play normally</button>
            <button class="pill" type="button" data-toggle-tx>Transcript</button>
          </div>
        </div>
        <div class="transcript" hidden>${transcript.replace(/\n/g, '<br/>')}</div>
      `;

      qs('[data-toggle-tx]', card).addEventListener('click', () => {
        const t = qs('.transcript', card);
        t.toggleAttribute('hidden');
      });

      qs('[data-play="slow"]', card).addEventListener('click', () => speakForPath(lines.join(' ... '), true));
      qs('[data-play="normal"]', card).addEventListener('click', () => speakForPath(lines.join(' ... '), false));

      els.convoList.appendChild(card);
    });
  }

  function renderSigns() {
    if (!els.signGrid) return;
    els.signGrid.innerHTML = '';

    SIGNS.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'sign';
      card.innerHTML = `
        <div class="pic">${s.sign}</div>
        <div class="detail">What does this sign mean?</div>
        <div class="row" style="gap:0.4rem;">
          ${s.options.map((o, idx) => `<button class="pill" type="button" data-i="${i}" data-o="${idx}">${o}</button>`).join('')}
        </div>
        <div class="detail" id="signfb_${i}"></div>
      `;

      qsa('button[data-i]', card).forEach((b) => {
        b.addEventListener('click', () => {
          const fb = qs('#signfb_' + i, card) || qs('#signfb_' + i);
          const idx = Number(b.getAttribute('data-o'));
          if (idx === s.answer) {
            fb.textContent = '✅ Correct!';
            fb.style.color = 'var(--accent-strong)';
            celebrate('Nice reading!');
            markPracticedToday();
          } else {
            fb.textContent = '❌ Try again.';
            fb.style.color = '#b00020';
          }
        });
      });

      els.signGrid.appendChild(card);
    });
  }

  function renderFillIn() {
    if (!els.fillBox) return;
    const d = path === 'fr' ? FILL_IN.fr : FILL_IN.en;
    els.fillBox.innerHTML = `
      <div class="detail"><strong>${d.sentence}</strong></div>
      <div class="row">
        ${d.options.map((o) => `<button class="pill" type="button" data-fill="${o}">${o}</button>`).join('')}
      </div>
      <div class="detail" id="fillFb"></div>
    `;

    qsa('[data-fill]', els.fillBox).forEach((b) => {
      b.addEventListener('click', () => {
        const choice = b.getAttribute('data-fill');
        const fb = qs('#fillFb', els.fillBox);
        if (choice === d.answer) {
          fb.textContent = '✅ Correct!';
          fb.style.color = 'var(--accent-strong)';
          celebrate('Great!');
          markPracticedToday();
        } else {
          fb.textContent = '❌ Not quite. Try again.';
          fb.style.color = '#b00020';
        }
      });
    });
  }

  function renderCheatSheets() {
    if (!els.cheatSheets) return;
    els.cheatSheets.innerHTML = '';

    Object.values(CHEAT_SHEETS).forEach((c) => {
      const box = document.createElement('div');
      box.className = 'rule';
      const list = path === 'fr' ? c.fr : c.en;
      box.innerHTML = `<div class="label">${c.title}</div><ul>${list.map((x) => `<li>${x}</li>`).join('')}</ul>`;
      els.cheatSheets.appendChild(box);
    });
  }

  function renderRules() {
    if (!els.ruleList) return;
    els.ruleList.innerHTML = '';
    const rules = path === 'fr' ? GRAMMAR_RULES.fr : GRAMMAR_RULES.en;
    rules.forEach((r) => {
      const box = document.createElement('div');
      box.className = 'rule';
      box.innerHTML = `<div class="label">${r.title}</div><div class="detail">${r.body}</div>`;
      const play = document.createElement('button');
      play.className = 'pill';
      play.type = 'button';
      play.textContent = 'Play';
      play.addEventListener('click', () => speakForPath(r.body, true));
      box.appendChild(play);
      els.ruleList.appendChild(box);
    });
  }

  function renderChecklist() {
    if (!els.canList) return;
    const saved = JSON.parse(localStorage.getItem(STORAGE.checklist) || '[]');
    els.canList.innerHTML = '';

    CHECKLIST.forEach((text, idx) => {
      const li = document.createElement('li');
      const id = 'can_' + idx;
      li.innerHTML = `<label><input type="checkbox" id="${id}" /> ${text}</label>`;
      const cb = qs('#' + id, li);
      cb.checked = Boolean(saved[idx]);
      cb.addEventListener('change', () => {
        const arr = JSON.parse(localStorage.getItem(STORAGE.checklist) || '[]');
        arr[idx] = cb.checked;
        localStorage.setItem(STORAGE.checklist, JSON.stringify(arr));
        if (cb.checked) celebrate('✅ Great job!');
      });
      els.canList.appendChild(li);
    });
  }

  // ----- Saved words / streak -----
  function getSavedWords() {
    return JSON.parse(localStorage.getItem(STORAGE.savedWords) || '[]');
  }

  function addSavedWord(word) {
    const words = getSavedWords();
    if (!words.includes(word)) {
      words.push(word);
      localStorage.setItem(STORAGE.savedWords, JSON.stringify(words));
      updateDashboard();
    }
  }

  function markPracticedToday() {
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem(STORAGE.lastPracticeDate) || '';

    let streak = Number(localStorage.getItem(STORAGE.streak) || '0');

    if (last === today) {
      // already counted
      return;
    }

    // If last was yesterday, streak++ else reset to 1
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (last === yesterday) streak += 1;
    else streak = 1;

    localStorage.setItem(STORAGE.lastPracticeDate, today);
    localStorage.setItem(STORAGE.streak, String(streak));

    updateDashboard();
    celebrate('🎉 Practice saved!');
  }

  function updateDashboard() {
    const streak = Number(localStorage.getItem(STORAGE.streak) || '0');
    const words = getSavedWords();
    if (els.streak) els.streak.textContent = String(streak);
    if (els.wordCount) els.wordCount.textContent = String(words.length);

    const conf = Number(localStorage.getItem(STORAGE.conf) || '1');
    if (els.conf) els.conf.value = String(conf);
    if (els.confText) {
      const labels = {
        1: '1 — Just starting',
        3: '3 — I know a few words',
        5: '5 — I can do simple tasks',
        7: '7 — I can handle small talk',
        10: '10 — I can have a simple chat!',
      };
      // choose nearest label
      const nearest = Object.keys(labels)
        .map(Number)
        .sort((a, b) => Math.abs(a - conf) - Math.abs(b - conf))[0];
      els.confText.textContent = labels[nearest];
    }
  }

  // ----- Writing practice -----
  const COPY_WORDS = {
    en: ['Hello', 'Please', 'Thank you', 'Water', 'Doctor', 'Bus', 'Exit', 'Open'],
    fr: ['Bonjour', 'Merci', "S'il vous plaît", 'Eau', 'Médecin', 'Métro', 'Sortie', 'Ouvert'],
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function newCopyWord() {
    const w = path === 'fr' ? pick(COPY_WORDS.fr) : pick(COPY_WORDS.en);
    els.copyTarget.textContent = w;
    els.copyInput.value = '';
    els.copyResult.textContent = '';
  }

  function checkCopy() {
    const target = normalize(els.copyTarget.textContent);
    const typed = normalize(els.copyInput.value);
    if (!typed) {
      els.copyResult.textContent = '';
      return;
    }
    if (typed === target) {
      els.copyResult.textContent = '✅ Great!';
      els.copyResult.style.color = 'var(--accent-strong)';
      celebrate('✅ Correct spelling!');
      markPracticedToday();
    } else {
      els.copyResult.textContent = 'Keep going… (almost!)';
      els.copyResult.style.color = 'var(--muted)';
    }
  }

  // ----- Repeat recording (optional) -----
  const REPEAT_PHRASES = {
    en: ['Hello!', 'I need help, please.', 'Where is the bus stop?', 'Thank you.'],
    fr: ['Bonjour!', "J'ai besoin d'aide, s'il vous plaît.", "Où est l'arrêt d'autobus?", 'Merci.'],
  };

  let userRecordingUrl = '';

  async function recordWithMeter(seconds = 4) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks = [];

    // Volume meter
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);

    let peak = 0;
    let raf = 0;
    const start = performance.now();

    function tick() {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      peak = Math.max(peak, rms);
      if (els.repeatMeter) els.repeatMeter.style.width = Math.round(Math.min(1, rms * 2.5) * 100) + '%';
      if (performance.now() - start < seconds * 1000) raf = requestAnimationFrame(tick);
    }

    rec.ondataavailable = (e) => chunks.push(e.data);

    rec.start();
    raf = requestAnimationFrame(tick);

    await new Promise((r) => setTimeout(r, seconds * 1000));
    rec.stop();

    await new Promise((r) => (rec.onstop = r));

    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    try { await ctx.close(); } catch { /* ignore */ }

    const blob = new Blob(chunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    return { url, peak };
  }

  function clarityMsg(peak) {
    if (peak < 0.08) return 'Too quiet. Try speaking louder or closer to the phone.';
    if (peak < 0.18) return 'A bit quiet. Try speaking a little louder.';
    return 'Volume looks good. Nice!';
  }

  // ----- Conversation simulator -----
  let chatState = 0;
  const BOT = {
    en: [
      'Good morning! What is your name?',
      'Nice to meet you. How are you today?',
      'Great. One more: Where do you live?',
      'Wonderful. You did it!',
    ],
    fr: [
      'Bonjour! Comment vous appelez-vous?',
      'Enchanté(e). Comment allez-vous aujourd’hui?',
      'Super. Une question: Où habitez-vous?',
      'Bravo! Vous avez réussi!',
    ],
  };

  function addBubble(who, text) {
    const div = document.createElement('div');
    div.className = 'bubble ' + who;
    div.textContent = (who === 'bot' ? 'Bot: ' : 'You: ') + text;
    els.chatLog.appendChild(div);
    els.chatLog.scrollTop = els.chatLog.scrollHeight;
  }

  function botLine() {
    const lines = path === 'fr' ? BOT.fr : BOT.en;
    return lines[Math.min(chatState, lines.length - 1)];
  }

  function resetChat() {
    els.chatLog.innerHTML = '';
    chatState = 0;
    addBubble('bot', botLine());
  }

  // ----- Script builder -----
  function buildScript() {
    const name = (els.scriptName.value || '').trim() || '___';
    const card = (els.scriptCard.value || '').trim() || '___';

    if (path === 'fr') {
      return `Bonjour. Je m'appelle ${name}.
J'ai besoin d'un rendez-vous, s'il vous plaît.
Mon numéro de carte d'assurance maladie est: ${card}.
Merci.`;
    }

    return `Hello. My name is ${name}.
I need an appointment, please.
My health card number is: ${card}.
Thank you.`;
  }

  function saveScript(text) {
    localStorage.setItem(STORAGE.script, text);
    celebrate('Saved!');
  }

  // ----- Printing -----
  function printKeySheets() {
    document.body.classList.add('print-key');
    window.print();
    setTimeout(() => document.body.classList.remove('print-key'), 300);
  }

  // ----- Wiring -----
  function wireBasics() {
    // Collapsibles
    qsa('[data-toggle]').forEach((head) => {
      head.addEventListener('click', () => toggleSection(head.closest('.section')));
    });

    // Listen buttons for blocks
    qsa('[data-listen]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-listen');
        const el = qs(sel);
        if (!el) return;
        speakForPath(el.textContent.replace(/\s+/g, ' ').trim(), true);
      });
    });

    // scroll buttons
    qsa('[data-scroll]').forEach((b) => b.addEventListener('click', () => scrollToSel(b.getAttribute('data-scroll'))));

    // Path selection
    els.chooseEnglish.addEventListener('click', () => setPath('en'));
    els.chooseFrench.addEventListener('click', () => setPath('fr'));
    els.changePath.addEventListener('click', () => setPath(''));
    els.listenIntro.addEventListener('click', () => {
      speak('Small steps every day make a big difference. Choose your path: learning English or learning French.', { rate: 0.85, langHint: 'en' });
    });

    // writing
    els.btnNewCopy.addEventListener('click', newCopyWord);
    els.btnSayCopy.addEventListener('click', () => speakForPath(els.copyTarget.textContent, true));
    els.copyInput.addEventListener('input', checkCopy);

    els.btnSaveJournal.addEventListener('click', () => {
      const text = (els.freeWrite.value || '').trim();
      if (!text) return;
      const arr = JSON.parse(localStorage.getItem(STORAGE.journal) || '[]');
      arr.push({ ts: Date.now(), path, text });
      localStorage.setItem(STORAGE.journal, JSON.stringify(arr));
      celebrate('Saved to journal!');
      markPracticedToday();
    });

    els.btnPrintJournal.addEventListener('click', () => window.print());

    // repeat
    els.btnNewRepeat.addEventListener('click', () => {
      const t = path === 'fr' ? pick(REPEAT_PHRASES.fr) : pick(REPEAT_PHRASES.en);
      els.repeatTarget.textContent = t;
      els.repeatFeedback.textContent = '';
      els.repeatMeter.style.width = '0%';
      userRecordingUrl = '';
      els.btnPlayMe.disabled = true;
    });
    els.btnPlayTarget.addEventListener('click', () => speakForPath(els.repeatTarget.textContent, true));
    els.btnRecordMe.addEventListener('click', async () => {
      els.repeatFeedback.textContent = 'Recording… please speak now.';
      try {
        const { url, peak } = await recordWithMeter(4);
        userRecordingUrl = url;
        els.btnPlayMe.disabled = false;
        els.repeatFeedback.textContent = clarityMsg(peak);
        markPracticedToday();
      } catch {
        els.repeatFeedback.textContent = 'Microphone blocked. Allow microphone permission in your browser.';
      }
    });
    els.btnPlayMe.addEventListener('click', () => {
      if (!userRecordingUrl) return;
      const a = new Audio(userRecordingUrl);
      a.play();
    });

    // shadowing
    let loopTimer = 0;
    els.btnShadowLoop.addEventListener('click', () => {
      clearInterval(loopTimer);
      const val = els.shadowPhrase.value;
      const phrase = val === 'coffee_fr' ? "Un café, s'il vous plaît." : "I'd like a coffee, please.";
      speakForPath(phrase, true);
      loopTimer = setInterval(() => speakForPath(phrase, true), 4200);
    });
    els.btnShadowStop.addEventListener('click', () => {
      clearInterval(loopTimer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    // chat
    resetChat();
    els.chatSend.addEventListener('click', () => {
      const txt = (els.chatInput.value || '').trim();
      if (!txt) return;
      addBubble('you', txt);
      els.chatInput.value = '';
      chatState += 1;
      addBubble('bot', botLine());
      markPracticedToday();
      if (chatState >= 3) celebrate('🎉 Conversation complete!');
    });
    els.chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') els.chatSend.click(); });
    els.chatSay.addEventListener('click', () => speakForPath(botLine(), true));

    // script
    els.btnBuildScript.addEventListener('click', () => {
      const txt = buildScript();
      els.scriptOut.textContent = txt;
    });
    els.btnSayScript.addEventListener('click', () => {
      const txt = els.scriptOut.textContent || buildScript();
      speakForPath(txt, true);
    });
    els.btnSaveScript.addEventListener('click', () => saveScript(els.scriptOut.textContent || buildScript()));
    els.btnPrintBuilt.addEventListener('click', () => window.print());

    // progress dashboard
    els.btnPracticeToday.addEventListener('click', markPracticedToday);
    els.btnViewWords.addEventListener('click', () => {
      const w = getSavedWords();
      alert(w.length ? w.join('\n') : 'No saved words yet. Tap words to save them.');
    });
    els.conf.addEventListener('input', () => {
      localStorage.setItem(STORAGE.conf, String(els.conf.value));
      updateDashboard();
    });

    // goals
    els.btnSaveGoal.addEventListener('click', () => {
      const g = qs('input[name="goal"]:checked')?.value;
      if (!g) {
        els.goalSaved.textContent = 'Please choose a goal.';
        return;
      }
      localStorage.setItem(STORAGE.goal, g);
      els.goalSaved.textContent = 'Saved goal for this week!';
      celebrate('Saved goal!');
    });

    // print
    els.btnPrintKey.addEventListener('click', printKeySheets);
    els.btnPrintAll.addEventListener('click', () => window.print());

    // language selector placeholder
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => {
        qsa('.lang__btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  }

  function setPath(p) {
    path = p;
    localStorage.setItem(STORAGE.path, p);

    if (!p) {
      setMsg('Choose your path to begin.');
      return;
    }

    setMsg(p === 'fr' ? 'Great! You are learning French. Start with the basics below.' : 'Great! You are learning English. Start with the basics below.');

    // re-render tailored content
    renderWords();
    renderSentences();
    renderConvos();
    renderFillIn();
    renderCheatSheets();
    renderRules();

    // update prompts
    els.freePrompt.textContent = p === 'fr' ? 'Écrivez une phrase sur votre famille.' : 'Write a sentence about your family.';

    // If they choose a path, count as a “practice” start (optional)
    celebrate('✨ Welcome!');
  }

  // ----- Init -----
  renderAlphabet();
  renderWords();
  renderSentences();
  renderConvos();
  renderSigns();
  renderFillIn();
  renderCheatSheets();
  renderRules();
  renderChecklist();
  newCopyWord();
  updateDashboard();

  // Restore saved selections
  const savedGoal = localStorage.getItem(STORAGE.goal);
  if (savedGoal) {
    const g = qs(`input[name="goal"][value="${savedGoal}"]`);
    if (g) g.checked = true;
    if (els.goalSaved) els.goalSaved.textContent = 'Your saved goal is selected.';
  }

  const savedScript = localStorage.getItem(STORAGE.script);
  if (savedScript) els.scriptOut.textContent = savedScript;

  setPath(path);
  wireBasics();

  // Completion panel
  window.AideProgress?.attachCompletionPanel?.({ skillId: 'language' });
})();
