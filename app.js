/*
  app.js — basic interactivity + translations
  How to edit text:
  - Update the TRANSLATIONS object below. Keep keys the same; change the strings.
  - Supported languages: 'fr', 'zh' (Chinese Simplified), 'en'.
*/

const TRANSLATIONS = {
  fr: {
    appName: "Aide aux Techno",
    subtitle: "Montréal • Apprentissage techno pour aînés",
    title: "Tech Help for Seniors",
    searchLabel: "De quoi avez-vous besoin?",
    searchPlaceholder: "ex.: WhatsApp, Wi‑Fi, photos",
    searchBtn: "Chercher",
    searchHint: "Astuce : essayez des mots simples comme Wi‑Fi, caméra ou banque.",

    skills: {
      phone: "Utiliser votre téléphone",
      computer: "Utiliser votre ordinateur",
      apps: "Installer des applications",
      ai: "Utiliser des outils d’IA",
      bank: "Banque en ligne",
      transport: "Trouver un transport",
      language: "Apprendre les langues",
      useful: "Applications utiles",
    },

    progressTitle: "Votre progression",
    badgesTitle: "Badges",
    congratsTitle: "Félicitations !",
    congratsLearned: "Vous avez appris",
    markCompleteBtn: "Marquer comme terminé",
    alreadyComplete: "Déjà terminé — bravo !",
    completeHint: "Astuce : vous pouvez refaire cette leçon quand vous voulez.",

    footer: "Conçu pour les aînés — texte grand, étapes simples, couleurs calmes.",
    clicked: (label) => `Ouvert : ${label}`,
  },

  zh: {
    appName: "科技帮助",
    subtitle: "蒙特利尔 · 适合老年人的科技学习",
    title: "老年人科技帮助",
    searchLabel: "您需要什么帮助？",
    searchPlaceholder: "例如：微信、Wi‑Fi、照片",
    searchBtn: "搜索",
    searchHint: "提示：输入简单词语，如 Wi‑Fi、相机、银行。",

    skills: {
      phone: "使用手机",
      computer: "使用电脑",
      apps: "安装应用",
      ai: "使用人工智能工具",
      bank: "网上银行",
      transport: "查找交通",
      language: "语言学习",
      useful: "常用应用",
    },

    progressTitle: "学习进度",
    badgesTitle: "成就徽章",
    congratsTitle: "恭喜！",
    congratsLearned: "你学会了",
    markCompleteBtn: "标记为完成",
    alreadyComplete: "已完成 — 做得很好！",
    completeHint: "提示：你可以随时再练习一次。",

    footer: "为老年人设计——大字体、简单步骤、舒缓配色。",
    clicked: (label) => `已打开：${label}`,
  },

  en: {
    appName: "Tech Help",
    subtitle: "Montreal • Senior-friendly tech learning",
    title: "Tech Help for Seniors",
    searchLabel: "What do you need help with?",
    searchPlaceholder: "e.g., WhatsApp, Wi‑Fi, photos",
    searchBtn: "Search",
    searchHint: "Tip: Try simple words like Wi‑Fi, camera, or bank.",

    skills: {
      phone: "Using Your Phone",
      computer: "Using Your Computer",
      apps: "Installing Apps",
      ai: "Using AI Tools",
      bank: "Online Banking",
      transport: "Finding Transport",
      language: "Language Learning",
      useful: "Useful Apps",
    },

    progressTitle: "Your Learning Progress",
    badgesTitle: "Achievement Badges",
    congratsTitle: "Congratulations!",
    congratsLearned: "You learned",
    markCompleteBtn: "Mark as complete",
    alreadyComplete: "Already completed — great job!",
    completeHint: "Tip: You can repeat this lesson anytime.",

    footer: "Made for seniors — big text, simple steps, calm colors.",
    clicked: (label) => `Opened: ${label}`,
  },
};

