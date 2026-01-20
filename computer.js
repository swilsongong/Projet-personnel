/* computer.js — interactivity for Using Your Computer
   Features:
   - OS choice (Windows/Mac/Linux) and persistence (localStorage)
   - Shows OS-tailored instruction blocks
   - Topic navigation + Back/Home/Next
   - Listen buttons (Web Speech API) slow/clear
   - Practice: bouncing icon click game + type your name
   - Quiz: check answers + feedback
   - High contrast + text size controls + print
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // --- i18n (common labels for this page) ---
  const I18N_CMP = {
    en: {
      crumbChoose: 'Choose',
      menuTitle: (os) => `Let's Learn About Your ${os} Computer`,
      os: { windows: 'Windows', mac: 'Mac', linux: 'Linux' },
      osStartTitle: 'Which computer do you use?',
      identifyBtn: 'Help me identify my computer',
      quiz: {
        please: 'Please choose an answer.',
        correct: '✅ Correct',
        wrong: '❌ Not quite. Try again.',
        result: (n) => `You got ${n} / 3 correct.`,
      },
      ttsLang: 'en-US',
    },
    fr: {
      crumbChoose: 'Choisir',
      menuTitle: (os) => `Apprenons à utiliser votre ordinateur ${os}`,
      os: { windows: 'Windows', mac: 'Mac', linux: 'Linux' },
      osStartTitle: 'Quel ordinateur utilisez‑vous ?',
      identifyBtn: "M'aider à identifier mon ordinateur",
      quiz: {
        please: 'Veuillez choisir une réponse.',
        correct: '✅ Correct',
        wrong: '❌ Pas tout à fait. Réessayez.',
        result: (n) => `Vous avez ${n} / 3 bonnes réponses.`,
      },
      ttsLang: 'fr-CA',
    },
    zh: {
      crumbChoose: '选择',
      menuTitle: (os) => `一起学习如何使用您的${os}电脑`,
      os: { windows: 'Windows', mac: 'Mac', linux: 'Linux' },
      osStartTitle: '您使用哪种电脑？',
      identifyBtn: '帮我识别我的电脑',
      quiz: {
        please: '请选择一个答案。',
        correct: '✅ 正确',
        wrong: '❌ 不太对。再试一次。',
        result: (n) => `答对 ${n} / 3 题。`,
      },
      ttsLang: 'zh-CN',
    },
  };

  function curLang(){ return (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en'); }
  function T(){ return I18N_CMP[curLang()] || I18N_CMP.en; }

  const storage = {
    get os() { return localStorage.getItem('selectedComputerOS'); },
    set os(v) { localStorage.setItem('selectedComputerOS', v); },
    get hc() { return localStorage.getItem('prefHighContrastComputer') === '1'; },
    set hc(v) { localStorage.setItem('prefHighContrastComputer', v ? '1' : '0'); },
    get font() { return Number(localStorage.getItem('prefFontPctComputer') || '100'); },
    set font(v) { localStorage.setItem('prefFontPctComputer', String(v)); },
  };

  const panels = {
    osStart: qs('#osStart'),
    osMenu: qs('#osMenu'),
    basics: qs('#basics'),
    desktop: qs('#desktop'),
    internet: qs('#internet'),
    do: qs('#do'),
    trouble: qs('#trouble'),
    practice: qs('#practice'),
  };

  const crumbOS = qs('#crumbOS');
  const menuTitle = qs('#menuTitle');

  let currentOS = null; // windows | mac | linux

  function showOnly(...els) {
    Object.values(panels).forEach((p) => p.setAttribute('hidden', ''));
    els.forEach((p) => p && p.removeAttribute('hidden'));
  }

function osLabel(os) {
  const t = T();
  return os === 'windows' ? t.os.windows : os === 'mac' ? t.os.mac : t.os.linux;
}

  function applyOS(os) {
    currentOS = os;
    storage.os = os;

crumbOS.textContent = osLabel(os);
menuTitle.textContent = (T().menuTitle)(osLabel(os));

    // Show only blocks for the selected OS
    qsa('.os-block').forEach((b) => {
      const match = b.dataset.os === os;
      b.style.display = match ? '' : 'none';
      b.classList.toggle('active', match);
    });

    // Move user to the main menu
    showOnly(panels.osMenu);
  }

  // Identify panel toggle
function toggleIdentify() {
  const p = qs('#identifyPanel');
  p.toggleAttribute('hidden');
}

function applyComputerLang(){
  const t = T();
  const langCode = (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en');
  if (String(langCode).toLowerCase().startsWith('en')) {
    // Keep original English copy and layout; no overrides
    return;
  }
  // Start screen title + helper button
  const h1 = qs('#osStartTitle'); if(h1) h1.textContent = t.osStartTitle;
  const idBtn = qs('#btnIdentify'); if(idBtn) idBtn.textContent = t.identifyBtn;
  // Choice cards (Windows / Mac / Linux)
  const cw = qs('button.choice[data-os="windows"] .choice__title'); if(cw) cw.textContent = `🪟 ${t.os.windows}`;
  const cm = qs('button.choice[data-os="mac"] .choice__title'); if(cm) cm.textContent = `🍎 ${t.os.mac}`;
  const cl = qs('button.choice[data-os="linux"] .choice__title'); if(cl) cl.textContent = `🐧 ${t.os.linux}`;
  // Crumb or selected OS label
  crumbOS.textContent = currentOS ? osLabel(currentOS) : t.crumbChoose;
  // Menu title if OS already selected
  if (currentOS && menuTitle) {
    menuTitle.textContent = (T().menuTitle)(osLabel(currentOS));
  }

  // Topic menu labels
  const topics = {
    basics: { en:'First Steps (Basics)', fr:'Premiers pas (Bases)', zh:'入门（基础）' },
    desktop:{ en:'Desktop & Files', fr:'Bureau & fichiers', zh:'桌面与文件' },
    internet:{ en:'Internet', fr:'Internet', zh:'上网' },
    do:{ en:'Do Things', fr:'Faire des choses', zh:'开始动手' },
    trouble:{ en:'Troubleshooting', fr:'Dépannage', zh:'排障' },
    practice:{ en:'Practice & Quiz', fr:'Pratique & quiz', zh:'练习与测验' },
  };
  const langShort = (curLang().startsWith('fr')?'fr':(curLang().startsWith('zh')?'zh':'en'));
  const setTopic = (id,key)=>{ const b=qs(`.topic[data-goto="${id}"]`); if(b){ const icon = b.textContent.trim().split(' ')[0]||''; b.textContent=''; b.innerHTML = `${icon} ${topics[key][langShort]}`; } };
  setTopic('basics','basics');
  setTopic('desktop','desktop');
  setTopic('internet','internet');
  setTopic('do','do');
  setTopic('trouble','trouble');
  setTopic('practice','practice');

  // Section titles and key cards
  const H2 = {
    en: {
      basics: 'A. 🧭 FIRST STEPS (The Basics)',
      desktop: 'B. 🗂 FINDING YOUR WAY AROUND (The Desktop & Files)',
      internet: 'C. 🌐 USING THE INTERNET (Web Browser)',
      do: 'D. ✍️ DOING THINGS WITH YOUR COMPUTER',
      trouble: 'E. 🛠 TROUBLESHOOTING COMMON PROBLEMS',
      practice: 'F. ✅ PRACTICE & QUIZ',
    },
    fr: {
      basics: 'A. 🧭 PREMIERS PAS (Les bases)',
      desktop: 'B. 🗂 SE REPÉRER (Bureau & fichiers)',
      internet: 'C. 🌐 UTILISER INTERNET (Navigateur web)',
      do: 'D. ✍️ FAIRE DES CHOSES AVEC VOTRE ORDINATEUR',
      trouble: 'E. 🛠 DÉPANNER LES PROBLÈMES COURANTS',
      practice: 'F. ✅ PRATIQUE & QUIZ',
    },
    zh: {
      basics: 'A. 🧭 入门（基础）',
      desktop: 'B. 🗂 熟悉环境（桌面与文件）',
      internet: 'C. 🌐 使用互联网（浏览器）',
      do: 'D. ✍️ 用电脑完成事情',
      trouble: 'E. 🛠 常见问题排查',
      practice: 'F. ✅ 练习与测验',
    }
  };
  const tH2 = H2[langShort];
  if (qs('#basics .section-title')) qs('#basics .section-title').textContent = tH2.basics;
  if (qs('#desktop .section-title')) qs('#desktop .section-title').textContent = tH2.desktop;
  if (qs('#internet .section-title')) qs('#internet .section-title').textContent = tH2.internet;
  if (qs('#do .section-title')) qs('#do .section-title').textContent = tH2.do;
  if (qs('#trouble .section-title')) qs('#trouble .section-title').textContent = tH2.trouble;
  if (qs('#practice .section-title')) qs('#practice .section-title').textContent = tH2.practice;

  // Power card
  const POWER = {
    en: {
      h3: "1. Turning It On & Off",
      win: [
        'Press the <strong>power button</strong>.',
        'To shut down: Click <strong>Start</strong> → <strong>Power</strong> → <strong>Shut down</strong>.',
      ],
      mac: [
        'Press the <strong>power button</strong> (often top-right on keyboard or back of screen).',
        'To shut down: Click the <strong>Apple</strong> menu (top-left) → <strong>Shut Down</strong>.',
      ],
      linux: [
        'Press the <strong>power button</strong>.',
        'To shut down: Click the <strong>Menu</strong> → <strong>Power Off</strong> / <strong>Shut Down</strong>.',
      ],
    },
    fr: {
      h3: '1. Allumer et éteindre',
      win: [
        'Appuyez sur le <strong>bouton d’alimentation</strong>.',
        'Pour éteindre : Cliquez <strong>Start</strong> → <strong>Power</strong> → <strong>Shut down</strong>.',
      ],
      mac: [
        'Appuyez sur le <strong>bouton d’alimentation</strong> (souvent en haut à droite du clavier ou derrière l’écran).',
        'Pour éteindre : Menu <strong>Apple</strong> (en haut à gauche) → <strong>Éteindre</strong>.',
      ],
      linux: [
        'Appuyez sur le <strong>bouton d’alimentation</strong>.',
        'Pour éteindre : <strong>Menu</strong> → <strong>Power Off</strong> / <strong>Shut Down</strong>.',
      ],
    },
    zh: {
      h3: '1. 开关机',
      win: [
        '按下<strong>电源键</strong>。',
        '关机：点击<strong>开始</strong> → <strong>电源</strong> → <strong>关机</strong>。',
      ],
      mac: [
        '按下<strong>电源键</strong>（常在键盘右上角或屏幕后方）。',
        '关机：点击左上角 <strong>苹果</strong> 菜单 → <strong>关机</strong>。',
      ],
      linux: [
        '按下<strong>电源键</strong>。',
        '关机：点击<strong>菜单</strong> → <strong>Power Off</strong> / <strong>Shut Down</strong>。',
      ],
    },
  };
  const p = POWER[langShort];
  if (qs('#power h3')) qs('#power h3').textContent = p.h3;
  const setList = (sel, arr) => {
    const ol = qs(sel);
    if (!ol) return;
    const items = Array.from(ol.querySelectorAll('li'));
    items.forEach((li, i) => { if (arr[i]) li.innerHTML = arr[i]; });
  };
  setList('#power .os-block[data-os="windows"] .steps', p.win);
  setList('#power .os-block[data-os="mac"] .steps', p.mac);
  setList('#power .os-block[data-os="linux"] .steps', p.linux);

  // Mouse card
  const MOUSE = {
    en: {
      h3: '2. Using Your Mouse (or Trackpad)',
      steps: [
        '<strong>Click</strong>: left button once (select)',
        '<strong>Double‑click</strong>: left button twice quickly (open)',
        '<strong>Right‑click</strong>: right button (options menu)',
        '<strong>Scroll</strong>: roll the wheel (move up/down)',
      ],
      practice: 'Practice Game: Click on the bouncing icon',
    },
    fr: {
      h3: '2. Utiliser votre souris (ou pavé tactile)',
      steps: [
        '<strong>Clic</strong> : bouton gauche une fois (sélection)',
        '<strong>Double‑clic</strong> : bouton gauche deux fois rapidement (ouvrir)',
        '<strong>Clic droit</strong> : bouton droit (menu d’options)',
        '<strong>Défilement</strong> : faites rouler la molette (haut/bas)',
      ],
      practice: 'Jeu de pratique : cliquez sur l’icône qui rebondit',
    },
    zh: {
      h3: '2. 使用鼠标（或触控板）',
      steps: [
        '<strong>单击</strong>：左键一次（选择）',
        '<strong>双击</strong>：左键快速两次（打开）',
        '<strong>右键</strong>：右键点击（选项菜单）',
        '<strong>滚动</strong>：滚轮上下滚动（上下移动）',
      ],
      practice: '练习游戏：点击会跳动的图标',
    },
  };
  const m = MOUSE[langShort];
  if (qs('#mouse h3')) qs('#mouse h3').textContent = m.h3;
  const bodies = Array.from(qs('#mouse .steps-grid')?.querySelectorAll('.step-body')||[]);
  bodies.forEach((el, i) => { if (m.steps[i]) el.innerHTML = m.steps[i]; });
  const pr = qs('#mouse .practice-title'); if (pr) pr.textContent = m.practice;

  // Keyboard card
  const KEYB = {
    en: {
      h3: '3. Using Your Keyboard',
      items: [
        '<strong>Space Bar</strong>: the biggest key',
        '<strong>Enter / Return</strong>: new line or confirm',
        '<strong>Backspace</strong>: erase to the left',
        '<strong>Arrow keys</strong> (← ↑ → ↓): move around',
      ],
      practiceLabel: 'Practice: Type your name',
      typedPrefix: 'You typed:',
      placeholder: 'Type your name here',
    },
    fr: {
      h3: '3. Utiliser votre clavier',
      items: [
        '<strong>Barre d’espace</strong> : la plus grande touche',
        '<strong>Entrée / Retour</strong> : nouvelle ligne ou valider',
        '<strong>Retour arrière</strong> : effacer vers la gauche',
        '<strong>Flèches</strong> (← ↑ → ↓) : se déplacer',
      ],
      practiceLabel: 'Pratique : tapez votre nom',
      typedPrefix: 'Vous avez tapé :',
      placeholder: 'Tapez votre nom ici',
    },
    zh: {
      h3: '3. 使用键盘',
      items: [
        '<strong>空格键</strong>：最大的一键',
        '<strong>回车/Enter</strong>：换行或确认',
        '<strong>退格键</strong>：向左删除',
        '<strong>方向键</strong>（← ↑ → ↓）：移动光标',
      ],
      practiceLabel: '练习：输入你的名字',
      typedPrefix: '你输入了：',
      placeholder: '在此输入你的名字',
    },
  };
  const k = KEYB[langShort];
  if (qs('#keyboard h3')) qs('#keyboard h3').textContent = k.h3;
  const kul = qs('#keyboard ul');
  if (kul) {
    const lis = Array.from(kul.querySelectorAll('li'));
    lis.forEach((li, i) => { if (k.items[i]) li.innerHTML = k.items[i]; });
  }
  const practiceTitle = qs('label[for="nameBox"]'); if (practiceTitle) practiceTitle.textContent = k.practiceLabel;
  const nameInput = qs('#nameBox'); if (nameInput) nameInput.placeholder = k.placeholder;
  const nameStatus = qs('#nameStatus'); if (nameStatus) {
    const text = nameStatus.textContent || '';
    const after = text.includes(':') ? text.slice(text.indexOf(':')+1) : '';
    nameStatus.textContent = `${k.typedPrefix}${after ? ' ' + after : ' (nothing yet)'}`;
  }

  // ----- Desktop & Files -----
  const DESK = {
    en: {
      understandH3: '4. Understanding Your Desktop',
      winDiag: '[Windows Screenshot Here] Start button • Taskbar • Icons • Clock',
      macDiag: '[Mac Screenshot Here] Menu bar • Dock • Desktop icons • Spotlight',
      linDiag: '[Linux Screenshot Here] Menu • System tray • Icons',
      openH3: '5. How to Open Programs (Apps)',
      openWin: ['Click the <strong>Start</strong> button.', 'Click the program name (example: Chrome).'],
      openMac: ['Click an app on the <strong>Dock</strong> (bottom bar), OR', 'Open <strong>Launchpad</strong> to see all apps.'],
      openLin: ['Click the <strong>Menu</strong> (often bottom-left).', 'Find the program in the list or search.'],
      findH3: '6. How to Find Your Files (Photos, Documents)',
      findWin: '<strong>Windows:</strong> Open <strong>File Explorer</strong> (yellow folder). Look in <strong>Documents</strong> or <strong>Pictures</strong>.',
      findMac: '<strong>Mac:</strong> Open <strong>Finder</strong> (blue face). Look in <strong>Documents</strong> or <strong>Pictures</strong>.',
      findLin: '<strong>Linux:</strong> Open <strong>File Manager</strong> (folder). Look in your <strong>Home</strong> folder.',
    },
    fr: {
      understandH3: '4. Comprendre votre bureau',
      winDiag: '[Capture Windows] Bouton Démarrer • Barre des tâches • Icônes • Horloge',
      macDiag: '[Capture Mac] Barre de menus • Dock • Icônes du bureau • Spotlight',
      linDiag: '[Capture Linux] Menu • Zone système • Icônes',
      openH3: '5. Ouvrir des programmes (applications)',
      openWin: ['Cliquez sur le bouton <strong>Démarrer</strong>.', "Cliquez sur le nom du programme (ex. : Chrome)."],
      openMac: ["Cliquez une app dans le <strong>Dock</strong> (barre du bas), OU", 'Ouvrez le <strong>Launchpad</strong> pour voir toutes les apps.'],
      openLin: ['Cliquez le <strong>Menu</strong> (souvent en bas à gauche).', 'Trouvez le programme dans la liste ou recherchez‑le.'],
      findH3: '6. Retrouver vos fichiers (photos, documents)',
      findWin: '<strong>Windows :</strong> Ouvrez <strong>Explorateur de fichiers</strong> (dossier jaune). <strong>Documents</strong> ou <strong>Images</strong>.',
      findMac: '<strong>Mac :</strong> Ouvrez <strong>Finder</strong> (visage bleu). <strong>Documents</strong> ou <strong>Images</strong>.',
      findLin: '<strong>Linux :</strong> Ouvrez le <strong>Gestionnaire de fichiers</strong>. Dossier <strong>Home</strong>.',
    },
    zh: {
      understandH3: '4. 认识桌面',
      winDiag: '[Windows 截图] 开始按钮 • 任务栏 • 图标 • 时钟',
      macDiag: '[Mac 截图] 菜单栏 • Dock 程序坞 • 桌面图标 • Spotlight',
      linDiag: '[Linux 截图] 菜单 • 系统托盘 • 图标',
      openH3: '5. 如何打开程序（App）',
      openWin: ['点击 <strong>开始</strong> 按钮。', '点击程序名称（例：Chrome）。'],
      openMac: ['点击 <strong>Dock</strong>（底部）的应用，或', '打开 <strong>Launchpad</strong> 查看全部应用。'],
      openLin: ['点击 <strong>菜单</strong>（通常在左下角）。', '在列表中找到或搜索程序。'],
      findH3: '6. 如何找到你的文件（照片、文档）',
      findWin: '<strong>Windows：</strong>打开 <strong>文件资源管理器</strong>（黄色文件夹）。查看 <strong>文档</strong> 或 <strong>图片</strong>。',
      findMac: '<strong>Mac：</strong>打开 <strong>Finder</strong>（蓝色笑脸）。查看 <strong>Documents</strong> 或 <strong>Pictures</strong>。',
      findLin: '<strong>Linux：</strong>打开 <strong>文件管理器</strong>。在 <strong>Home</strong> 目录。',
    }
  };
  const d = DESK[langShort];
  if (qs('#understandDesktop h3')) qs('#understandDesktop h3').textContent = d.understandH3;
  const diagW = qs('#understandDesktop [data-os="windows"] .diagram'); if (diagW) diagW.textContent = d.winDiag;
  const diagM = qs('#understandDesktop [data-os="mac"] .diagram'); if (diagM) diagM.textContent = d.macDiag;
  const diagL = qs('#understandDesktop [data-os="linux"] .diagram'); if (diagL) diagL.textContent = d.linDiag;

  if (qs('#openPrograms h3')) qs('#openPrograms h3').textContent = d.openH3;
  setList('#openPrograms [data-os="windows"] .steps', d.openWin);
  setList('#openPrograms [data-os="mac"] .steps', d.openMac);
  setList('#openPrograms [data-os="linux"] .steps', d.openLin);

  if (qs('#findFiles h3')) qs('#findFiles h3').textContent = d.findH3;
  const ffW = qs('#findFiles [data-os="windows"] p'); if (ffW) ffW.innerHTML = d.findWin;
  const ffM = qs('#findFiles [data-os="mac"] p'); if (ffM) ffM.innerHTML = d.findMac;
  const ffL = qs('#findFiles [data-os="linux"] p'); if (ffL) ffL.innerHTML = d.findLin;

  // ----- Internet -----
  const NET = {
    en: {
      openH3: '7. Opening Your Web Browser',
      openP: 'Your browser is your <strong>window to the internet</strong>.',
      goH3: '8. Browsing the Web: Going to a Website',
      goSteps: ['Click the <strong>address bar</strong> (long box at the top).', 'Type a web address (example: <code>www.cbc.ca</code>).', 'Press <strong>Enter</strong>.'],
      goTip: 'Safety Tip: Look for the lock icon 🔒 next to the address for safer sites.',
      bmH3: '9. Using Bookmarks (Saving Your Favorite Websites)',
      bmSave: ['Go to the website you like.', 'Click the <strong>star</strong> ★ in the address bar.', 'Click <strong>Save</strong> or <strong>Done</strong>.'],
      bmFind: 'To Find Your Bookmarks',
      bmFindItems: ['Click the star icon, or the bookmarks menu (three lines or a bookshelf).'],
      safeH3: '10. Staying Safe on the Internet',
      safeItems: ['🟢 <strong>Green (Safe):</strong> Official websites (.gov, .ca), banks, news you know.', '🟡 <strong>Yellow (Careful):</strong> Pop-ups, emails from strangers, “You won a prize!”.', '🔴 <strong>Red (Danger):</strong> Sites asking for passwords/money, scary warnings, loud sounds.'],
      safeRule: 'Rule: When in doubt, close the page or ask someone you trust.',
    },
    fr: {
      openH3: '7. Ouvrir votre navigateur web',
      openP: 'Le navigateur est votre <strong>fenêtre sur Internet</strong>.',
      goH3: '8. Aller sur un site web',
      goSteps: ["Cliquez la <strong>barre d’adresse</strong> (en haut).", "Tapez l’adresse (ex. : <code>www.cbc.ca</code>).", 'Appuyez sur <strong>Entrée</strong>.'],
      goTip: 'Astuce sécurité : l’icône 🔒 à côté de l’adresse indique une connexion plus sûre.',
      bmH3: '9. Utiliser les favoris (enregistrer vos sites)',
      bmSave: ['Allez sur le site souhaité.', 'Cliquez l’<strong>étoile</strong> ★ dans la barre d’adresse.', 'Cliquez <strong>Enregistrer</strong> ou <strong>Terminé</strong>.'],
      bmFind: 'Retrouver vos favoris',
      bmFindItems: ["Cliquez l’icône étoile ou le menu des favoris (trois lignes ou une étagère)."],
      safeH3: '10. Rester en sécurité sur Internet',
      safeItems: ["🟢 <strong>Vert (Sûr)</strong> : sites officiels (.gouv, .ca), banques, médias connus.", '🟡 <strong>Jaune (Prudence)</strong> : fenêtres pop‑up, emails d’inconnus, “Vous avez gagné!”.', '🔴 <strong>Rouge (Danger)</strong> : sites demandant mots de passe/argent, messages alarmants.'],
      safeRule: 'Règle : en cas de doute, fermez la page ou demandez à quelqu’un de confiance.',
    },
    zh: {
      openH3: '7. 打开浏览器',
      openP: '浏览器是通向互联网的<strong>窗口</strong>。',
      goH3: '8. 上网：访问网站',
      goSteps: ['点击<strong>地址栏</strong>（顶部长框）。', '输入网址（如：<code>www.cbc.ca</code>）。', '按下 <strong>Enter</strong>。'],
      goTip: '安全提示：地址旁的 🔒 图标表示更安全的连接。',
      bmH3: '9. 书签（收藏常用网站）',
      bmSave: ['打开你喜欢的网站。', '点击地址栏里的<strong>星标</strong> ★。', '点击 <strong>保存</strong>。'],
      bmFind: '如何找到书签',
      bmFindItems: ['点击星标图标或“书签/收藏夹”菜单（可能是三条线或书本图标）。'],
      safeH3: '10. 网络安全',
      safeItems: ['🟢 <strong>绿色（安全）</strong>：政府/官方站点、银行、熟悉的媒体。', '🟡 <strong>黄色（注意）</strong>：弹窗、陌生邮件、“你中奖了”。', '🔴 <strong>红色（危险）</strong>：索要密码/钱款、吓人的警告、刺耳声音。'],
      safeRule: '原则：不确定就关掉网页，或询问可信的人。',
    },
  };
  const n = NET[langShort];
  if (qs('#browserIcons h3')) qs('#browserIcons h3').textContent = n.openH3;
  const pOpen = qs('#browserIcons p'); if (pOpen) pOpen.innerHTML = n.openP;
  if (qs('#goWebsite h3')) qs('#goWebsite h3').textContent = n.goH3;
  setList('#goWebsite .steps', n.goSteps);
  const goTip = qs('#goWebsite .practice'); if (goTip) goTip.innerHTML = `<strong>${n.goTip}</strong>`;
  if (qs('#bookmarks h3')) qs('#bookmarks h3').textContent = n.bmH3;
  setList('#bookmarks .steps', n.bmSave);
  const bmH4 = qs('#bookmarks h4:nth-of-type(2)'); if (bmH4) bmH4.textContent = n.bmFind;
  const bmUl = qs('#bookmarks ul'); if (bmUl) { const lis = Array.from(bmUl.querySelectorAll('li')); lis.forEach((li,i)=>{ if (n.bmFindItems[i]) li.textContent = n.bmFindItems[i]; }); }
  if (qs('#internetSafety h3')) qs('#internetSafety h3').textContent = n.safeH3;
  const si = qs('#internetSafety ul'); if (si) { const lis = Array.from(si.querySelectorAll('li')); lis.forEach((li,i)=>{ if (n.safeItems[i]) li.innerHTML = n.safeItems[i]; }); }
  const sr = qs('#internetSafety p.practice'); const prP = qs('#internetSafety p'); if (prP) prP.innerHTML = `<strong>${n.safeRule}</strong>`;

  // ----- Do section -----
  const DOX = {
    en: {
      installH3: '11. How to Download & Install Apps Safely',
      winSafe: ['Click <strong>Start</strong> → <strong>Microsoft Store</strong> (shopping bag).', 'Search for the app (example: Zoom).', 'Click <strong>Get</strong> or <strong>Install</strong>.'],
      winWarn: 'Warning: Avoid fake “Download Now” buttons on ads.',
      macSafe: ['Open <strong>App Store</strong> (blue “A”).', 'Search and click <strong>Get</strong>.'],
      macOtherH4: 'Other Mac apps',
      macOther: ['Download a <code>.dmg</code> file from the official site.', 'Open it, then drag the app into <strong>Applications</strong>.'],
      linSafe: ['Open <strong>Software Center</strong> / <strong>Discover</strong> / <strong>GNOME Software</strong>.', 'Search and click <strong>Install</strong>.'],
      docH3: '12. Typing and Saving a Document',
      docSteps: ['Click <strong>File</strong>.', 'Click <strong>Save As…</strong>', 'Choose <strong>Documents</strong>.', 'Name your file.', 'Click <strong>Save</strong>.'],
      prnH3: '13. Connecting a Printer or Other Device',
      prnSteps: ['Plug the cable in.', 'Wait. The computer may say “Setting up device”.', "If it doesn’t work: check it’s on, restart the computer, ask for help."],
    },
    fr: {
      installH3: '11. Télécharger & installer des apps en sécurité',
      winSafe: ['<strong>Démarrer</strong> → <strong>Microsoft Store</strong> (sac).', "Recherchez l’app (ex. : Zoom).", 'Cliquez <strong>Get</strong> / <strong>Install</strong>.'],
      winWarn: 'Attention : évitez les faux boutons « Download Now » dans les pubs.',
      macSafe: ["Ouvrez l’<strong>App Store</strong> (A bleue).", 'Recherchez puis cliquez <strong>Obtenir</strong>.'],
      macOtherH4: 'Autres apps sur Mac',
      macOther: ["Téléchargez un fichier <code>.dmg</code> depuis le site officiel.", 'Ouvrez‑le, puis glissez l’app dans <strong>Applications</strong>.'],
      linSafe: ["Ouvrez le <strong>Centre logiciel</strong> / <strong>Discover</strong> / <strong>GNOME Software</strong>.", 'Recherchez puis <strong>Installer</strong>.'],
      docH3: '12. Saisir et enregistrer un document',
      docSteps: ['Cliquez <strong>Fichier</strong>.', 'Cliquez <strong>Enregistrer sous…</strong>', '<strong>Documents</strong>.', 'Donnez un nom.', 'Cliquez <strong>Enregistrer</strong>.'],
      prnH3: '13. Connecter une imprimante ou autre périphérique',
      prnSteps: ['Branchez le câble.', 'Patientez : « Configuration du périphérique ».', "Sinon : vérifiez l’alimentation, redémarrez, demandez de l’aide."],
    },
    zh: {
      installH3: '11. 安全下载与安装应用',
      winSafe: ['点击 <strong>开始</strong> → <strong>Microsoft Store</strong>。', '搜索应用（如 Zoom）。', '点击 <strong>获取/安装</strong>。'],
      winWarn: '注意：不要点广告里的“Download Now”。',
      macSafe: ['打开 <strong>App Store</strong>（蓝色 A）。', '搜索并点击 <strong>获取</strong>。'],
      macOtherH4: '其它 Mac 应用',
      macOther: ['从官方网站下载 <code>.dmg</code> 文件。', '打开后把应用拖入 <strong>Applications</strong>。'],
      linSafe: ['打开 <strong>软件中心</strong> / <strong>Discover</strong> / <strong>GNOME Software</strong>。', '搜索并点击 <strong>安装</strong>。'],
      docH3: '12. 输入与保存文档',
      docSteps: ['点击 <strong>文件</strong>', '点击 <strong>另存为…</strong>', '选择 <strong>Documents</strong>', '输入文件名', '点击 <strong>保存</strong>'],
      prnH3: '13. 连接打印机或其它设备',
      prnSteps: ['插好数据线。', '等待：电脑可能显示“正在设置设备”。', '不行时：确认电源开、重启电脑、请人协助。'],
    }
  };
  const dox = DOX[langShort];
  if (qs('#installApps h3')) qs('#installApps h3').textContent = dox.installH3;
  setList('#installApps [data-os="windows"] .steps', dox.winSafe);
  const warnW = qs('#installApps [data-os="windows"] .practice'); if (warnW) warnW.textContent = dox.winWarn;
  setList('#installApps [data-os="mac"] .steps', dox.macSafe);
  const macOtherH4 = qs('#installApps [data-os="mac"] + h4');
  if (macOtherH4) macOtherH4.textContent = dox.macOtherH4;
  setList('#installApps [data-os="mac"] + h4 + ol.steps', dox.macOther);
  setList('#installApps [data-os="linux"] .steps', dox.linSafe);

  if (qs('#saveDoc h3')) qs('#saveDoc h3').textContent = dox.docH3;
  setList('#saveDoc .steps', dox.docSteps);

  if (qs('#printer h3')) qs('#printer h3').textContent = dox.prnH3;
  setList('#printer .steps', dox.prnSteps);

  // ----- Troubleshooting -----
  const TRBL = {
    en: {
      slowH3: '14. “My computer is slow/frozen.”',
      slowSteps: ['First: Close some programs (click X).', 'Second: Restart (Shut down → wait 10s → turn on).'],
      findH3: '15. “I can’t find my file!”',
      findP: ['<strong>Windows:</strong> Click Start, type the file name.', '<strong>Mac:</strong> Click Spotlight (🔍), type.', '<strong>Linux:</strong> Click Menu, type in search bar.'],
      smallH3: '16. “The screen is too small to read!”',
      zoomH4: 'Zoom in',
      zoomP: 'Hold <strong>Ctrl</strong> (or <strong>Cmd</strong> on Mac) and press <strong>+</strong>.',
      displayH4: 'Make everything bigger (Display Settings)',
      dispP: ['<strong>Windows:</strong> Right‑click desktop → Display Settings → Scale', '<strong>Mac:</strong> Apple menu → System Settings → Displays → Scaled', '<strong>Linux:</strong> Settings → Displays → Scale (varies)'],
    },
    fr: {
      slowH3: '14. « Mon ordinateur est lent/bloqué. »',
      slowSteps: ['1) Fermez quelques programmes (croix X).', '2) Redémarrez (Éteindre → 10 s → rallumer).'],
      findH3: '15. « Je ne trouve pas mon fichier ! »',
      findP: ['<strong>Windows :</strong> Démarrer, tapez le nom.', '<strong>Mac :</strong> Spotlight (🔍).', '<strong>Linux :</strong> Menu puis barre de recherche.'],
      smallH3: '16. « L’écran est trop petit »',
      zoomH4: 'Zoom avant',
      zoomP: 'Maintenez <strong>Ctrl</strong> (ou <strong>Cmd</strong> sur Mac) + <strong>+</strong>.',
      displayH4: 'Tout agrandir (Réglages d’affichage)',
      dispP: ['<strong>Windows :</strong> Clic droit bureau → Affichage → Échelle', '<strong>Mac :</strong>  → Réglages système → Moniteurs → Échelle', '<strong>Linux :</strong> Réglages → Moniteurs → Échelle (varie)'],
    },
    zh: {
      slowH3: '14. “电脑很慢/卡住”',
      slowSteps: ['先：关闭一些程序（点右上角 X）', '再：重启（关机 → 等 10 秒 → 开机）'],
      findH3: '15. “找不到文件”',
      findP: ['<strong>Windows：</strong> 点开始，输入文件名', '<strong>Mac：</strong> 点 Spotlight（🔍）搜索', '<strong>Linux：</strong> 菜单 → 搜索栏输入'],
      smallH3: '16. “屏幕字太小看不清”',
      zoomH4: '放大',
      zoomP: '按住 <strong>Ctrl</strong>（Mac 为 <strong>Cmd</strong>）+ <strong>+</strong>。',
      displayH4: '整体放大（显示设置）',
      dispP: ['<strong>Windows：</strong> 桌面右键 → 显示设置 → 缩放', '<strong>Mac：</strong>  → 系统设置 → 显示器 → 显示比例', '<strong>Linux：</strong> 设置 → 显示 → 缩放（因发行版而异）'],
    }
  };
  const tb = TRBL[langShort];
  if (qs('#slow h3')) qs('#slow h3').textContent = tb.slowH3;
  setList('#slow .steps', tb.slowSteps);
  if (qs('#cantFind h3')) qs('#cantFind h3').textContent = tb.findH3;
  const fp = qsa('#cantFind .os-block p'); fp.forEach((p,i)=>{ if(tb.findP[i]) p.innerHTML = tb.findP[i]; });
  if (qs('#tooSmall h3')) qs('#tooSmall h3').textContent = tb.smallH3;
  const zh4 = qsa('#tooSmall h4'); if (zh4[0]) zh4[0].textContent = tb.zoomH4; if (zh4[1]) zh4[1].textContent = tb.displayH4;
  const zp = qsa('#tooSmall p'); if (zp[0]) zp[0].innerHTML = tb.zoomP;
  const dp = qsa('#tooSmall .os-block p'); dp.forEach((p,i)=>{ if(tb.dispP[i]) p.innerHTML = tb.dispP[i]; });

  // ----- Practice & Quiz -----
  const PZ = {
    en: { practiceH2: 'F. PRACTICE & QUIZ', interactiveH3: 'Interactive Practice', quizH3: 'Simple “Did You Learn It?” Quiz', check: 'Check Answers' },
    fr: { practiceH2: 'F. PRATIQUE & QUIZ', interactiveH3: 'Pratique interactive', quizH3: 'Petit quiz « Avez‑vous appris ? »', check: 'Vérifier les réponses' },
    zh: { practiceH2: 'F. 练习与测验', interactiveH3: '互动练习', quizH3: '小测验：你学会了吗？', check: '检查答案' },
  };
  const pz = PZ[langShort];
  const pzh2 = qs('#practice .section-title'); if (pzh2) pzh2.textContent = pz.practiceH2;
  const ih3 = qs('#practiceTasks h3'); if (ih3) ih3.textContent = pz.interactiveH3;
  const qh3 = qs('#quiz h3'); if (qh3) qh3.textContent = pz.quizH3;
  const checkBtn = qs('#btnCheckQuiz'); if (checkBtn) checkBtn.textContent = pz.check;
}

  // Navigation
  const historyStack = []; // simple back stack of section ids

  function goTo(id) {
    const next = panels[id];
    if (!next) return;

    const current = Object.entries(panels).find(([, el]) => !el.hasAttribute('hidden'));
    if (current) historyStack.push(current[0]);

    showOnly(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function goBack() {
    const prev = historyStack.pop();
    if (!prev) {
      // If no history, go to menu
      showOnly(panels.osMenu);
      return;
    }
    showOnly(panels[prev]);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function goHome() {
    historyStack.length = 0;
    currentOS = null;
    storage.os = '';
    crumbOS.textContent = T().crumbChoose;
    showOnly(panels.osStart);
  }

  // Accessibility
  function toggleContrast() {
    const on = !document.body.classList.contains('hc');
    document.body.classList.toggle('hc', on);
    storage.hc = on;
  }

  function setFontPct(pct) {
    pct = Math.min(160, Math.max(90, pct));
    document.documentElement.style.fontSize = pct + '%';
    storage.font = pct;
  }

  // Listen
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  u.lang = T().ttsLang;
  speechSynthesis.speak(u);
}

  function sectionText(selector) {
    const el = qs(selector);
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('button, svg, .diagram, .game, .bouncer').forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // Mouse click game
  function initClickGame() {
    const game = qs('#clickGame');
    const b = qs('#bouncer');
    const status = qs('#gameStatus');
    if (!game || !b || !status) return;

    let score = 0;
    let x = 10;
    let y = 10;
    let vx = 2.2;
    let vy = 1.8;

    function tick() {
      const w = game.clientWidth;
      const h = game.clientHeight;
      const bw = b.offsetWidth;
      const bh = b.offsetHeight;

      x += vx;
      y += vy;
      if (x < 0 || x + bw > w) vx *= -1;
      if (y < 0 || y + bh > h) vy *= -1;

      b.style.left = Math.max(0, Math.min(w - bw, x)) + 'px';
      b.style.top = Math.max(0, Math.min(h - bh, y)) + 'px';

      requestAnimationFrame(tick);
    }

    b.addEventListener('click', () => {
      score += 1;
      status.textContent = `Score: ${score}`;
    });

    requestAnimationFrame(tick);
  }

  // Keyboard practice
  function initNamePractice() {
    const box = qs('#nameBox');
    const out = qs('#nameStatus');
    if (!box || !out) return;
    box.addEventListener('input', () => {
      out.textContent = box.value.trim() ? `You typed: ${box.value}` : 'You typed: (nothing yet)';
    });
  }

  // Quiz
  function initQuiz() {
    const btn = qs('#btnCheckQuiz');
    const res = qs('#quizResult');
if (!btn || !res) return;

const answers = { q1: 'b', q2: 'b', q3: 'b' };

btn.addEventListener('click', () => {
  const t = T().quiz;
  let correct = 0;
  Object.entries(answers).forEach(([q, a]) => {
    const chosen = qs(`input[name="${q}"]:checked`)?.value;
    const fb = qs(`#${q}fb`);
    if (!fb) return;
    if (!chosen) {
      fb.textContent = t.please;
      fb.style.color = 'var(--muted)';
      return;
    }
    if (chosen === a) {
      correct += 1;
      fb.textContent = t.correct;
      fb.style.color = 'var(--accent-strong)';
    } else {
      fb.textContent = t.wrong;
      fb.style.color = '#b00020';
    }
  });

  res.textContent = t.result(correct);

      if (correct === 3) {
        // counts toward the Safety First badge
        window.AideProgress?.markSafetyQuizComplete?.('computer_quiz');
        window.AideProgress?.celebrate?.();
      }
    });
  }

  function wire() {
  // OS choose (only the three choice buttons on the start panel)
  qsa('button.choice[data-os]').forEach((btn) => btn.addEventListener('click', () => applyOS(btn.dataset.os)));

    // Identify helper
    qs('#btnIdentify').addEventListener('click', toggleIdentify);

    // Menu topics
    qsa('.topic').forEach((t) => t.addEventListener('click', () => goTo(t.dataset.goto)));

    // Nav buttons
    qsa('[data-nav="back"]').forEach((b) => b.addEventListener('click', goBack));
    qsa('[data-nav="home"]').forEach((b) => b.addEventListener('click', goHome));
    qsa('[data-nav="next"]').forEach((b) => b.addEventListener('click', () => goTo(b.dataset.next)));

    qs('#btnChangeOS').addEventListener('click', goHome);

    // Accessibility
    qs('#btnContrast').addEventListener('click', toggleContrast);
    qs('#btnTextInc').addEventListener('click', () => setFontPct(storage.font + 10));
    qs('#btnTextDec').addEventListener('click', () => setFontPct(storage.font - 10));
    qs('#btnPrint').addEventListener('click', () => window.print());

    // Listen buttons
    qsa('.listen-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-listen');
        speakText(sectionText(sel));
      });
    });

    // Language buttons (for future translations; currently only sets pressed state)
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => {
        qsa('.lang__btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  }

  function restore() {
    if (storage.hc) document.body.classList.add('hc');
    setFontPct(storage.font);

    const os = storage.os;
    if (os === 'windows' || os === 'mac' || os === 'linux') {
      applyOS(os);
    } else {
      showOnly(panels.osStart);
    }
  }

function initAll(){
  try{ wire(); }catch(e){}
  try{ initClickGame(); }catch(e){}
  try{ initNamePractice(); }catch(e){}
  try{ initQuiz(); }catch(e){}
  try{ applyComputerLang(); }catch(e){}
  try{ restore(); }catch(e){}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// Event delegation fallback (ensures clicks work even if early binding failed)
document.addEventListener('click', (e) => {
  const osBtn = e.target.closest('button.choice[data-os]');
  if (osBtn) { e.preventDefault(); applyOS(osBtn.dataset.os); return; }
  const idBtn = e.target.closest('#btnIdentify');
  if (idBtn) { e.preventDefault(); toggleIdentify(); return; }
  const topicBtn = e.target.closest('.topic');
  if (topicBtn) { e.preventDefault(); goTo(topicBtn.dataset.goto); return; }
  const backBtn = e.target.closest('[data-nav="back"]'); if (backBtn) { e.preventDefault(); goBack(); return; }
  const homeBtn = e.target.closest('[data-nav="home"]'); if (homeBtn) { e.preventDefault(); goHome(); return; }
  const nextBtn = e.target.closest('[data-nav="next"]'); if (nextBtn) { e.preventDefault(); goTo(nextBtn.dataset.next); return; }
});

// React to global language changes
window.addEventListener('aide:langChanged', applyComputerLang);

// Completion panel
window.AideProgress?.attachCompletionPanel?.({ skillId: 'computer' });
})();
