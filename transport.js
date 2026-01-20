/* transport.js — Finding Transport in Montreal
   Features:
   - Collapsible sections + progress tracker
   - Interactive metro map (tap station → info)
   - Save home station + favorite stations
   - French pronunciation buttons (speech synthesis)
   - Practice trip planner (simple metro routing) + saved trips (localStorage)
   - Mini quizzes + what-if scenarios
   - Print
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // i18n labels for progress and key buttons
  const I18N_TR = {
    en: {
      steps: {
        1: 'Step 1/5: Overview',
        2: 'Step 2/5: Metro & Tickets',
        3: 'Step 3/5: Apps & Alternatives',
        4: 'Step 4/5: Safety',
        5: 'Step 5/5: Practice & Accessibility',
      },
      btns: { emergency: 'Emergency Info', print: 'Print This Guide', plan: 'Plan my trip', saveTrip: 'Save this trip', savedTrips: 'My Saved Trips' },
      station: { tap: 'Tap a station', tip: 'Tip: Transfers: Berri-UQAM and Lionel-Groulx.' },
      alerts: { savedHome: 'Saved home station: ', savedFav: 'Saved favorite: ', noRoute: 'Sorry—no route found in the simplified map. Try a different station.', noTrips: 'No saved trips yet.' },
      ttsLang: 'en-US',
    },
    fr: {
      steps: {
        1: 'Étape 1/5 : Aperçu',
        2: 'Étape 2/5 : Métro & titres',
        3: 'Étape 3/5 : Applications & alternatives',
        4: 'Étape 4/5 : Sécurité',
        5: 'Étape 5/5 : Pratique & accessibilité',
      },
      btns: { emergency: 'Infos d’urgence', print: 'Imprimer le guide', plan: 'Planifier mon trajet', saveTrip: 'Enregistrer ce trajet', savedTrips: 'Mes trajets enregistrés' },
      station: { tap: 'Touchez une station', tip: 'Astuce : correspondances Berri‑UQAM et Lionel‑Groulx.' },
      alerts: { savedHome: 'Station domicile enregistrée : ', savedFav: 'Favori enregistré : ', noRoute: 'Désolé — aucun trajet trouvé sur la carte simplifiée. Essayez une autre station.', noTrips: 'Aucun trajet enregistré.' },
      ttsLang: 'fr-CA',
    },
    zh: {
      steps: {
        1: '第 1/5 步：概览',
        2: '第 2/5 步：地铁与车票',
        3: '第 3/5 步：应用与替代方式',
        4: '第 4/5 步：安全',
        5: '第 5/5 步：练习与无障碍',
      },
      btns: { emergency: '紧急信息', print: '打印本指南', plan: '规划路线', saveTrip: '保存此路线', savedTrips: '我的已保存路线' },
      station: { tap: '点选一个站点', tip: '提示：换乘站如 Berri‑UQAM 和 Lionel‑Groulx。' },
      alerts: { savedHome: '已保存家附近车站：', savedFav: '已保存收藏：', noRoute: '抱歉——在简化地图上未找到路线。请尝试其他车站。', noTrips: '还没有保存的路线。' },
      ttsLang: 'zh-CN',
    },
  };
  function curLang(){ return (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en'); }
  function TT(){ return I18N_TR[curLang()] || I18N_TR.en; }

  // Content translations (section titles and key bodies)
  const I18N_TRX = {
    en: {
      brandSubtitle: 'Finding Transport in Montreal',
      pageTitle: 'Getting Around Montreal Safely',
      pageSubtitle: 'Step-by-step help for STM metro, bus, and safe alternatives.',
      parts: {
        1: 'Part 1: Understanding Montreal Transport',
        2: 'Part 2: Paying for Your Ride (OPUS & Tickets)',
        3: 'Part 3: Using the Metro (Step-by-Step)',
        4: 'Part 4: Using the Bus (Step-by-Step)',
        5: 'Part 5: Transport Apps (Chrono, Transit, Google Maps)',
        6: 'Part 6: Taxis & Alternatives',
        7: 'Part 7: Safety & Troubleshooting (What if…)',
        8: 'Part 8: Practice Exercises & Planning',
        9: 'Part 9: Accessibility Features',
        10: 'Part 10: Cultural Tips for Chinese Seniors',
      },
      p1: {
        ocTitles: ['Metro (Subway)', 'Bus', 'Taxi & Ride Services', 'Walking & Community Shuttles'],
        ocDetails: ['Fast, underground, 4 color-coded lines.', 'Above ground, many stops, goes everywhere.', 'Door-to-door, more expensive.', 'Short distances. Some boroughs have shuttles.'],
        mapTitle: 'Montreal Metro Map (Simplified)',
        btnHelp: 'How to use this map',
        btnReset: 'Reset',
        mapDetail: 'Tap a station to see info. Colors match STM line colors.',
        saveHome: 'Set this as “Home station”',
        saveFav: 'Save as favorite',
        warn: 'Prices and schedules can change. This guide is for learning. Always check official STM info.',
      },
      p2: {
        h2: 'Paying for Your Ride',
        opt1: 'Option 1: OPUS Card (Recommended)',
        opt1Detail: 'A rechargeable plastic card (like a credit card).',
        steps: ['Go to any <strong>metro station ticket booth</strong>.', 'Say: <strong>“Je voudrais une carte OPUS, s\'il vous plaît.”</strong>', 'Show proof of age for senior discount (health card, driver’s license).', 'Pay: OPUS card fee (often ~$6), then add fares/passes.'],
        tipCn: 'Chinese tip: 在售票处可以说：“您好，我想要一张老年人 OPUS 卡。”',
        opt2: 'Option 2: Single Tickets & Passes (examples)',
        fares: ['<strong>Single ticket:</strong> $3.50 (transfer within ~2 hours)', '<strong>Day pass:</strong> $11', '<strong>Weekly pass:</strong> $28.75'],
        warn: 'Senior discounts (65+) are available. Bring ID and ask at the booth.',
      },
      p3: {
        h2: 'Your First Metro Ride',
        steps: [
          '<strong>Enter the station</strong><br/>Look for STM logo. Tap OPUS on the reader → wait for green light + beep.',
          '<strong>Find your train</strong><br/>Follow the line color + direction (final station name).',
          '<strong>Board safely</strong><br/>Stand behind yellow line. Let people exit first. Hold a pole/handrail.',
          '<strong>Know when to get off</strong><br/>Watch display, listen to announcements.',
          '<strong>Transfers & exits</strong><br/>Follow color-coded signs. Look for “Sortie” (Exit).',
        ],
        safe: 'Safety tips: Don’t run for trains. Hold handrails. Keep belongings close. Ask STM staff if lost.',
      },
      p4: {
        h2: 'Taking the Bus in Montreal',
        steps: ['<strong>Find your bus stop:</strong> blue/white sign, check bus number and destination.', '<strong>Hail the bus:</strong> raise your hand as it approaches.', '<strong>Pay:</strong> tap OPUS or insert exact change. Ask for transfer: “Un transfert, s\'il vous plaît.”', '<strong>During ride:</strong> press stop button or pull yellow cord (Arrêt demandé).', '<strong>Exit safely:</strong> use handrails, watch the step down.'],
        seniorsH3: 'Special services for seniors',
        seniors: ['<strong>Adapted Transit (ST):</strong> door-to-door for eligible users (registration required).', '<strong>Some borough shuttles</strong> exist (availability varies).'],
      },
      p5: {
        chrono: 'Chrono (STM official)', chronoList: ['Next departures', 'Trip planner', 'Reload OPUS (NFC needed)'],
        transit: 'Transit (simpler)', transitList: ['Real-time buses on map', '“Go” button tells when to leave'],
        gmaps: 'Google Maps', gmapsDetail: 'Good for walking directions and general navigation.',
        appWarn: 'App safety: charge your phone, keep a paper backup, and stop walking before checking your phone.',
        bottom: { apps: 'Useful Apps', language: 'Language Learning', bank: 'Online Banking' },
      },
      p7: {
        emergencyH3: 'Emergency Numbers',
        emergencyItems: ['<strong>Police/Ambulance/Fire:</strong> 911', '<strong>STM Security:</strong> 514-280-4637', '<strong>Lost & Found:</strong> 514-280-4638', '<strong>OPUS customer service:</strong> 514-786-4636'],
      },
      p8: {
        h2: 'Interactive Practice: Plan Your Trip',
        from: 'From (your nearest station)',
        to: 'To',
        optMGH: 'Montreal General Hospital (1650 Cedar Ave)',
        optChinatown: 'Chinatown (Place-d\'Armes)',
        savedTrips: 'My Saved Trips',
      },
      p9: {
        metro: 'Metro accessibility', metroList: ['Only certain stations have elevators (marked on official maps).', 'Priority seating available.', 'Some entrances have ramps.'],
        bus: 'Bus accessibility', busList: ['Buses “kneel” (lower to curb).', 'Priority seating at front.', 'Spaces for wheelchairs/walkers.'],
        st: 'ST (Adapted Transit)', stList: ['Door-to-door for eligible seniors', 'Book 1–7 days in advance (shared rides)', '<strong>Phone:</strong> 514-280-5347'],
      },
      p10: {
        h3a: 'Chinese-specific advice', listA: ['Best times: avoid rush hour (7–9am, 4–6pm) if possible.', 'Groceries: use a wheeled cart; take taxi if heavy.', 'Carry cards with destinations written in French and Chinese.'],
        h3b: 'Montreal etiquette', listB: ['Let people exit before entering.', 'Offer seat to those more in need.', 'Keep voice moderate.', 'Say “Merci” to the bus driver.'],
      },
    },
    fr: {
      brandSubtitle: 'Se déplacer à Montréal',
      pageTitle: 'Se déplacer à Montréal en sécurité',
      pageSubtitle: 'Aide pas à pas pour le métro STM, le bus et les alternatives sûres.',
      parts: {
        1: 'Partie 1 : Comprendre les transports à Montréal',
        2: 'Partie 2 : Payer votre trajet (OPUS & titres)',
        3: 'Partie 3 : Utiliser le métro (étapes)',
        4: 'Partie 4 : Utiliser le bus (étapes)',
        5: 'Partie 5 : Applications (Chrono, Transit, Google Maps)',
        6: 'Partie 6 : Taxis & alternatives',
        7: 'Partie 7 : Sécurité & dépannage (Que faire si…)',
        8: 'Partie 8 : Exercices & planification',
        9: 'Partie 9 : Accessibilité',
        10: 'Partie 10 : Conseils culturels pour aînés chinois',
      },
      p1: {
        ocTitles: ['Métro', 'Bus', 'Taxi & services', 'Marche & navettes'],
        ocDetails: ['Rapide, souterrain, 4 lignes par couleur.', 'En surface, nombreux arrêts, va partout.', 'Porte à porte, plus cher.', 'Courtes distances. Navettes dans certains arrondissements.'],
        mapTitle: 'Carte du métro de Montréal (simplifiée)',
        btnHelp: 'Comment utiliser la carte',
        btnReset: 'Réinitialiser',
        mapDetail: 'Touchez une station pour voir les infos. Les couleurs suivent celles de la STM.',
        saveHome: 'Définir comme « Station domicile »',
        saveFav: 'Enregistrer comme favori',
        warn: 'Les tarifs et horaires peuvent changer. Guide d’apprentissage : vérifiez l’info officielle STM.',
      },
      p2: {
        h2: 'Payer votre trajet',
        opt1: 'Option 1 : Carte OPUS (recommandé)',
        opt1Detail: 'Carte rechargeable (format carte bancaire).',
        steps: ['Allez au <strong>guichet d’une station de métro</strong>.', 'Dites : <strong>« Je voudrais une carte OPUS, s\'il vous plaît. »</strong>', 'Pièce d’identité pour rabais aîné (carte d’assurance-maladie, permis).', 'Payez : frais OPUS (~6 $), puis ajoutez des titres.'],
        tipCn: 'Astuce en chinois : 在售票处可以说：“您好，我想要一张老年人 OPUS 卡。”',
        opt2: 'Option 2 : Billets & titres (exemples)',
        fares: ['<strong>Billet unitaire :</strong> 3,50 $ (correspondances ~2 h)', '<strong>Carte jour :</strong> 11 $', '<strong>Hebdo :</strong> 28,75 $'],
        warn: 'Rabais aînés (65+) disponibles. Apportez une pièce d’identité et demandez au guichet.',
      },
      p3: {
        h2: 'Votre premier trajet en métro',
        steps: [
          '<strong>Entrer dans la station</strong><br/>Logo STM. Passez OPUS au lecteur → voyant vert + bip.',
          '<strong>Trouver votre train</strong><br/>Suivez la couleur + direction (nom du terminus).',
          '<strong>Monter en sécurité</strong><br/>Derrière la ligne jaune. Laissez sortir d’abord. Tenez une barre.',
          '<strong>Quand descendre</strong><br/>Regardez l’affichage, écoutez les annonces.',
          '<strong>Correspondances & sorties</strong><br/>Suivez les couleurs. Cherchez « Sortie ».',
        ],
        safe: 'Sécurité : ne courez pas, tenez les rampes, gardez vos effets près de vous. Demandez à la STM si perdu.',
      },
      p4: {
        h2: 'Prendre le bus à Montréal',
        steps: ['<strong>Trouvez votre arrêt :</strong> panneau bleu/blanc, vérifiez le numéro/destination.', '<strong>Faites signe :</strong> levez la main.', '<strong>Payer :</strong> OPUS ou monnaie exacte. Demandez un transfert : « Un transfert, s\'il vous plaît. »', '<strong>À bord :</strong> bouton d’arrêt ou corde jaune (« Arrêt demandé »).', '<strong>Descendre :</strong> tenez la rampe, attention à la marche.'],
        seniorsH3: 'Services pour aînés',
        seniors: ['<strong>Transport adapté (ST) :</strong> porte à porte (inscription requise).', 'Certaines <strong>navettes d’arrondissement</strong> existent (selon disponibilité).'],
      },
      p5: {
        chrono: 'Chrono (officiel STM)', chronoList: ['Prochains départs', 'Planificateur de trajets', 'Recharger OPUS (NFC)'],
        transit: 'Transit (plus simple)', transitList: ['Bus en temps réel sur la carte', 'Bouton « Go » indique quand partir'],
        gmaps: 'Google Maps', gmapsDetail: 'Bon pour la marche et la navigation générale.',
        appWarn: 'Sécurité : chargez votre téléphone, gardez un secours papier, arrêtez‑vous avant de consulter.',
        bottom: { apps: 'Applications utiles', language: 'Apprentissage des langues', bank: 'Banque en ligne' },
      },
      p7: {
        emergencyH3: 'Numéros d’urgence',
        emergencyItems: ['<strong>Police/Ambulance/Pompiers :</strong> 911', '<strong>Sécurité STM :</strong> 514‑280‑4637', '<strong>Objets trouvés :</strong> 514‑280‑4638', '<strong>Service OPUS :</strong> 514‑786‑4636'],
      },
      p8: {
        h2: 'Pratique interactive : planifiez votre trajet',
        from: 'De (votre station la plus proche)',
        to: 'À',
        optMGH: 'Hôpital général de Montréal (1650, av. Cedar)',
        optChinatown: 'Quartier chinois (Place‑d\'Armes)',
        savedTrips: 'Mes trajets enregistrés',
      },
      p9: {
        metro: 'Accessibilité métro', metroList: ['Certaines stations ont des ascenseurs (voir carte officielle).', 'Sièges prioritaires.', 'Certaines entrées ont des rampes.'],
        bus: 'Accessibilité bus', busList: ['Bus « s\'agenouillent » (bordure).', 'Sièges prioritaires à l’avant.', 'Espaces pour fauteuils/déambulateurs.'],
        st: 'ST (transport adapté)', stList: ['Porte à porte pour aînés admissibles', 'Réserver 1–7 jours d’avance (trajets partagés)', '<strong>Tél. :</strong> 514‑280‑5347'],
      },
      p10: {
        h3a: 'Conseils spécifiques (communauté chinoise)', listA: ['Évitez les heures de pointe (7–9 h, 16–18 h) si possible.', 'Courses : chariot à roulettes ; taxi si lourd.', 'Cartes avec adresses en français et chinois.'],
        h3b: 'Étiquette à Montréal', listB: ['Laissez sortir avant d’entrer.', 'Cédez sa place aux plus vulnérables.', 'Parlez à voix modérée.', 'Dites « Merci » au chauffeur.'],
      },
    },
    zh: {
      brandSubtitle: '蒙特利尔交通指南',
      pageTitle: '安全出行蒙特利尔',
      pageSubtitle: '分步讲解：STM 地铁、公交及安全替代方式。',
      parts: {
        1: '第 1 部分：认识蒙特利尔交通',
        2: '第 2 部分：支付车费（OPUS 与车票）',
        3: '第 3 部分：乘坐地铁（步骤）',
        4: '第 4 部分：乘坐公交（步骤）',
        5: '第 5 部分：交通应用（Chrono、Transit、谷歌地图）',
        6: '第 6 部分：出租车与其他方式',
        7: '第 7 部分：安全与排障（万一…）',
        8: '第 8 部分：练习与规划',
        9: '第 9 部分：无障碍设施',
        10: '第 10 部分：华人长者贴士',
      },
      p1: {
        ocTitles: ['地铁', '公交', '出租车/打车服务', '步行与社区接驳'],
        ocDetails: ['速度快，地下运行，四条彩色线路。', '地面线路多、站点密集，几乎到处都到。', '门到门，更贵。', '短距离。一些区有社区班车。'],
        mapTitle: '蒙特利尔地铁图（简化）',
        btnHelp: '如何使用这张地图',
        btnReset: '重置',
        mapDetail: '点选站点查看信息。颜色与 STM 线路一致。',
        saveHome: '设为“家附近车站”',
        saveFav: '加入收藏',
        warn: '票价与时刻可能变化。本指南用于学习，请以 STM 官方信息为准。',
      },
      p2: {
        h2: '如何支付车费',
        opt1: '选项一：OPUS 卡（推荐）',
        opt1Detail: '可充值的塑料卡（类似信用卡）。',
        steps: ['到<strong>任意地铁站售票窗口</strong>。', '可以说：<strong>“Je voudrais une carte OPUS, s\'il vous plaît.”</strong>', '如需老年优惠，请出示证件（医保卡／驾照）。', '支付 OPUS 卡费（约 $6），再充值车票或通票。'],
        tipCn: '中文提示：在售票处说“您好，我想要一张老年人 OPUS 卡”。',
        opt2: '选项二：单次票与通票（示例）',
        fares: ['<strong>单次票：</strong> $3.50（约 2 小时内可换乘）', '<strong>一日票：</strong> $11', '<strong>周票：</strong> $28.75'],
        warn: '65 岁以上可享优惠。带上证件并在窗口询问。',
      },
      p3: {
        h2: '第一次乘坐地铁',
        steps: [
          '<strong>进入车站</strong><br/>找到 STM 标志。OPUS 贴读卡器 → 等绿灯与提示音。',
          '<strong>找到列车</strong><br/>按线路颜色与方向（终点站名）。',
          '<strong>安全上车</strong><br/>站在黄线后；先让他人下车；握住扶杆。',
          '<strong>何时下车</strong><br/>看车内屏幕，听广播提醒。',
          '<strong>换乘与出站</strong><br/>跟随彩色指示牌。寻找“Sortie”（出口）。',
        ],
        safe: '安全提示：不要奔跑；抓牢扶手；保管好随身物；迷路就问 STM 工作人员。',
      },
      p4: {
        h2: '在蒙特利尔乘公交',
        steps: ['<strong>找到车站：</strong> 蓝白路牌，确认线路与方向。', '<strong>示意停车：</strong> 车辆靠近时举手示意。', '<strong>付费：</strong> 刷 OPUS 或投币。可说“Un transfert, s\'il vous plaît.”索要换乘票。', '<strong>车上：</strong> 到站前按下车按钮或拉黄色拉绳（Arrêt demandé）。', '<strong>安全下车：</strong> 扶好把手，小心台阶。'],
        seniorsH3: '老年人服务',
        seniors: ['<strong>交通适应服务（ST）：</strong> 适用于符合条件者（需登记），门到门。', '部分区有<strong>社区接驳车</strong>（依地区而定）。'],
      },
      p5: {
        chrono: 'Chrono（STM 官方）', chronoList: ['下一班发车', '路线规划', 'OPUS 充值（需 NFC）'],
        transit: 'Transit（更简单）', transitList: ['地图上实时公交', '“Go” 按钮提醒出发时间'],
        gmaps: '谷歌地图', gmapsDetail: '适合步行路线与综合导航。',
        appWarn: '应用安全：保持电量、准备纸质备份，行走时不要看手机。',
        bottom: { apps: '常用应用', language: '语言学习', bank: '网上银行' },
      },
      p7: {
        emergencyH3: '紧急电话',
        emergencyItems: ['<strong>警察/救护/消防：</strong> 911', '<strong>STM 安保：</strong> 514‑280‑4637', '<strong>失物招领：</strong> 514‑280‑4638', '<strong>OPUS 客服：</strong> 514‑786‑4636'],
      },
      p8: {
        h2: '互动练习：规划你的行程',
        from: '出发（离你最近的车站）',
        to: '前往',
        optMGH: '蒙特利尔综合医院（1650 Cedar Ave）',
        optChinatown: '唐人街（Place‑d\'Armes）',
        savedTrips: '我的已保存路线',
      },
      p9: {
        metro: '地铁无障碍', metroList: ['只有部分车站有电梯（见官方地图）。', '设有优先座。', '部分入口有坡道。'],
        bus: '公交无障碍', busList: ['公交可“下跪”（降低车身）。', '前排有优先座。', '留有轮椅/助行器空间。'],
        st: 'ST（适应交通）', stList: ['符合条件的长者可申请', '需提前 1–7 天预约（合乘）', '<strong>电话：</strong> 514‑280‑5347'],
      },
      p10: {
        h3a: '华人长者提示', listA: ['尽量避开早晚高峰（7–9 点，16–18 点）。', '买菜可用拉杆车；较重建议打车。', '随身带上写有法语和中文地址的小卡片。'],
        h3b: '蒙特利尔礼仪', listB: ['先下后上。', '把座位让给更需要的人。', '轻声交谈。', '上车下车向司机说“Merci”。'],
      },
    },
  };
  function TX(){ const l = curLang(); return I18N_TRX[l] || I18N_TRX.en; }

  const STORAGE = {
    homeStation: 'mtl_home_station',
    favStations: 'mtl_fav_stations',
    savedTrips: 'mtl_saved_trips',
  };

  const els = {
    progress: qs('#progress'),
    btnEmergency: qs('#btnEmergency'),
    btnPrint: qs('#btnPrint'),
    stationTitle: qs('#stationTitle'),
    stationBody: qs('#stationBody'),
    btnSaveHome: qs('#btnSaveHome'),
    btnSaveFav: qs('#btnSaveFav'),
    btnResetMap: qs('#btnResetMap'),
    btnMapHelp: qs('#btnMapHelp'),
    // planner
    fromStation: qs('#fromStation'),
    toPlace: qs('#toPlace'),
    btnPlan: qs('#btnPlan'),
    btnSaveTrip: qs('#btnSaveTrip'),
    btnSavedTrips: qs('#btnSavedTrips'),
    planOut: qs('#planOut'),
    // quizzes
    whatIf: qs('#whatIf'),
    signQuiz: qs('#signQuiz'),
    emergencyBox: qs('#emergencyBox'),
  };

  // --- Speech (French) ---
function speak(text, langHint = null, rate = 0.85) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  const hint = langHint || TT().ttsLang.split('-')[0];
  const v = window.speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith(hint));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

  // --- Collapsible sections + progress ---
function toggleSection(section) {
  const head = qs('[data-toggle]', section);
  const body = qs('[data-body]', section);
  if (!head || !body) return;
  const open = head.getAttribute('aria-expanded') === 'true';
  head.setAttribute('aria-expanded', String(!open));
  qs('.section__chev', head).textContent = open ? '▸' : '▾';
  body.toggleAttribute('hidden', open);

  const step = Number(head.getAttribute('data-step') || '1');
  els.progress.textContent = (TT().steps[step]) || TT().steps[1];
}

  function wireSections() {
    qsa('[data-toggle]').forEach((h) => h.addEventListener('click', () => toggleSection(h.closest('.section'))));
  }

  // --- Interactive map ---
  const STATION_INFO = {
    'Angrignon': {
      lines: ['Green'],
      nearby: ['Large park + terminus area (southwest)'],
    },
    'Honoré-Beaugrand': {
      lines: ['Green'],
      nearby: ['East-end terminus'],
    },
    'Côte-Vertu': {
      lines: ['Orange'],
      nearby: ['West-end terminus'],
    },
    'Montmorency': {
      lines: ['Orange'],
      nearby: ['Laval terminus'],
    },
    'Snowdon': {
      lines: ['Orange', 'Blue'],
      nearby: ['Transfer station (Orange ↔ Blue)'],
    },
    'Lionel-Groulx': {
      lines: ['Green', 'Orange'],
      nearby: ['Major transfer (Green ↔ Orange)'],
    },
    'Guy-Concordia': {
      lines: ['Green'],
      nearby: ['Downtown. Often useful for clinics and connections'],
    },
    "Place-d'Armes": {
      lines: ['Orange'],
      nearby: ['Chinatown (Quartier chinois)', 'Old Montreal'],
      chineseTip: '唐人街 / 唐人街地铁站附近: Place-d’Armes',
    },
    'Berri-UQAM': {
      lines: ['Green', 'Orange', 'Yellow'],
      nearby: ['Main transfer hub (3 lines)'],
    },
    'Saint-Michel': {
      lines: ['Blue'],
      nearby: ['Blue line east terminus'],
    },
    'Longueuil': {
      lines: ['Yellow'],
      nearby: ['South Shore terminus'],
    },
  };

  const STATION_LIST = Object.keys(STATION_INFO);

  let selectedStation = '';

function setStation(name) {
  selectedStation = name;
  qsa('.station').forEach((g) => g.classList.toggle('selected', g.getAttribute('data-station') === name));

  const info = STATION_INFO[name];
  if (!info) {
    els.stationTitle.textContent = TT().station.tap;
    els.stationBody.textContent = TT().station.tip;
    return;
  }

  els.stationTitle.textContent = name;

  const parts = [];
  parts.push(`Lines: ${info.lines.join(', ')}`);
  if (info.nearby?.length) parts.push('Nearby: ' + info.nearby.join(' • '));
  if (info.chineseTip) parts.push('中文: ' + info.chineseTip);

  els.stationBody.textContent = parts.join('\n');
}

  function saveHomeStation() {
    if (!selectedStation) return;
localStorage.setItem(STORAGE.homeStation, selectedStation);
alert(TT().alerts.savedHome + selectedStation);
renderPlannerStations();
  }

  function saveFavoriteStation() {
    if (!selectedStation) return;
    const fav = JSON.parse(localStorage.getItem(STORAGE.favStations) || '[]');
    if (!fav.includes(selectedStation)) fav.push(selectedStation);
    localStorage.setItem(STORAGE.favStations, JSON.stringify(fav));
alert(TT().alerts.savedFav + selectedStation);
  }

  function wireMap() {
    qsa('.station').forEach((s) => s.addEventListener('click', () => setStation(s.getAttribute('data-station'))));
    els.btnSaveHome?.addEventListener('click', saveHomeStation);
    els.btnSaveFav?.addEventListener('click', saveFavoriteStation);
    els.btnResetMap?.addEventListener('click', () => setStation(''));
    els.btnMapHelp?.addEventListener('click', () => {
      alert('How to use: tap a station circle to see info. Transfer stations help you change lines. Save your home station to plan trips faster.');
    });

    setStation('');
  }

  // --- Metro routing (simple BFS over this simplified map graph) ---
  // Graph edges: station -> [neighbors]
  const G = {
    'Angrignon': ['Lionel-Groulx'],
    'Lionel-Groulx': ['Angrignon', 'Guy-Concordia', 'Côte-Vertu'],
    'Guy-Concordia': ['Lionel-Groulx', 'Berri-UQAM'],
    'Berri-UQAM': ['Guy-Concordia', 'Honoré-Beaugrand', "Place-d'Armes", 'Longueuil', 'Montmorency', 'Saint-Michel'],
    'Honoré-Beaugrand': ['Berri-UQAM'],
    "Place-d'Armes": ['Berri-UQAM'],
    'Côte-Vertu': ['Lionel-Groulx'],
    'Montmorency': ['Berri-UQAM'],
    'Snowdon': ['Saint-Michel', 'Montmorency'],
    'Saint-Michel': ['Snowdon', 'Berri-UQAM'],
    'Longueuil': ['Berri-UQAM'],
  };

  // Lines membership
  const LINE = {
    green: ['Angrignon', 'Lionel-Groulx', 'Guy-Concordia', 'Berri-UQAM', 'Honoré-Beaugrand'],
    orange: ['Côte-Vertu', 'Lionel-Groulx', 'Berri-UQAM', "Place-d'Armes", 'Montmorency', 'Snowdon'],
    blue: ['Snowdon', 'Berri-UQAM', 'Saint-Michel'],
    yellow: ['Berri-UQAM', 'Longueuil'],
  };

  function lineBetween(a, b) {
    const pairs = [
      ['green', 'Green'],
      ['orange', 'Orange'],
      ['blue', 'Blue'],
      ['yellow', 'Yellow'],
    ];
    for (const [k, label] of pairs) {
      const arr = LINE[k];
      if (arr.includes(a) && arr.includes(b)) return label;
    }
    return 'Transfer';
  }

  function bfs(from, to) {
    if (from === to) return [from];
    const q = [from];
    const prev = new Map();
    prev.set(from, null);

    while (q.length) {
      const x = q.shift();
      for (const n of (G[x] || [])) {
        if (prev.has(n)) continue;
        prev.set(n, x);
        if (n === to) {
          const path = [];
          let cur = to;
          while (cur) {
            path.push(cur);
            cur = prev.get(cur);
          }
          return path.reverse();
        }
        q.push(n);
      }
    }
    return [];
  }

  function renderPlannerStations() {
    if (!els.fromStation) return;
    els.fromStation.innerHTML = '';

    const home = localStorage.getItem(STORAGE.homeStation) || '';

    const add = (name, label) => {
      const o = document.createElement('option');
      o.value = name;
      o.textContent = label;
      els.fromStation.appendChild(o);
    };

    if (home) add(home, `🏠 Home station: ${home}`);

    STATION_LIST.forEach((s) => {
      if (s === home) return;
      add(s, s);
    });
  }

  function planTrip() {
    const from = els.fromStation.value;
    const place = els.toPlace.value;

    // Destinations map
    const dest =
      place === 'CHINATOWN'
        ? "Place-d'Armes"
        : 'Guy-Concordia';

    const path = bfs(from, dest);
if (!path.length) {
  els.planOut.textContent = TT().alerts.noRoute;
  return;
}

    const steps = [];
    steps.push(`1) Start at: ${from}`);
    steps.push(`2) Destination station: ${dest}`);

    // Build line-by-line directions
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const l = lineBetween(a, b);
      if (l === 'Transfer') continue;
      steps.push(`• Take the ${l} Line: ${a} → ${b}`);
    }

    if (place === 'MGH') {
      steps.push('3) From the station, use walking/bus/taxi to reach Montreal General Hospital (1650 Cedar Ave).');
      steps.push('   Tip: Use Transit/Chrono/Google Maps for the final bus/walk step.');
    } else {
      steps.push('3) Walk to Chinatown from Place-d’Armes.');
    }

    steps.push('Safety: don’t run, hold rails, and keep your OPUS card safe.');

    els.planOut.textContent = steps.join('\n');
  }

  function saveTrip() {
    const from = els.fromStation.value;
    const place = els.toPlace.value;
    const trips = JSON.parse(localStorage.getItem(STORAGE.savedTrips) || '[]');
    const entry = { from, place, ts: Date.now() };
    trips.unshift(entry);
    localStorage.setItem(STORAGE.savedTrips, JSON.stringify(trips.slice(0, 10)));
    alert('Saved trip.');
  }

  function showSavedTrips() {
    const trips = JSON.parse(localStorage.getItem(STORAGE.savedTrips) || '[]');
if (!trips.length) {
  alert(TT().alerts.noTrips);
  return;
}
    const lines = trips.map((t) => {
      const to = t.place === 'CHINATOWN' ? 'Chinatown (Place-d’Armes)' : 'Montreal General Hospital';
      return `• ${t.from} → ${to}`;
    });
    alert(lines.join('\n'));
  }

  // --- What-if scenarios ---
  const WHAT_IF = [
    {
      q: 'If you get on the wrong bus/metro…',
      a: [
        '1) Stay calm.',
        '2) Get off at the next stop.',
        '3) Find an STM employee or information booth.',
        '4) Ask: “Je me suis trompé. Comment aller à…?”',
      ],
      sayFr: 'Je me suis trompé. Comment aller à',
    },
    {
      q: 'If you lose your OPUS card…',
      a: [
        '1) Call OPUS customer service: 514-786-4636',
        '2) If registered, they may transfer balance to a new card.',
        'Tip: Take a photo of your OPUS card number when you get it.',
      ],
    },
    {
      q: 'If you feel unwell during travel…',
      a: [
        '1) Get off at the next stop.',
        '2) Sit on a bench.',
        '3) Ask someone for help.',
        '4) Metro stations have emergency phones.',
      ],
    },
  ];

  function renderWhatIf() {
    if (!els.whatIf) return;
    els.whatIf.innerHTML = '';

    WHAT_IF.forEach((w) => {
      const box = document.createElement('div');
      box.className = 'whatif-item';
      box.innerHTML = `<div class="whatif-q">${w.q}</div><div class="detail">${w.a.join('<br/>')}</div>`;
      if (w.sayFr) {
        const b = document.createElement('button');
        b.className = 'pill small';
        b.type = 'button';
        b.textContent = '🔊 French phrase';
        b.addEventListener('click', () => speak(w.sayFr, 'fr', 0.82));
        box.appendChild(b);
      }
      els.whatIf.appendChild(box);
    });
  }

  // --- Metro sign quiz ---
  const SIGN_QUIZ = [
    {
      prompt: 'You see an orange sign that says: “Direction Côte-Vertu”. What line is it?',
      opts: ['Green', 'Orange', 'Blue', 'Yellow'],
      ans: 1,
    },
    {
      prompt: 'Which word means “Exit” in the metro?',
      opts: ['Sortie', 'Arrêt demandé', 'Transfert', 'Merci'],
      ans: 0,
    },
    {
      prompt: 'On the bus, what does “Arrêt demandé” mean?',
      opts: ['Stop requested', 'Ticket booth', 'Bus is full', 'Emergency'],
      ans: 0,
    },
  ];

  function renderSignQuiz() {
    if (!els.signQuiz) return;
    els.signQuiz.innerHTML = '';

    const correctFlags = Array.from({ length: SIGN_QUIZ.length }).map(() => false);

    SIGN_QUIZ.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'qcard';
      card.innerHTML = `<div class="label">${q.prompt}</div>`;
      const opts = document.createElement('div');
      opts.className = 'qopts';

      q.opts.forEach((t, i) => {
        const b = document.createElement('button');
        b.className = 'pill';
        b.type = 'button';
        b.textContent = t;
        b.addEventListener('click', () => {
          const fb = qs('.qfb', card);
          if (i === q.ans) {
            fb.textContent = '✅ Correct!';
            fb.style.color = 'var(--accent-strong)';
            correctFlags[idx] = true;

            if (correctFlags.every(Boolean)) {
              // counts toward the Safety First badge
              window.AideProgress?.markSafetyQuizComplete?.('transport_sign');
              window.AideProgress?.celebrate?.();
            }
          } else {
            fb.textContent = '❌ Try again.';
            fb.style.color = '#b00020';
          }
        });
        opts.appendChild(b);
      });

      const fb = document.createElement('div');
      fb.className = 'qfb';
      fb.setAttribute('aria-live', 'polite');

      card.appendChild(opts);
      card.appendChild(fb);
      els.signQuiz.appendChild(card);
    });
  }

  // --- Misc wiring ---
  function wireFrenchAudioButtons() {
    qsa('[data-say-fr]').forEach((b) => {
      b.addEventListener('click', () => {
        const txt = b.getAttribute('data-say-fr');
        speak(txt, 'fr', 0.82);
      });
    });
  }

  function wirePlanner() {
    renderPlannerStations();
    els.btnPlan?.addEventListener('click', planTrip);
    els.btnSaveTrip?.addEventListener('click', saveTrip);
    els.btnSavedTrips?.addEventListener('click', showSavedTrips);
  }

function applyTransportLang(){
  const t = TT();
  const lang = (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en');
  if (String(lang).toLowerCase().startsWith('en')) {
    // Keep original English layout/text; rely on HTML defaults
    return;
  }
  const x = TX();
  // Topbar/toolbar
  const brandSub = qs('.brand__subtitle'); if (brandSub) brandSub.textContent = x.brandSubtitle;
  const title = qs('.toolbar .title'); if (title) title.textContent = x.pageTitle;
  const subtitle = qs('.toolbar .subtitle'); if (subtitle) subtitle.textContent = x.pageSubtitle;
  const progress = qs('#progress'); if (progress) progress.textContent = t.steps[1];
  // Buttons
  els.btnEmergency && (els.btnEmergency.textContent = t.btns.emergency);
  els.btnPrint && (els.btnPrint.textContent = t.btns.print);
  els.btnPlan && (els.btnPlan.textContent = t.btns.plan);
  els.btnSaveTrip && (els.btnSaveTrip.textContent = t.btns.saveTrip);
  els.btnSavedTrips && (els.btnSavedTrips.textContent = t.btns.savedTrips);
  if (!selectedStation) { els.stationTitle.textContent = t.station.tap; els.stationBody.textContent = t.station.tip; }

  // Section head titles
  for (let i=1;i<=10;i++){
    const head = qs(`#p${i} .section__title`);
    if (head) head.textContent = x.parts[i];
  }

  // Part 1 overview
  const p1 = TX().p1;
  const oc = qsa('#p1 .overview .oc');
  if (oc.length>=4){
    oc[0].querySelector('.oct').textContent = p1.ocTitles[0]; oc[0].querySelector('.detail').textContent = p1.ocDetails[0];
    oc[1].querySelector('.oct').textContent = p1.ocTitles[1]; oc[1].querySelector('.detail').textContent = p1.ocDetails[1];
    oc[2].querySelector('.oct').textContent = p1.ocTitles[2]; oc[2].querySelector('.detail').textContent = p1.ocDetails[2];
    oc[3].querySelector('.oct').textContent = p1.ocTitles[3]; oc[3].querySelector('.detail').textContent = p1.ocDetails[3];
  }
  const mapRowH2 = qs('#p1 .card2 h2'); if (mapRowH2) mapRowH2.textContent = p1.mapTitle;
  const btnMapHelp = qs('#btnMapHelp'); if (btnMapHelp) btnMapHelp.textContent = p1.btnHelp;
  const btnResetMap = qs('#btnResetMap'); if (btnResetMap) btnResetMap.textContent = p1.btnReset;
  const mapDetail = qs('#p1 .card2 p.detail'); if (mapDetail) mapDetail.textContent = p1.mapDetail;
  const saveHome = qs('#btnSaveHome'); if (saveHome) saveHome.textContent = p1.saveHome;
  const saveFav = qs('#btnSaveFav'); if (saveFav) saveFav.textContent = p1.saveFav;
  const warn1 = qs('#p1 .warn.warn--yellow'); if (warn1) warn1.textContent = p1.warn;

  // Part 2
  const p2 = TX().p2;
  const p2h2 = qs('#p2 h2'); if (p2h2) p2h2.textContent = p2.h2;
  const p2a = qs('#p2 article:nth-of-type(1)');
  if (p2a){
    const h3 = qs('h3', p2a); if (h3) h3.textContent = p2.opt1;
    const det = qs('p.detail', p2a); if (det) det.textContent = p2.opt1Detail;
    const lis = qsa('ol.steps li', p2a);
    lis.forEach((li,i)=>{ if(p2.steps[i]) li.innerHTML = p2.steps[i]; });
    const tip = qs('.tip-cn', p2a); if (tip) tip.textContent = p2.tipCn;
  }
  const p2b = qs('#p2 article:nth-of-type(2)');
  if (p2b){
    const h3 = qs('h3', p2b); if (h3) h3.textContent = p2.opt2;
    const lis = qsa('ul li', p2b); lis.forEach((li,i)=>{ if(p2.fares[i]) li.innerHTML = p2.fares[i]; });
    const warn = qs('.warn', p2b); if (warn) warn.textContent = p2.warn;
  }

  // Part 3
  const p3 = TX().p3;
  const p3h2 = qs('#p3 h2'); if (p3h2) p3h2.textContent = p3.h2;
  const steps3 = qsa('#p3 .steps-grid .step .txt');
  steps3.forEach((d,i)=>{ if(p3.steps[i]) d.innerHTML = p3.steps[i]; });
  const safe3 = qs('#p3 .safe'); if (safe3) safe3.textContent = p3.safe;

  // Part 4
  const p4 = TX().p4;
  const p4h2 = qs('#p4 h2'); if (p4h2) p4h2.textContent = p4.h2;
  const p4lis = qsa('#p4 ol.steps li'); p4lis.forEach((li,i)=>{ if(p4.steps[i]) li.innerHTML = p4.steps[i]; });
  const p4card = qs('#p4 .card2'); if (p4card){
    const h3 = qs('h3', p4card); if (h3) h3.textContent = p4.seniorsH3;
    const lis = qsa('ul li', p4card); lis.forEach((li,i)=>{ if(p4.seniors[i]) li.innerHTML = p4.seniors[i]; });
  }

  // Part 5 (apps)
  const p5 = TX().p5;
  const cards5 = qsa('#p5 .card2');
  if (cards5[0]){ cards5[0].querySelector('h3').textContent = p5.chrono; const lis=qsa('ul li', cards5[0]); lis.forEach((li,i)=>{ if(p5.chronoList[i]) li.textContent = p5.chronoList[i]; }); }
  if (cards5[1]){ cards5[1].querySelector('h3').textContent = p5.transit; const lis=qsa('ul li', cards5[1]); lis.forEach((li,i)=>{ if(p5.transitList[i]) li.textContent = p5.transitList[i]; }); }
  if (cards5[2]){ cards5[2].querySelector('h3').textContent = p5.gmaps; const det=qs('p.detail', cards5[2]); if(det) det.textContent=p5.gmapsDetail; }
  const warn5 = qs('#p5 .warn'); if (warn5) warn5.textContent = p5.appWarn;
  const nav5 = qs('#p5 .bottom-nav'); if (nav5){ const a=qsa('a', nav5); if(a[0]) a[0].textContent=p5.bottom.apps; if(a[1]) a[1].textContent=p5.bottom.language; if(a[2]) a[2].textContent=p5.bottom.bank; }

  // Part 7 emergency
  const p7 = TX().p7;
  const eh3 = qs('#p7 h3'); if (eh3) eh3.textContent = p7.emergencyH3;
  const eLis = qsa('#p7 .emergency ul li'); eLis.forEach((li,i)=>{ if(p7.emergencyItems[i]) li.innerHTML = p7.emergencyItems[i]; });

  // Part 8 planner
  const p8 = TX().p8;
  const p8h2 = qs('#p8 h2'); if (p8h2) p8h2.textContent = p8.h2;
  const labels8 = qsa('#p8 label.label'); if (labels8[0]) labels8[0].textContent = p8.from; if (labels8[1]) labels8[1].textContent = p8.to;
  const opts8 = qsa('#toPlace option'); if (opts8[0]) opts8[0].textContent = p8.optMGH; if (opts8[1]) opts8[1].textContent = p8.optChinatown;
  const btnSaved = qs('#btnSavedTrips'); if (btnSaved) btnSaved.textContent = p8.savedTrips;

  // Part 9 accessibility
  const p9 = TX().p9;
  const cards9 = qsa('#p9 .card2');
  if (cards9[0]){ cards9[0].querySelector('h3').textContent = p9.metro; const lis=qsa('ul li',cards9[0]); lis.forEach((li,i)=>{ if(p9.metroList[i]) li.textContent = p9.metroList[i]; }); }
  if (cards9[1]){ cards9[1].querySelector('h3').textContent = p9.bus; const lis=qsa('ul li',cards9[1]); lis.forEach((li,i)=>{ if(p9.busList[i]) li.textContent = p9.busList[i]; }); }
  if (cards9[2]){ cards9[2].querySelector('h3').textContent = p9.st; const lis=qsa('ul li',cards9[2]); lis.forEach((li,i)=>{ if(p9.stList[i]) li.innerHTML = p9.stList[i]; }); }

  // Part 10 cultural
  const p10 = TX().p10;
  const cards10 = qsa('#p10 .card2');
  if (cards10[0]){ cards10[0].querySelector('h3').textContent = p10.h3a; const lis=qsa('ul li',cards10[0]); lis.forEach((li,i)=>{ if(p10.listA[i]) li.textContent = p10.listA[i]; }); }
  if (cards10[1]){ cards10[1].querySelector('h3').textContent = p10.h3b; const lis=qsa('ul li',cards10[1]); lis.forEach((li,i)=>{ if(p10.listB[i]) li.textContent = p10.listB[i]; }); }
}

function wireTopButtons() {
  els.btnPrint?.addEventListener('click', () => window.print());
  els.btnEmergency?.addEventListener('click', () => {
      // open Safety section and scroll
      const s = qs('#p7');
      const head = qs('[data-toggle]', s);
      const body = qs('[data-body]', s);
      if (head && body && head.getAttribute('aria-expanded') !== 'true') {
        head.setAttribute('aria-expanded', 'true');
        qs('.section__chev', head).textContent = '▾';
        body.removeAttribute('hidden');
      }
      els.progress.textContent = 'Step 4/5: Safety';
      els.emergencyBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Language selector placeholder
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => {
        qsa('.lang__btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  }

function init() {
  wireSections();
  wireMap();
  wireFrenchAudioButtons();
  wirePlanner();
  renderWhatIf();
  renderSignQuiz();
  wireTopButtons();
  applyTransportLang();
  window.addEventListener('aide:langChanged', applyTransportLang);

  // Completion panel
  window.AideProgress?.attachCompletionPanel?.({ skillId: 'transport' });

  // default selected station to home if saved
  const home = localStorage.getItem(STORAGE.homeStation);
  if (home) setStation(home);
}

init();
})();
