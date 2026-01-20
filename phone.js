/* phone.js — interactivity for Using Your Phone
   Features:
   - Start choice (iPhone vs Android)
   - Android brand selector (Samsung/Huawei/Xiaomi/Pixel/Other)
   - Save selection in localStorage
   - Breadcrumbs update
   - High contrast toggle, text size controls, simplified text toggle
   - Listen buttons (Web Speech API) with slow rate
   - Print button
   - Simple practice simulator for each phone type
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const panels = {
    start: qs('#start'),
    iphone: qs('#iphone'),
    android: qs('#android'),
    common: qs('#common'),
    safety: qs('#safety'),
    practice: qs('#practice'),
    help: qs('#help'),
  };

  const crumbs = {
    device: qs('#crumbDevice'),
    brandWrap: qs('#crumbBrandWrap'),
    brand: qs('#crumbBrand'),
  };

  const storage = {
    get type() { return localStorage.getItem('selectedPhoneType'); },
    set type(v) { localStorage.setItem('selectedPhoneType', v); },
    get brand() { return localStorage.getItem('selectedAndroidBrand'); },
    set brand(v) { localStorage.setItem('selectedAndroidBrand', v); },
    get hc() { return localStorage.getItem('prefHighContrast') === '1'; },
    set hc(v) { localStorage.setItem('prefHighContrast', v ? '1' : '0'); },
    get font() { return Number(localStorage.getItem('prefFontPct') || '100'); },
    set font(v) { localStorage.setItem('prefFontPct', String(v)); },
    get simple() { return localStorage.getItem('prefSimple') === '1'; },
    set simple(v) { localStorage.setItem('prefSimple', v ? '1' : '0'); },
  };

  // Language for small UI strings
  const UI = {
    fr: {
      back: 'Retour',
      hc: 'Contraste élevé',
      simple: 'Texte simplifié',
      print: 'Imprimer le guide',
      practice: 'Mode pratique',
    },
    zh: {
      back: '返回',
      hc: '高对比度',
      simple: '简化文本',
      print: '打印本指南',
      practice: '练习模式',
    },
    en: {
      back: 'Back',
      hc: 'High Contrast',
      simple: 'Simplified Text',
      print: 'Print This Guide',
      practice: 'Practice Mode',
    },
  };

  // Full content strings
  const I18N_PHONE = {
    en: {
      startTitle: "Let's Start With Your Phone",
      choices: {
        iphoneTitle: '🍎 iPHONE (Apple)',
        iphoneDesc: 'Has one round button at the bottom (or no button on newer models). Made by Apple.',
        androidTitle: '🤖 ANDROID PHONES (Most Other Phones)',
        androidDesc: 'Many different brands look like this. Usually has a back, home, and recent apps button.',
      },
      helperTitle: 'Not sure?',
      helperItems: [
        'If you see an <strong>Apple logo</strong> (🍎) → Choose <strong>iPhone</strong>',
        'If you see <strong>Samsung</strong>, <strong>Google</strong>, <strong>Huawei</strong> (华为), <strong>Xiaomi</strong> (小米), or other names → Choose <strong>Android Phones</strong>',
      ],
      iphonePanelTitle: 'Welcome to Your iPhone',
      iphoneBasics: {
        h3: "1. The Basics — What's What",
        steps: [
          '<strong>Power Button</strong> (On/Off): Right side, to turn phone on/off or lock.',
          '<strong>Volume Buttons</strong> (🔊): Left side, to make sound louder/quieter.',
          '<strong>Side Button</strong> (newer) or <strong>Home Button</strong> (older): Wake your phone or go home.',
          '<strong>Screen</strong>: Touch here to do everything!',
        ],
      },
      iphoneCall: {
        h3: '2. Making Your First Call',
        steps: [
          'Tap the green <strong>Phone</strong> icon 📞',
          'Tap <strong>Keypad</strong> (looks like a calculator)',
          'Type the number using the big buttons',
          'Tap the green <strong>Call</strong> button',
        ],
        practice: 'Practice: Try calling a saved contact instead: <strong>Contacts</strong> → Find name → Tap to call.',
      },
      iphoneText: {
        h3: '3. Sending a Text Message',
        steps: [
          'Tap the green <strong>Messages</strong> icon 💬',
          'Tap the <strong>pencil-and-paper</strong> ✏️ icon',
          'Type the <strong>name</strong> OR <strong>number</strong>',
          'Type your message in the big box',
          'Tap the blue <strong>Send</strong> arrow ➤',
        ],
      },
      iphonePhoto: {
        h3: '4. Taking a Photo',
        steps: [
          'Tap the <strong>Camera</strong> icon 📸',
          'Point at what you want to photograph',
          'Tap the big white circle ⚪ at bottom',
          'See your photo in the <strong>Photos</strong> app',
        ],
      },
      iphoneTips: {
        h3: 'iPhone Special Tips',
        items: [
          '<strong>Siri (Voice Help):</strong> Hold the Side/Home button and say “Call my daughter” or “Set timer for 10 minutes”.',
          '<strong>Make Text Bigger:</strong> Settings → Display & Brightness → Text Size → Slide to right.',
          '<strong>Emergency SOS:</strong> Press Power button 5 times quickly → Calls emergency services.',
        ],
      },
      androidPanelTitle: 'Android Phones',
      common: {
        h2: 'Common Skills for All Phones',
        accH3: '1. Making Everything Bigger (Accessibility)',
        accItems: [
          '<strong>iPhone:</strong> Settings → Accessibility → Display & Text Size → Larger Text',
          '<strong>Android:</strong> Settings → Display → Font Size → Large',
          '<strong>中文:</strong> 设置 → 显示 → 字体大小 → 大号',
        ],
        wifiH3: '2. Connecting to Wi‑Fi',
        wifiSteps: [
          'Open <strong>Settings</strong> (gear ⚙️)',
          'Tap <strong>Wi‑Fi</strong>',
          'Tap your network name',
          'Enter password',
          'Tap <strong>Connect</strong>',
        ],
        contactH3: '3. Saving a Contact',
        contactSteps: [
          'Open <strong>Phone</strong> app',
          'Tap <strong>Contacts</strong>',
          'Tap <strong>+</strong>',
          'Type name and number',
          'Tap <strong>Save</strong>',
        ],
        lostH3: '4. If You Get Lost in an App',
        lostItems: [
          '<strong>iPhone:</strong> Press Home / swipe up from bottom',
          '<strong>Android:</strong> Press Home (◯)',
          '<strong>Universal:</strong> Lock (power) then unlock to start fresh',
        ],
      },
      safety: {
        h2: 'Safety & Maintenance',
        dailyH3: 'Daily Care',
        dailyItems: [
          '<strong>Charging:</strong> Plug in when low; unplug when full.',
          '<strong>Cleaning:</strong> Soft cloth; no water.',
          '<strong>Protection:</strong> Use a case and screen protector.',
        ],
        secH3: 'Security',
        secItems: [
          '<strong>Lock Screen:</strong> Set a PIN/password/pattern.',
          "<strong>Scam Calls:</strong> Don’t answer unknown numbers; they can leave a message.",
          "<strong>App Permissions:</strong> Only allow what’s needed.",
        ],
        batteryH3: 'Battery Saving Tips',
        batteryItems: [
          'Lower screen brightness',
          'Close unused apps',
          'Turn on Battery Saver below 20%',
        ],
      },
      practice: {
        h2: 'Try These Now',
        items: [
          'Call your voicemail by holding 1',
          'Send “Hello!” to a saved contact',
          'Take a photo of something in this room',
          'Find text size controls and change size',
          'Save an emergency contact',
        ],
      },
      help: {
        h2: 'Getting Help',
        items: [
          'Ask a family member',
          'Visit the store (Apple Store or carrier)',
          'YouTube: “Your Phone Model basics for seniors”',
          'Community centers often offer free tech help',
        ],
        emergency: '<strong>Emergency Reset:</strong> If frozen, hold Power + Volume Down for ~10 seconds.',
      },
      finish: 'Finish this lesson',
      nextApps: 'Next: Installing Apps',
    },
    fr: {
      startTitle: 'Commençons avec votre téléphone',
      choices: {
        iphoneTitle: '🍎 iPHONE (Apple)',
        iphoneDesc: "Un bouton rond en bas (ou aucun sur les modèles récents). Fabriqué par Apple.",
        androidTitle: '🤖 TÉLÉPHONES ANDROID (la plupart des autres)',
        androidDesc: 'Beaucoup de marques. Souvent avec les boutons Retour, Accueil et Applis récentes.',
      },
      helperTitle: 'Vous hésitez ?',
      helperItems: [
        "Si vous voyez le <strong>logo Apple</strong> (🍎) → Choisissez <strong>iPhone</strong>",
        "Si vous voyez <strong>Samsung</strong>, <strong>Google</strong>, <strong>Huawei</strong> (华为), <strong>Xiaomi</strong> (小米) ou autre → Choisissez <strong>Android</strong>",
      ],
      iphonePanelTitle: 'Bienvenue sur votre iPhone',
      iphoneBasics: {
        h3: '1. Les bases — repères',
        steps: [
          "<strong>Bouton d’alimentation</strong> : à droite, pour allumer/éteindre ou verrouiller.",
          "<strong>Volume</strong> (🔊) : à gauche, pour augmenter/diminuer le son.",
          "<strong>Bouton latéral</strong> (récent) ou <strong>Bouton Accueil</strong> (ancien) : réveiller ou revenir à l’accueil.",
          '<strong>Écran</strong> : touchez ici pour tout faire !',
        ],
      },
      iphoneCall: {
        h3: '2. Passer votre premier appel',
        steps: [
          "Touchez l’icône verte <strong>Téléphone</strong> 📞",
          'Touchez <strong>Clavier</strong> (ressemble à une calculatrice)',
          'Composez le numéro avec les gros boutons',
          'Touchez le bouton vert <strong>Appeler</strong>',
        ],
        practice: 'Pratique : appelez un contact enregistré : <strong>Contacts</strong> → Trouver le nom → Toucher pour appeler.',
      },
      iphoneText: {
        h3: '3. Envoyer un message texte',
        steps: [
          "Touchez l’icône verte <strong>Messages</strong> 💬",
          "Touchez l’icône <strong>crayon‑papier</strong> ✏️",
          'Entrez le <strong>nom</strong> OU le <strong>numéro</strong>',
          'Écrivez votre message dans le grand champ',
          'Touchez la flèche bleue <strong>Envoyer</strong> ➤',
        ],
      },
      iphonePhoto: {
        h3: '4. Prendre une photo',
        steps: [
          "Touchez l’icône <strong>Appareil photo</strong> 📸",
          'Cadrez ce que vous voulez photographier',
          'Touchez le grand cercle blanc ⚪ en bas',
          'Retrouvez la photo dans <strong>Photos</strong>',
        ],
      },
      iphoneTips: {
        h3: 'Astuces spéciales iPhone',
        items: [
          '<strong>Siri (aide vocale)</strong> : maintenez le bouton Latéral/Accueil et dites « Appelle ma fille » ou « Mets un minuteur de 10 minutes ».',
          '<strong>Texte plus grand</strong> : Réglages → Luminosité & affichage → Taille du texte → Faites glisser vers la droite.',
          '<strong>Urgence SOS</strong> : appuyez 5 fois sur le bouton Alimentation → Appel des services d’urgence.',
        ],
      },
      androidPanelTitle: 'Téléphones Android',
      common: {
        h2: 'Compétences communes à tous les téléphones',
        accH3: '1. Tout agrandir (Accessibilité)',
        accItems: [
          '<strong>iPhone :</strong> Réglages → Accessibilité → Affichage & taille du texte → Texte plus grand',
          '<strong>Android :</strong> Réglages → Affichage → Taille de la police → Grande',
          '<strong>中文：</strong> 设置 → 显示 → 字体大小 → 大号',
        ],
        wifiH3: '2. Se connecter au Wi‑Fi',
        wifiSteps: [
          '<strong>Réglages</strong> (roue ⚙️)',
          'Touchez <strong>Wi‑Fi</strong>',
          'Touchez le nom de votre réseau',
          'Entrez le mot de passe',
          'Touchez <strong>Se connecter</strong>',
        ],
        contactH3: '3. Enregistrer un contact',
        contactSteps: [
          'Ouvrez <strong>Téléphone</strong>',
          'Touchez <strong>Contacts</strong>',
          'Touchez <strong>+</strong>',
          'Saisissez le nom et le numéro',
          'Touchez <strong>Enregistrer</strong>',
        ],
        lostH3: '4. Si vous êtes perdu dans une app',
        lostItems: [
          '<strong>iPhone :</strong> Bouton Accueil / balayez vers le haut',
          '<strong>Android :</strong> Bouton Accueil (◯)',
          '<strong>Universel :</strong> Verrouillez puis déverrouillez pour repartir proprement',
        ],
      },
      safety: {
        h2: 'Sécurité & entretien',
        dailyH3: 'Entretien quotidien',
        dailyItems: [
          '<strong>Charge</strong> : branchez quand c’est faible ; débranchez une fois chargé.',
          '<strong>Nettoyage</strong> : chiffon doux ; pas d’eau.',
          '<strong>Protection</strong> : coque et protection d’écran.',
        ],
        secH3: 'Sécurité',
        secItems: [
          '<strong>Écran verrouillé</strong> : code PIN / mot de passe / schéma.',
          "<strong>Appels suspects</strong> : n répondez pas aux inconnus ; ils laisseront un message.",
          "<strong>Autorisations</strong> : n’autorisez que le nécessaire.",
        ],
        batteryH3: 'Conseils pour la batterie',
        batteryItems: [
          'Baissez la luminosité',
          'Fermez les apps inutilisées',
          'Mode Économie d’énergie sous 20 %',
        ],
      },
      practice: {
        h2: 'À essayer maintenant',
        items: [
          'Maintenez 1 pour appeler la messagerie',
          'Envoyez « Bonjour ! » à un contact enregistré',
          'Prenez une photo de quelque chose dans la pièce',
          'Trouvez la taille du texte et changez‑la',
          'Ajoutez un contact d’urgence',
        ],
      },
      help: {
        h2: 'Obtenir de l’aide',
        items: [
          'Demandez à un membre de la famille',
          'Allez en boutique (Apple Store ou opérateur)',
          'YouTube : « <em>Nom de votre téléphone</em> débutant »',
          'Les centres communautaires offrent souvent de l’aide gratuite',
        ],
        emergency: '<strong>Redémarrage d’urgence :</strong> si bloqué, maintenez Alimentation + Volume Bas ~10 s.',
      },
      finish: 'Terminer cette leçon',
      nextApps: 'Suivant : Installer des applications',
    },
    zh: {
      startTitle: '从这里开始：你的手机',
      choices: {
        iphoneTitle: '🍎 iPhone（苹果）',
        iphoneDesc: '旧款底部有圆形 Home 键（新款没有）。苹果出品。',
        androidTitle: '🤖 安卓手机（大多数其它品牌）',
        androidDesc: '品牌众多。通常有“返回 / 主页 / 最近”按钮或手势。',
      },
      helperTitle: '不确定？',
      helperItems: [
        '如果背面是<strong>苹果标志</strong>（🍎）→ 选 <strong>iPhone</strong>',
        '如果看到 <strong>Samsung</strong>、<strong>Google</strong>、<strong>Huawei</strong>（华为）、<strong>Xiaomi</strong>（小米）等 → 选 <strong>Android</strong>',
      ],
      iphonePanelTitle: '欢迎使用 iPhone',
      iphoneBasics: {
        h3: '1. 基本认识',
        steps: [
          '<strong>电源键</strong>：右侧，用于开关机或锁屏。',
          '<strong>音量键</strong>（🔊）：左侧，调大/调小音量。',
          '<strong>侧边键</strong>（新款）或 <strong>Home 键</strong>（老款）：唤醒或回到主屏幕。',
          '<strong>屏幕</strong>：所有操作都在这里完成！',
        ],
      },
      iphoneCall: {
        h3: '2. 第一次打电话',
        steps: [
          '点开绿色 <strong>电话</strong> 图标 📞',
          '点 <strong>键盘</strong>（像计算器）',
          '用大按钮输入号码',
          '点绿色 <strong>拨号</strong> 按钮',
        ],
        practice: '练习：打给已保存的联系人：<strong>通讯录</strong> → 找到名字 → 点拨打。',
      },
      iphoneText: {
        h3: '3. 发送短信',
        steps: [
          '点开绿色 <strong>信息</strong> 图标 💬',
          '点 <strong>铅笔</strong> ✏️ 图标',
          '输入<strong>姓名</strong>或<strong>号码</strong>',
          '在大框里输入内容',
          '点蓝色 <strong>发送</strong> 箭头 ➤',
        ],
      },
      iphonePhoto: {
        h3: '4. 拍照',
        steps: [
          '点开 <strong>相机</strong> 图标 📸',
          '对准你要拍的东西',
          '点底部白色大圆 ⚪',
          '在 <strong>照片</strong> App 里查看',
        ],
      },
      iphoneTips: {
        h3: 'iPhone 小技巧',
        items: [
          '<strong>Siri 语音助手：</strong>按住侧边键/主键，说“帮我给女儿打电话”“设置10分钟计时器”。',
          '<strong>放大文字：</strong>设置 → 显示与亮度 → 文字大小 → 向右滑动。',
          '<strong>紧急 SOS：</strong>快速按电源键 5 次 → 拨打紧急服务。',
        ],
      },
      androidPanelTitle: '安卓手机',
      common: {
        h2: '所有手机通用',
        accH3: '1. 放大（无障碍）',
        accItems: [
          '<strong>iPhone：</strong>设置 → 辅助功能 → 显示与文字大小 → 更大文字',
          '<strong>Android：</strong>设置 → 显示 → 字体大小 → 大号',
          '<strong>中文：</strong> 设置 → 显示 → 字体大小 → 大号',
        ],
        wifiH3: '2. 连接 Wi‑Fi',
        wifiSteps: [
          '打开 <strong>设置</strong>（齿轮 ⚙️）',
          '点 <strong>Wi‑Fi</strong>',
          '点你的网络名称',
          '输入密码',
          '点 <strong>连接</strong>',
        ],
        contactH3: '3. 保存联系人',
        contactSteps: [
          '打开 <strong>电话</strong> App',
          '点 <strong>联系人</strong>',
          '点 <strong>+</strong>',
          '输入姓名和号码',
          '点 <strong>保存</strong>',
        ],
        lostH3: '4. 在 App 里迷路了',
        lostItems: [
          '<strong>iPhone：</strong>按 Home / 自下而上滑动',
          '<strong>Android：</strong>按主页键（◯）',
          '<strong>通用：</strong>按电源锁屏再解锁，重新开始',
        ],
      },
      safety: {
        h2: '安全与维护',
        dailyH3: '日常保养',
        dailyItems: [
          '<strong>充电：</strong>电量低时充电；充满后拔下。',
          '<strong>清洁：</strong>软布擦拭；不要用水。',
          '<strong>保护：</strong>使用手机壳和钢化膜。',
        ],
        secH3: '安全',
        secItems: [
          '<strong>锁屏：</strong>设置 PIN/密码/图案。',
          '<strong>诈骗电话：</strong>陌生号码可不接；会留下语音。',
          '<strong>应用权限：</strong>只给需要的权限。',
        ],
        batteryH3: '省电小贴士',
        batteryItems: [
          '调低屏幕亮度',
          '关闭未使用的 App',
          '低于 20% 开启省电模式',
        ],
      },
      practice: {
        h2: '现在就试试',
        items: [
          '长按数字 1 拨打语音信箱',
          '给联系人发送“你好！”',
          '给房间里的物品拍一张照',
          '找到文字大小并调整',
          '保存一个紧急联系人',
        ],
      },
      help: {
        h2: '获得帮助',
        items: [
          '请家人帮忙',
          '去门店（Apple Store 或运营商）',
          'YouTube：搜索“你的手机型号 老人 入门”',
          '社区中心常有免费的科技帮助',
        ],
        emergency: '<strong>紧急重启：</strong>死机时，长按 电源 + 音量下 ~10 秒。',
      },
      finish: '完成本课',
      nextApps: '下一步：安装应用',
    },
  };

  let currentLang = 'en';

  function applyLangPhone(lang) {
    currentLang = ['fr', 'zh', 'en'].includes(lang) ? lang : 'en';
    qsa('.lang__btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === currentLang)));
    // Small UI labels
    qs('#btnContrast').textContent = UI[currentLang].hc;
    qs('#btnSimple').textContent = UI[currentLang].simple;
    qs('#btnPrint').textContent = UI[currentLang].print;
    qsa('[data-back]').forEach((b) => (b.textContent = UI[currentLang].back + ' to Phone Selection'));
    qsa('[data-open-sim="iphone"]').forEach((b) => (b.textContent = UI[currentLang].practice));
    qsa('[data-open-sim="android"]').forEach((b) => (b.textContent = UI[currentLang].practice));

    // Full content updates
    const T = I18N_PHONE[currentLang] || I18N_PHONE.en;

    const st = qs('#startTitle'); if (st) st.textContent = T.startTitle;
    const ctI = qs('#chooseIphone .choice__title'); if (ctI) ctI.textContent = T.choices.iphoneTitle;
    const cdI = qs('#iphoneDesc'); if (cdI) cdI.innerHTML = T.choices.iphoneDesc;
    const ctA = qs('#chooseAndroid .choice__title'); if (ctA) ctA.textContent = T.choices.androidTitle;
    const cdA = qs('#androidDesc'); if (cdA) cdA.textContent = T.choices.androidDesc;

    const helper = qs('#start .helper');
    if (helper) {
      const p = helper.querySelector('p strong')?.parentElement; // paragraph with Not sure?
      const pTitle = helper.querySelector('p');
      if (pTitle) pTitle.innerHTML = `<strong>${T.helperTitle}</strong> ${T.helperItems[0].replace(/<.*?>/g,'') ? '' : ''}`;
      const ul = helper.querySelector('ul');
      if (ul) {
        const lis = Array.from(ul.querySelectorAll('li'));
        lis.forEach((li, i) => { if (T.helperItems[i]) li.innerHTML = T.helperItems[i]; });
      }
    }

    const ipTitle = qs('#iphoneTitle'); if (ipTitle) ipTitle.textContent = T.iphonePanelTitle;

    // iPhone Basics
    if (qs('#iphoneBasics h3')) qs('#iphoneBasics h3').textContent = T.iphoneBasics.h3;
    const ibSteps = Array.from(qs('#iphoneBasics .steps')?.querySelectorAll('li')||[]);
    ibSteps.forEach((li,i)=>{ if (T.iphoneBasics.steps[i]) li.innerHTML = T.iphoneBasics.steps[i]; });

    // iPhone Call
    if (qs('#iphoneCall h3')) qs('#iphoneCall h3').textContent = T.iphoneCall.h3;
    const icBodies = Array.from(qs('#iphoneCall .steps-grid')?.querySelectorAll('.step-body')||[]);
    icBodies.forEach((el,i)=>{ if (T.iphoneCall.steps[i]) el.innerHTML = T.iphoneCall.steps[i]; });
    const icPr = qs('#iphoneCall .practice'); if (icPr) icPr.innerHTML = T.iphoneCall.practice;

    // iPhone Text
    if (qs('#iphoneText h3')) qs('#iphoneText h3').textContent = T.iphoneText.h3;
    const itSteps = Array.from(qs('#iphoneText .steps')?.querySelectorAll('li')||[]);
    itSteps.forEach((li,i)=>{ if (T.iphoneText.steps[i]) li.innerHTML = T.iphoneText.steps[i]; });

    // iPhone Photo
    if (qs('#iphonePhoto h3')) qs('#iphonePhoto h3').textContent = T.iphonePhoto.h3;
    const ipSteps = Array.from(qs('#iphonePhoto .steps')?.querySelectorAll('li')||[]);
    ipSteps.forEach((li,i)=>{ if (T.iphonePhoto.steps[i]) li.innerHTML = T.iphonePhoto.steps[i]; });

    // iPhone Tips
    if (qs('#iphoneTips h3')) qs('#iphoneTips h3').textContent = T.iphoneTips.h3;
    const itList = qs('#iphoneTips ul'); if (itList) {
      const lis = Array.from(itList.querySelectorAll('li'));
      lis.forEach((li,i)=>{ if (T.iphoneTips.items[i]) li.innerHTML = T.iphoneTips.items[i]; });
    }

    // Android panel title
    const aTitle = qs('#androidTitle'); if (aTitle) aTitle.textContent = T.androidPanelTitle;

    // Common skills
    const cSec = qs('#common');
    if (cSec) {
      const h2 = qs('#common .section-title'); if (h2) h2.textContent = T.common.h2;
      const accH3 = qs('#acc h3'); if (accH3) accH3.textContent = T.common.accH3;
      const accUl = qs('#acc ul'); if (accUl) {
        const lis = Array.from(accUl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.common.accItems[i]) li.innerHTML = T.common.accItems[i]; });
      }
      const wifiH3 = qs('#wifi h3'); if (wifiH3) wifiH3.textContent = T.common.wifiH3;
      const wifiOl = qs('#wifi .steps'); if (wifiOl) {
        const lis = Array.from(wifiOl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.common.wifiSteps[i]) li.textContent = T.common.wifiSteps[i]; });
      }
      const contactH3 = qs('#contact h3'); if (contactH3) contactH3.textContent = T.common.contactH3;
      const contactOl = qs('#contact .steps'); if (contactOl) {
        const lis = Array.from(contactOl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.common.contactSteps[i]) li.textContent = T.common.contactSteps[i]; });
      }
      const lostH3 = qs('#lost h3'); if (lostH3) lostH3.textContent = T.common.lostH3;
      const lostUl = qs('#lost ul'); if (lostUl) {
        const lis = Array.from(lostUl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.common.lostItems[i]) li.innerHTML = T.common.lostItems[i]; });
      }
    }

    // Safety & Maintenance
    const sSec = qs('#safety');
    if (sSec) {
      const h2 = qs('#safety .section-title'); if (h2) h2.textContent = T.safety.h2;
      const dH3 = Array.from(qsa('#safety h3'));
      const daily = dH3.find(x=>x.textContent.match(/Daily Care|Entretien|日常/)); if (daily) daily.textContent = T.safety.dailyH3;
      const secH3 = dH3.find(x=>x.textContent.match(/Security|Sécurité|安全/)); if (secH3) secH3.textContent = T.safety.secH3;
      const batH3 = dH3.find(x=>x.textContent.match(/Battery|batterie|电池/)); if (batH3) batH3.textContent = T.safety.batteryH3;
      const dailyUl = dH3.length? dH3[0].parentElement.querySelector('ul'):null; if (dailyUl) {
        const lis = Array.from(dailyUl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.safety.dailyItems[i]) li.innerHTML = T.safety.dailyItems[i]; });
      }
      const secUl = dH3.length? dH3[1].parentElement.querySelector('ul'):null; if (secUl) {
        const lis = Array.from(secUl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.safety.secItems[i]) li.innerHTML = T.safety.secItems[i]; });
      }
      const batUl = dH3.length? dH3[2].parentElement.querySelector('ul'):null; if (batUl) {
        const lis = Array.from(batUl.querySelectorAll('li'));
        lis.forEach((li,i)=>{ if (T.safety.batteryItems[i]) li.textContent = T.safety.batteryItems[i]; });
      }
    }

    // Practice
    const pSec = qs('#practice');
    if (pSec) {
      const h2 = qs('#practice .section-title'); if (h2) h2.textContent = T.practice.h2;
      const ul = qs('#practice .checklist'); if (ul) {
        const lis = Array.from(ul.querySelectorAll('li label'));
        lis.forEach((lab,i)=>{ if (T.practice.items[i]) lab.lastChild.textContent = ' ' + T.practice.items[i]; });
      }
    }

    // Help
    const hSec = qs('#help');
    if (hSec) {
      const h2 = qs('#help .section-title'); if (h2) h2.textContent = T.help.h2;
      const ul = qsa('#help ul li'); ul.forEach((li,i)=>{ if (T.help.items[i]) li.textContent = T.help.items[i]; });
      const p = qsa('#help p'); if (p[0]) p[0].innerHTML = T.help.emergency;
    }

    // Finish & bottom nav
    const finish = qsa('section[aria-label="Completion"] h2'); if (finish[0]) finish[0].textContent = T.finish;
    qsa('a[href="index.html#skill_apps"]').forEach(a=> a.textContent = T.nextApps);
  }

  // View helpers
  function showOnly(...els) {
    Object.values(panels).forEach((p) => p.setAttribute('hidden', ''));
    els.forEach((p) => p && p.removeAttribute('hidden'));
  }

  function updateCrumbs(type, brand) {
    crumbs.device.textContent = type ? (type === 'iphone' ? 'iPhone' : 'Android') : 'Choose';
    if (type === 'android' && brand) {
      crumbs.brandWrap.hidden = false;
      crumbs.brand.textContent = brandLabel(brand);
    } else {
      crumbs.brandWrap.hidden = true;
      crumbs.brand.textContent = '';
    }
  }

  function brandLabel(b) {
    return { samsung: 'Samsung', huawei: 'Huawei 华为', xiaomi: 'Xiaomi 小米', pixel: 'Google Pixel', other: 'Other' }[b] || 'Other';
  }

  // Selection logic
  function chooseIphone() {
    storage.type = 'iphone';
    updateCrumbs('iphone');
    showOnly(panels.iphone, panels.common, panels.safety, panels.practice, panels.help);
  }

  function chooseAndroid() {
    storage.type = 'android';
    updateCrumbs('android');
    showOnly(panels.android, panels.common, panels.safety, panels.practice, panels.help);
  }

  function chooseBrand(b) {
    storage.brand = b;
    updateCrumbs('android', b);
    qsa('.brand-section').forEach((s) => s.setAttribute('hidden', ''));
    const sec = qs('#brand_' + b) || qs('#brand_other');
    sec.removeAttribute('hidden');
  }

  // Accessibility controls
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

  function toggleSimple() {
    const on = !document.body.classList.contains('simple');
    document.body.classList.toggle('simple', on);
    storage.simple = on;
  }

  // Listen buttons
  function speakText(text, langHint) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    if (langHint) {
      const v = window.speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(langHint));
      if (v) u.voice = v;
    }
    speechSynthesis.speak(u);
  }

  function sectionText(selector) {
    const el = qs(selector);
    if (!el) return '';
    // get visible text only
    const clone = el.cloneNode(true);
    clone.querySelectorAll('button, svg, .diagram, .sim, .phone-frame').forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // Simulator
  function openSim(type) {
    if (type === 'iphone') {
      qs('#simIphone').removeAttribute('hidden');
    } else {
      qs('#simAndroid').removeAttribute('hidden');
    }
  }
  function closeSims() {
    qsa('.sim').forEach((s) => s.setAttribute('hidden', ''));
  }
  function wireSim() {
    // iPhone
    const scrI = qs('#simIphoneScreen');
    scrI && scrI.addEventListener('click', (e) => {
      const app = e.target.closest('.app')?.dataset.app;
      if (!app) return;
      qs('#simIphoneScreen .sim-instructions').textContent =
        app === 'phone' ? 'Open Phone → Keypad → Dial → Call' : app === 'messages' ? 'Open Messages → New → Type → Send' : 'Open Camera → Tap white circle';
    });

    // Android
    const scrA = qs('#simAndroidScreen');
    scrA && scrA.addEventListener('click', (e) => {
      const app = e.target.closest('.app')?.dataset.app;
      const nav = e.target.closest('.nav-btn')?.dataset.nav;
      if (app) {
        qs('#simAndroidScreen .sim-instructions').textContent =
          app === 'phone' ? 'Open Phone → Keypad → Dial → Call' : app === 'messages' ? 'Open Messages → New → Type → Send' : 'Open Camera → Tap shutter';
      }
      if (nav) {
        qs('#simAndroidScreen .sim-instructions').textContent =
          nav === 'back' ? 'Back: go to previous screen' : nav === 'home' ? 'Home: go to main screen' : 'Recent: see open apps';
      }
    });
  }

  // Event wiring
  function wire() {
    qs('#chooseIphone').addEventListener('click', chooseIphone);
    qs('#chooseAndroid').addEventListener('click', chooseAndroid);
    qsa('.brand').forEach((b) => b.addEventListener('click', () => chooseBrand(b.dataset.brand)));

    qsa('[data-back]').forEach((b) => b.addEventListener('click', () => { showOnly(panels.start); updateCrumbs(); }));

    qs('#btnContrast').addEventListener('click', toggleContrast);
    qs('#btnTextInc').addEventListener('click', () => setFontPct(storage.font + 10));
    qs('#btnTextDec').addEventListener('click', () => setFontPct(storage.font - 10));
    qs('#btnSimple').addEventListener('click', toggleSimple);
    qs('#btnPrint').addEventListener('click', () => window.print());

    qsa('.listen-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-listen');
        const text = sectionText(sel);
        const hint = sel.includes('huawei') || sel.includes('xiaomi') ? 'zh' : currentLang;
        speakText(text, hint);
      });
    });

    qsa('[data-open-sim]').forEach((b) => b.addEventListener('click', () => openSim(b.getAttribute('data-open-sim'))));
    qsa('[data-exit-sim]').forEach((b) => b.addEventListener('click', closeSims));

    // Language buttons
    qsa('.lang__btn').forEach((b) => b.addEventListener('click', () => applyLangPhone(b.dataset.lang)));
  }

  // Restore state
  function restore() {
    // A11y prefs
    if (storage.hc) document.body.classList.add('hc');
    if (storage.simple) document.body.classList.add('simple');
    setFontPct(storage.font);

    // Device selection
    const type = storage.type;
    const brand = storage.brand;
    if (type === 'iphone') chooseIphone();
    else if (type === 'android') {
      chooseAndroid();
      if (brand) chooseBrand(brand);
    } else {
      showOnly(panels.start);
      updateCrumbs();
    }
  }

  // Init
  wire();
  wireSim();
  // Use global language if available
  try {
    const glang = window.AideI18n?.getLang?.();
    if (glang) applyLangPhone(glang);
  } catch {}
  applyLangPhone(currentLang);
  restore();

  // React to global language changes
  window.addEventListener('aide:langChanged', (e) => applyLangPhone(e.detail?.lang || currentLang));

  // Completion panel
  window.AideProgress?.attachCompletionPanel?.({ skillId: 'phone' });
})();
