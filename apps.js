/* apps.js — Useful Apps page interactions
   - Expand/collapse each app card
   - Search and “Easy only” filter
   - “Ask for help setting up” generates an SMS-style message
   - Listen buttons read each expanded card
   - Flow buttons scroll to recommended apps
   - Print
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // i18n for toolbar/filters
  const I18N_APPS = {
    en: {
      findLabel: 'Find app for…',
      placeholder: 'family, photos, bus, translate, banking…',
      easyOnly: 'Show 🟢 Easy apps only',
      printList: 'Print This List',
      flowTitle: 'Start here → What do you want to do?',
      flow: { family: 'Talk to family', photos: 'See family photos', bus: 'Check bus time', french: 'Learn French', bank: 'Bank safely' },
      helpMsg: (name) => `Hi, can you help me install the ${name} app?`,
      helpBtn: 'Ask for help setting up',
      ttsLang: 'en-US',
    },
    fr: {
      findLabel: 'Chercher une app pour…',
      placeholder: 'famille, photos, bus, traduire, banque…',
      easyOnly: 'Afficher seulement les apps 🟢 faciles',
      printList: 'Imprimer cette liste',
      flowTitle: 'Commencez ici → Que voulez‑vous faire ?',
      flow: { family: 'Parler à la famille', photos: 'Voir les photos de famille', bus: 'Voir l’heure du bus', french: 'Apprendre le français', bank: 'Banque en sécurité' },
      helpMsg: (name) => `Bonjour, pouvez‑vous m’aider à installer l’app ${name} ?`,
      helpBtn: 'Demander de l’aide pour l’installation',
      ttsLang: 'fr-CA',
    },
    zh: {
      findLabel: '查找应用：',
      placeholder: '家人、照片、公交、翻译、银行…',
      easyOnly: '只显示 🟢 简单应用',
      printList: '打印此清单',
      flowTitle: '从这里开始 → 你想做什么？',
      flow: { family: '联系家人', photos: '看家人照片', bus: '查看公交时间', french: '学法语', bank: '安全办理银行业务' },
      helpMsg: (name) => `你好，可以帮我安装 ${name} 应用吗？`,
      helpBtn: '需要安装帮助',
      ttsLang: 'zh-CN',
    },
  };
  function curLang(){ return (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en'); }
  function TA(){ return I18N_APPS[curLang()] || I18N_APPS.en; }

  // Content strings for headings/categories
  const I18N_APPSX = {
    en: {
      brandSubtitle: 'Useful Apps for Seniors',
      cats: {
        social: { h2: 'Social & Connection', hint: 'Stay in touch with family and friends, see photos and videos.' },
        transport: { h2: 'Getting Around — Transport (Montreal)', hint: 'Bus, metro, taxi, and navigation in Montreal.' },
        bank: { h2: 'Money & Banking', warn: '⚠️ Use only your real bank’s app. Never share passwords or PINs. Ask a trusted family member to help the first time.' },
        health: { h2: 'Health & Wellness' },
        language: { h2: 'Language Learning' },
        daily: { h2: 'Everyday Life' },
      },
      legend: { h3: 'Safety Labels', items: ['🟢 Green Shield: Generally safe, good privacy', '🟡 Yellow Shield: Needs careful setup (privacy settings)', '🔴 Red Shield: Needs family help to set up (banking/social accounts)'] },
      starter: { h3: 'My First 5 Apps (Starter Pack)', print: 'Print This List', items: ['Transit — get around', 'Google Translate — language help', 'YouTube — entertainment & learning', 'Medisafe — health reminders', "Your Bank's App — with family help"] },
    },
    fr: {
      brandSubtitle: 'Applications utiles pour aînés',
      cats: {
        social: { h2: 'Réseaux & liens', hint: 'Restez en contact, voyez photos et vidéos.' },
        transport: { h2: 'Se déplacer — Transport (Montréal)', hint: 'Bus, métro, taxi et navigation à Montréal.' },
        bank: { h2: 'Argent & banque', warn: '⚠️ Utilisez uniquement l’app officielle de votre banque. Ne partagez jamais mots de passe/NIP. Demandez l’aide d’un proche la première fois.' },
        health: { h2: 'Santé & bien‑être' },
        language: { h2: 'Apprentissage des langues' },
        daily: { h2: 'Vie quotidienne' },
      },
      legend: { h3: 'Niveaux de sécurité', items: ['🟢 Bouclier vert : généralement sûr, bonne confidentialité', '🟡 Bouclier jaune : réglages de confidentialité requis', '🔴 Bouclier rouge : nécessite l’aide de la famille (banque/réseaux sociaux)'] },
      starter: { h3: 'Mes 5 premières apps (pack de départ)', print: 'Imprimer cette liste', items: ['Transit — se déplacer', 'Google Translate — aide langue', 'YouTube — loisirs & apprentissage', 'Medisafe — rappels santé', 'Votre app bancaire — avec un proche'] },
    },
    zh: {
      brandSubtitle: '适合老年人的常用应用',
      cats: {
        social: { h2: '社交与联系', hint: '与家人朋友保持联系，观看照片与视频。' },
        transport: { h2: '出行 — 交通（蒙特利尔）', hint: '公交、地铁、出租车与导航。' },
        bank: { h2: '资金与银行', warn: '⚠️ 只使用你所在银行的官方 App。不要分享密码或 NIP。首次请家人协助。' },
        health: { h2: '健康与保健' },
        language: { h2: '语言学习' },
        daily: { h2: '日常生活' },
      },
      legend: { h3: '安全标识', items: ['🟢 绿色盾牌：总体安全，隐私较好', '🟡 黄色盾牌：需要认真设置（隐私）', '🔴 红色盾牌：需要家人协助（银行/社交）'] },
      starter: { h3: '入门 5 款应用（新手套装）', print: '打印此清单', items: ['Transit — 出行', 'Google Translate — 语言帮助', 'YouTube — 娱乐与学习', 'Medisafe — 健康提醒', '你的银行 App — 在家人帮助下'] },
    },
  };
  function TX(){ const l = curLang(); return I18N_APPSX[l] || I18N_APPSX.en; }

  // Per‑app body content i18n
  const I18N_APPSCARD = {
    en: {
      youtube: { p: [
        '<strong>What it is:</strong> Watch videos on any topic.',
        "<strong>Why it's good:</strong> Grandchildren videos, old music, tutorials.",
        '<strong>Safety tip:</strong> Stick to subscribed channels; avoid random links.'
      ]},
      facebook: { p: [
        '<strong>What it is:</strong> See family photos and updates.',
        "<strong>Why it's good:</strong> Family groups, community news, birthday reminders.",
        '<strong>Setup help needed?</strong> <strong>Yes</strong> — Ask family to help create an account and adjust privacy. Enable <em>Text Size: Large</em> in settings.'
      ]},
      messenger: { p: [
        '<strong>What it is:</strong> Simple video calls and messaging.',
        "<strong>Why it's good:</strong> Big video buttons, see who’s calling."
      ]},
      wechat: { p: [
        '<strong>What it is:</strong> Popular messaging app in Chinese community.',
        "<strong>Why it's good:</strong> Voice messages, group chats, Chinese interface."
      ]},
      instagram: { p: [
        '<strong>What it is:</strong> Photo and video sharing.',
        "<strong>Why it's good:</strong> Follow family and see grandchildren’s photos.",
        '<strong>Safety tip:</strong> Keep your profile <em>Private</em>.'
      ]},
      chrono: { ul: ['Check next bus times','Plan A → B trips','See metro status','<strong>Reload OPUS with phone</strong> (NFC needed)'], pImportant: '<strong>Important:</strong> Your phone must support NFC to reload the card.' },
      transit: { p: [
        '<strong>What it is:</strong> Real‑time bus/train tracker.',
        ' <strong>Why it\'s good:</strong> Simple maps, “Go” button tells you when to leave.'
      ]},
      uber: { p: [
        '<strong>What it is:</strong> Call a car to your location.',
        '<strong>Setup help needed?</strong> <strong>Yes</strong> — Needs payment method and account.',
        '<strong>Safety:</strong> Driver info and car plate shown before ride.'
      ]},
      taxi: { p: [ '<strong>Alternative to Uber:</strong> Pay by cash or card.', '<strong>Phone to call:</strong> 514‑725‑9888' ]},
      rbc: { p: ['Check balance, pay bills, send money.'], ul: ['Large Text Mode in settings','Quick Balance (no full login)','Bill Pay & Interac e‑Transfer'], ol: ['Download official app.','Call your bank or visit a branch to activate.','Log in with client card and password.','Set up Touch ID / Face ID.','Log out after use.'] },
      td: { p: ['Banking features similar to RBC.'] },
      scotia: { p: ['Use the official app only; follow the general steps above.'] },
      bmo: { p: ['Use the official app only; follow the general steps above.'] },
      cibc: { p: ['Use the official app only; follow the general steps above.'] },
      medisafe: { p: ['Pill reminder and tracker; refill reminders; simple history log.'] },
      pacer: { p: ['Tracks walking steps to encourage gentle movement.'] },
      calm: { p: ['Sleep sounds and meditation guides to help relaxation.'] },
      twn: { p: ['Weather forecast app for your city.'] },
      cbc: { p: ['Canadian news app with text and video.'] },
      flipp: { p: ['Weekly grocery flyers and deals.'] },
      gmaps: { p: ['Find places and get directions.'] },
    },
    fr: {
      youtube: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Regarder des vidéos sur tous les sujets.",
        "<strong>Pourquoi c'est bien :</strong> vidéos des petits‑enfants, musique d'époque, tutoriels.",
        '<strong>Conseil sécurité :</strong> Abonnez‑vous à des chaînes fiables ; évitez les liens au hasard.'
      ]},
      facebook: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Voir des photos et nouvelles de la famille.",
        "<strong>Pourquoi c'est bien :</strong> Groupes familiaux, nouvelles locales, anniversaires.",
        "<strong>Besoin d'aide à l'installation ?</strong> <strong>Oui</strong> — Demandez à un proche de créer le compte et régler la confidentialité. Activez <em>Taille du texte : Grand</em>."
      ]},
      messenger: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Appels vidéo et messages simples.",
        "<strong>Pourquoi c'est bien :</strong> Gros boutons vidéo, on voit qui appelle."
      ]},
      wechat: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Messagerie très utilisée dans la communauté chinoise.",
        "<strong>Pourquoi c'est bien :</strong> Messages vocaux, groupes, interface en chinois."
      ]},
      instagram: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Partage de photos et vidéos.",
        "<strong>Pourquoi c'est bien :</strong> Suivre la famille, voir les photos des petits‑enfants.",
        '<strong>Conseil sécurité :</strong> Gardez votre profil <em>Privé</em>.'
      ]},
      chrono: { ul: ['Voir les prochains bus','Planifier des trajets A → B','État du métro','<strong>Recharger OPUS avec le téléphone</strong> (NFC requis)'], pImportant: "<strong>Important :</strong> Le téléphone doit avoir le NFC pour recharger la carte." },
      transit: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Suivi en temps réel des bus/trains.",
        ' <strong>Pourquoi c\'est bien :</strong> Cartes simples, le bouton « Go » dit quand partir.'
      ]},
      uber: { p: [
        "<strong>Qu'est‑ce que c'est ?</strong> Appeler une voiture à votre position.",
        "<strong>Besoin d'aide à l'installation ?</strong> <strong>Oui</strong> — Nécessite moyen de paiement et compte.",
        '<strong>Sécurité :</strong> Infos chauffeur et plaque affichées avant la course.'
      ]},
      taxi: { p: [ "<strong>Alternative à Uber :</strong> Paiement en espèces ou carte.", '<strong>Téléphone :</strong> 514‑725‑9888' ]},
      rbc: { p: ['Consulter le solde, payer des factures, envoyer de l’argent.'], ul: ['Mode texte grand (réglages)','Solde rapide (sans connexion complète)','Paiement de factures & Virement Interac'], ol: ["Téléchargez l’app officielle.", 'Appelez votre banque ou allez en succursale pour activer.', 'Connectez‑vous avec carte client et mot de passe.', 'Activez Touch ID / Face ID.', 'Déconnectez‑vous après usage.'] },
      td: { p: ['Fonctions similaires à RBC.'] },
      scotia: { p: ["Utilisez seulement l’app officielle ; suivez les étapes générales ci‑dessus."] },
      bmo: { p: ["Utilisez seulement l’app officielle ; suivez les étapes générales ci‑dessus."] },
      cibc: { p: ["Utilisez seulement l’app officielle ; suivez les étapes générales ci‑dessus."] },
      medisafe: { p: ['Rappel de prise de médicaments ; rappels de renouvellement ; historique simple.'] },
      pacer: { p: ['Compte les pas pour encourager une marche légère.'] },
      calm: { p: ['Sons pour le sommeil et guides de méditation pour se détendre.'] },
      twn: { p: ['Application météo pour votre ville.'] },
      cbc: { p: ['Actualités canadiennes (texte et vidéo).'] },
      flipp: { p: ['Circulaires et rabais des épiceries.'] },
      gmaps: { p: ['Trouver des lieux et des itinéraires.'] },
    },
    zh: {
      youtube: { p: [
        '<strong>是什么：</strong> 观看各类主题的视频。',
        '<strong>优点：</strong> 孙辈视频、老歌、教学。',
        '<strong>安全提示：</strong> 订阅熟悉的频道，避免随意点击陌生链接。'
      ]},
      facebook: { p: [
        '<strong>是什么：</strong> 查看家人照片和动态。',
        '<strong>优点：</strong> 家庭群组、社区消息、生日提醒。',
        '<strong>是否需要安装帮助？</strong><strong>需要</strong> — 请家人协助创建账号并设置隐私；开启<em>大字号</em>。'
      ]},
      messenger: { p: [
        '<strong>是什么：</strong> 简单的视频通话与聊天。',
        '<strong>优点：</strong> 大按钮，能看到来电人。'
      ]},
      wechat: { p: [
        '<strong>是什么：</strong> 华人常用的聊天应用。',
        '<strong>优点：</strong> 语音留言、群聊、中文界面。'
      ]},
      instagram: { p: [
        '<strong>是什么：</strong> 照片与短视频分享。',
        '<strong>优点：</strong> 关注家人，观看孙辈照片。',
        '<strong>安全提示：</strong> 建议将个人主页设为<em>私密</em>。'
      ]},
      chrono: { ul: ['查看下一班公交时间','规划 A → B 路线','查看地铁状态','<strong>手机充值 OPUS</strong>（需 NFC）'], pImportant: '<strong>重要：</strong> 手机必须支持 NFC 才能给卡充值。' },
      transit: { p: [
        '<strong>是什么：</strong> 公交/地铁实时信息。',
        ' <strong>优点：</strong> 地图简单，“Go” 按钮提醒何时出发。'
      ]},
      uber: { p: [
        '<strong>是什么：</strong> 叫车到你所在位置。',
        '<strong>是否需要安装帮助？</strong><strong>需要</strong> — 需要支付方式与账号。',
        '<strong>安全：</strong> 出发前会显示司机信息与车牌。'
      ]},
      taxi: { p: [ '<strong>Uber 的替代：</strong> 可现金或刷卡支付。', '<strong>电话：</strong> 514‑725‑9888' ]},
      rbc: { p: ['查询余额、缴费、转账。'], ul: ['设置里可开启大字体','快速余额（无需完整登录）','缴费与 Interac 转账'], ol: ['下载官方 App。','致电银行或到网点开通网银。','用客户卡号和密码登录。','启用 Touch ID / Face ID。','使用后退出登录。'] },
      td: { p: ['功能与 RBC 类似。'] },
      scotia: { p: ['只用官方 App；参考上方通用步骤。'] },
      bmo: { p: ['只用官方 App；参考上方通用步骤。'] },
      cibc: { p: ['只用官方 App；参考上方通用步骤。'] },
      medisafe: { p: ['用药提醒与记录；补药提醒；简易历史。'] },
      pacer: { p: ['记录步数，鼓励日常走路。'] },
      calm: { p: ['助眠声音与冥想引导，帮助放松。'] },
      twn: { p: ['查看本地天气预报。'] },
      cbc: { p: ['加拿大新闻（文字与视频）。'] },
      flipp: { p: ['各大超市每周优惠传单。'] },
      gmaps: { p: ['查找地点并获取路线。'] },
    },
  };

  // Videos section i18n
  const I18N_APPSV = {
    en: {
      h3: 'Installation Help Video Links',
      open: 'Open video search',
      titles: ['How to Install WeChat for Beginners','How to Use Chrono STM App','How to Set Up Online Banking Safely','Duolingo First Lesson Guide'],
    },
    fr: {
      h3: "Vidéos d'aide à l'installation",
      open: 'Ouvrir la recherche vidéo',
      titles: ["Installer WeChat (débutants)", 'Utiliser l’app Chrono STM', 'Configurer la banque en ligne en sécurité', 'Première leçon Duolingo'],
    },
    zh: {
      h3: '安装与使用视频链接',
      open: '打开视频搜索',
      titles: ['新手如何安装微信', '如何使用 Chrono STM 应用', '如何安全开通网上银行', 'Duolingo 入门教程'],
    },
  };

  function appKeyFromName(name){
    const n = (name||'').toLowerCase();
    if(n.includes('youtube')) return 'youtube';
    if(n === 'facebook') return 'facebook';
    if(n.includes('messenger')) return 'messenger';
    if(n.includes('wechat')) return 'wechat';
    if(n.includes('instagram')) return 'instagram';
    if(n.includes('chrono')) return 'chrono';
    if(n.includes('transit') && !n.includes('google')) return 'transit';
    if(n.includes('uber')) return 'uber';
    if(n.includes('taxi')) return 'taxi';
    if(n.includes('rbc')) return 'rbc';
    if(n === 'td canada' || n.startsWith('td')) return 'td';
    if(n.includes('scotia')) return 'scotia';
    if(n.includes('bmo')) return 'bmo';
    if(n.includes('cibc')) return 'cibc';
    if(n.includes('medisafe')) return 'medisafe';
    if(n.includes('pacer')) return 'pacer';
    if(n.includes('calm')) return 'calm';
    if(n.includes('weather network')) return 'twn';
    if(n.includes('cbc')) return 'cbc';
    if(n.includes('flipp')) return 'flipp';
    if(n.includes('google maps')) return 'gmaps';
    return '';
  }

  function setDirectParagraphs(body, arr){
    if(!body||!arr) return;
    const ps = Array.from(body.children).filter(el => el.tagName === 'P');
    arr.forEach((html,i)=>{ if(ps[i]) ps[i].innerHTML = html; });
  }

  function setListItems(listEl, items){
    if(!listEl||!items) return;
    const lis = Array.from(listEl.querySelectorAll('li'));
    lis.forEach((li,i)=>{ if(items[i]) li.innerHTML = items[i]; });
  }

  const els = {
    search: qs('#appSearch'),
    easyOnly: qs('#easyOnly'),
    print: qs('#btnPrintApps'),
    printStarter: qs('#btnPrintStarter'),
    flowBtns: qsa('.flowbtn'),
    cards: qsa('.appcard'),
  };

  function toggleCard(card) {
    const head = qs('.appcard__head', card);
    const body = qs('.appcard__body', card);
    if (!head || !body) return;

    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
    body.toggleAttribute('hidden', open);
  }

  // Simple text-to-speech
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    speechSynthesis.speak(u);
  }

  function cardText(card) {
    const clone = card.cloneNode(true);
    clone.querySelectorAll('button').forEach((b) => b.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // Help message generator
function askForHelp(appName) {
  const msg = TA().helpMsg(appName);

  const sms = `sms:&body=${encodeURIComponent(msg)}`;
  navigator.clipboard?.writeText(msg).catch(() => {});
  window.location.href = sms;
  alert(`Message copied (if possible):\n\n${msg}`);
}

  // Filtering
  function matchesSearch(card, q) {
    if (!q) return true;
    const tags = (card.getAttribute('data-tags') || '').toLowerCase();
    const name = (qs('.appname', card)?.textContent || '').toLowerCase();
    const text = (card.textContent || '').toLowerCase();
    return tags.includes(q) || name.includes(q) || text.includes(q);
  }

  function applyFilters() {
    const q = (els.search.value || '').trim().toLowerCase();
    const easyOnly = els.easyOnly.checked;

    els.cards.forEach((card) => {
      const ease = card.getAttribute('data-ease');
      const okEase = !easyOnly || ease === 'easy';
      const okSearch = matchesSearch(card, q);
      card.toggleAttribute('hidden', !(okEase && okSearch));
    });
  }

  // Flowchart mapping → recommended apps
  const FLOW_MAP = {
    family: ['WeChat', 'Facebook Messenger'],
    photos: ['Facebook', 'Instagram'],
    bus: ['Transit', 'Chrono – STM'],
    french: ['Duolingo', 'Mauril'],
    bank: ['RBC Mobile', 'TD Canada', 'Scotiabank', 'BMO Mobile', 'CIBC Mobile'],
  };

  function jumpToFirstApp(names) {
    for (const name of names) {
      const card = els.cards.find((c) => (qs('.appname', c)?.textContent || '').includes(name));
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // open the card
        const head = qs('.appcard__head', card);
        if (head?.getAttribute('aria-expanded') !== 'true') toggleCard(card);
        break;
      }
    }
  }

function applyAppsLang(){
  const t = TA();
  const x = TX();
  const langCode = (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en');
  const isEN = String(langCode).toLowerCase().startsWith('en');
  // Brand subtitle (only change for non‑EN)
  if (!isEN) {
    const brandSub = qs('.brand__subtitle'); if (brandSub) brandSub.textContent = x.brandSubtitle;
  }
  // Search toolbar
  const findLabel = qs('label[for="appSearch"]'); if(findLabel) findLabel.textContent = t.findLabel;
  const input = qs('#appSearch'); if(input) input.placeholder = t.placeholder;
  const easy = qs('label.toggle'); if(easy) easy.textContent = ''; // reset then rebuild
  if(easy){
    const cb = qs('#easyOnly', easy) || qs('#easyOnly');
    easy.innerHTML = '';
    if(cb){ cb.remove(); cb.checked = cb.checked; easy.appendChild(cb); }
    easy.appendChild(document.createTextNode(' ' + t.easyOnly));
  }
  const printBtn = qs('#btnPrintApps'); if(printBtn) printBtn.textContent = t.printList;
  const flowTitle = qs('.flow__title'); if(flowTitle) flowTitle.textContent = t.flowTitle;
  // flow buttons
  qsa('.flowbtn').forEach((b) => {
    const key = b.getAttribute('data-flow');
    if (t.flow[key]) b.textContent = t.flow[key];
  });

  if (isEN) {
    // Keep original English layout/content; only toolbar/flow/help labels updated above.
    qsa('.helpbtn').forEach(b => b.textContent = t.helpBtn);
    return;
  }

  // Categories (FR/中文 only)
  const cs = x.cats;
  const s = qs('#cat_social'); if (s) { const h=qs('h2', s); if(h) h.textContent=cs.social.h2; const p=qs('.cat__hint', s); if(p) p.textContent=cs.social.hint; }
  const tr = qs('#cat_transport'); if (tr) { const h=qs('h2', tr); if(h) h.textContent=cs.transport.h2; const p=qs('.cat__hint', tr); if(p) p.textContent=cs.transport.hint; }
  const bk = qs('#cat_bank'); if (bk) { const h=qs('h2', bk); if(h) h.textContent=cs.bank.h2; const w=qs('.warn', bk); if(w) w.textContent=cs.bank.warn; }
  const he = qs('#cat_health'); if (he) { const h=qs('h2', he); if(h) h.textContent=cs.health.h2; }
  const lg = qs('#cat_language'); if (lg) { const h=qs('h2', lg); if(h) h.textContent=cs.language.h2; }
  const dl = qs('#cat_daily'); if (dl) { const h=qs('h2', dl); if(h) h.textContent=cs.daily.h2; }

  // Legend
  const legH3 = qs('.legend h3'); if (legH3) legH3.textContent = x.legend.h3;
  const legLis = qsa('.legend ul li'); legLis.forEach((li,i)=>{ if(x.legend.items[i]) li.textContent = x.legend.items[i]; });

  // Starter pack
  const stH3 = qs('.starter h3'); if (stH3) stH3.textContent = x.starter.h3;
  const stBtn = qs('#btnPrintStarter'); if (stBtn) stBtn.textContent = x.starter.print;
  const stLis = qsa('.starter ol li'); stLis.forEach((li,i)=>{ if(x.starter.items[i]) li.innerHTML = `<strong>${x.starter.items[i].split(' — ')[0]}</strong> — ${x.starter.items[i].split(' — ')[1]||''}`; });

  // Help buttons label
  qsa('.helpbtn').forEach(b => b.textContent = t.helpBtn);

  // Translate app card bodies (FR/中文 only)
  const lang = (curLang().startsWith('fr')?'fr':(curLang().startsWith('zh')?'zh':'en'));
  qsa('.appcard').forEach(card => {
    const name = (qs('.appname', card)?.textContent || '').trim();
    const key = appKeyFromName(name);
    const data = (I18N_APPSCARD[lang]||{})[key];
    if(!data) return;
    const body = qs('.appcard__body', card);
    if(!body) return;
    if(data.p) setDirectParagraphs(body, data.p);
    if(data.ul){ const u = qs('ul', body); if(u) setListItems(u, data.ul); }
    if(data.ol){ const o = qs('ol', body); if(o) setListItems(o, data.ol); }
    if(data.pImportant){
      const afterUlP = qsa('p', body).find(p => /Important|重要|Important/i.test(p.textContent));
      if(afterUlP) afterUlP.innerHTML = data.pImportant; else {
        const p = document.createElement('p'); p.innerHTML = data.pImportant; body.appendChild(p);
      }
    }
  });

  // Videos section (FR/中文 only)
  const vv = I18N_APPSV[lang] || I18N_APPSV.en;
  const vsec = qs('.videos');
  if (vsec){
    const vh3 = qs('.videos h3'); if (vh3) vh3.textContent = vv.h3;
    const items = qsa('.videos .videoitem');
    items.forEach((it,i)=>{
      const vt = qs('.vtitle', it); if(vt && vv.titles[i]) vt.textContent = vv.titles[i];
      const a = qs('a.pill', it); if(a) a.textContent = vv.open;
    });
  }
}

function wire() {
  // expand/collapse
    els.cards.forEach((card) => {
      qs('.appcard__head', card)?.addEventListener('click', () => toggleCard(card));

      qs('.helpbtn', card)?.addEventListener('click', (e) => {
        e.stopPropagation();
        askForHelp(e.currentTarget.getAttribute('data-app'));
      });

      qs('.listen-btn', card)?.addEventListener('click', (e) => {
        e.stopPropagation();
        speak(cardText(card));
      });
    });

    els.search.addEventListener('input', applyFilters);
    els.easyOnly.addEventListener('change', applyFilters);

    els.flowBtns.forEach((b) =>
      b.addEventListener('click', () => {
        const key = b.getAttribute('data-flow');
        // auto-set easy-only for banking safety (keep off) - user can toggle manually
        jumpToFirstApp(FLOW_MAP[key] || []);
      })
    );

    els.print.addEventListener('click', () => window.print());
    els.printStarter.addEventListener('click', () => window.print());

    // Language selector: placeholder (only updates aria state)
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => {
        qsa('.lang__btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  }

wire();
applyFilters();
applyAppsLang();
window.addEventListener('aide:langChanged', applyAppsLang);

// Completion panel
window.AideProgress?.attachCompletionPanel?.({ skillId: 'useful' });
})();