// Cache DOM references once
const els = {
  appName: document.getElementById('appName'),
  appSubtitle: document.getElementById('appSubtitle'),
  homeTitle: document.getElementById('homeTitle'),
  searchLabel: document.getElementById('searchLabel'),
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  searchHint: document.getElementById('searchHint'),
  footerText: document.getElementById('footerText'),
  output: document.getElementById('output'),
  progressTitle: document.getElementById('progressTitle'),
  badgesTitle: document.getElementById('badgesTitle'),
  langBtns: Array.from(document.querySelectorAll('.lang__btn')),
  cards: Array.from(document.querySelectorAll('.card')),
  labels: {
    phone: document.getElementById('skill_phone'),
    computer: document.getElementById('skill_computer'),
    apps: document.getElementById('skill_apps'),
    ai: document.getElementById('skill_ai'),
    bank: document.getElementById('skill_bank'),
    transport: document.getElementById('skill_transport'),
    language: document.getElementById('skill_language'),
    useful: document.getElementById('skill_useful'),
  },
};

let currentLang = (function(){
  try {
    if (window.AideI18n && typeof window.AideI18n.getLang === 'function') return window.AideI18n.getLang();
    const saved = localStorage.getItem('preferred-language');
    if (saved) return saved;
    const htmlLang = document.documentElement.getAttribute('lang') || 'en';
    return htmlLang.toLowerCase().startsWith('fr') ? 'fr' : htmlLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch { return 'en'; }
})();

function applyLang(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  currentLang = lang;

  // Update top texts
  els.appName.textContent = t.appName;
  els.appSubtitle.textContent = t.subtitle;
  els.homeTitle.textContent = t.title;

  // Update search
  els.searchLabel.textContent = t.searchLabel;
  els.searchInput.placeholder = t.searchPlaceholder;
  els.searchBtn.textContent = t.searchBtn;
  els.searchHint.textContent = t.searchHint;

  // Update skill labels
  Object.entries(els.labels).forEach(([key, el]) => {
    el.textContent = t.skills[key];
  });

  els.footerText.textContent = t.footer;

  // Home progress labels (if present)
  if (els.progressTitle) els.progressTitle.textContent = t.progressTitle;
  if (els.badgesTitle) els.badgesTitle.textContent = t.badgesTitle;

  // Render progress bars + badges on homepage
  if (window.AideProgress && typeof window.AideProgress.renderHome === 'function') {
    window.AideProgress.renderHome({
      lang,
      labels: {
        skills: t.skills,
      },
    });
  }

  // Update aria-pressed state for buttons
  els.langBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

function handleSearch() {
  const q = (els.searchInput.value || '').trim();
  if (!q) {
    els.output.textContent = '';
    return;
  }
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  // Simple feedback only; replace with real search later
  els.output.textContent = `${t.searchBtn}: ${q}`;
}


function attachEvents() {
  // Language switching
  els.langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (window.AideI18n && typeof window.AideI18n.setLang === 'function') {
        // Let the global i18n handler persist + broadcast; app.js listens to aide:langChanged
        window.AideI18n.setLang(lang);
      } else {
        // Fallback: apply locally and persist a simple flag so other pages can read it
        try { localStorage.setItem('preferred-language', lang); } catch {}
        applyLang(lang);
      }
    });
  });

  // Search actions
  els.searchBtn.addEventListener('click', handleSearch);
  els.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Card clicks — navigate for known sections, otherwise show feedback
  els.cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.skill;
      if (id === 'phone') {
        window.location.href = 'modules/phone.html';
        return;
      }
      if (id === 'computer') {
        window.location.href = 'modules/computer.html';
        return;
      }
      if (id === 'apps') {
        window.location.href = 'modules/useful_apps.html';
        return;
      }
      if (id === 'ai') {
        window.location.href = 'modules/ai_tools.html';
        return;
      }
      if (id === 'useful') {
        window.location.href = 'modules/useful_apps.html';
        return;
      }
      if (id === 'language') {
        window.location.href = 'modules/language.html';
        return;
      }
      if (id === 'bank') {
        window.location.href = 'modules/banking.html';
        return;
      }
      if (id === 'transport') {
        window.location.href = 'modules/transport.html';
        return;
      }
      const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
      const label = t.skills[id];
      els.output.textContent = t.clicked(label);
    });
  });
}

// Init
attachEvents();
// If a global i18n layer exists, ensure document language matches and trigger downstream listeners
if (window.AideI18n && typeof window.AideI18n.applyDoc === 'function') {
  window.AideI18n.applyDoc(currentLang);
} else {
  applyLang(currentLang);
}

// React to global language changes (if i18n.js is loaded)
window.addEventListener('aide:langChanged', (e) => {
  applyLang(e.detail?.lang || currentLang);
});
