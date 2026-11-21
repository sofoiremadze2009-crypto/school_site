document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function activateTab(tabId) {
    if (!tabId) return;
    const targetElement = document.getElementById(tabId);
    if (!targetElement) return;

    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  }

  // მენიუს ღილაკებზე კლიკი
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      if (targetTab) activateTab(targetTab);
    });
  });

  // მისამართების ზოლში ჰეშის შემოწმება
  function checkHash() {
    const hash = window.location.hash.substring(1);
    if (hash) activateTab(hash);
  }
  checkHash();
  window.addEventListener('hashchange', checkHash);

  // ადმინ-პანელიდან შეყვანილი მონაცემების გამოტანა
  loadDynamicDataToMainSite();
  initIdeas();
  initBookSearch();
  initThemeToggle();
});

/* ---------------------------------------------------------
   სექციების დინამიური გამოტანა. საჭიროა js/data.js მასზე ადრე ჩატვირთვა.
   სანამ ადმინ-პანელში სექცია არ შეცვლილა, ჩანს schoolData-ს საწყისი ჩანაწერები.
   --------------------------------------------------------- */
function loadDynamicDataToMainSite() {
  if (typeof SCHOOL_SECTIONS === 'undefined' || typeof SchoolStore === 'undefined') return;

  SCHOOL_SECTIONS.forEach(sec => {
    if (!sec.box) return;
    // თუ არც შენახული მონაცემია და არც საწყისი, index.html-ის სტატიკური შიგთავსი რჩება
    if (!SchoolStore.has(sec.key) && !SchoolStore.defaults(sec.key).length) return;
    const box = document.querySelector(sec.box);
    if (!box) return;

    const items = SchoolStore.read(sec.key);
    box.innerHTML = '';

    if (!items.length) {
      const p = document.createElement('p');
      p.className = 'italic';
      p.textContent = 'ჩანაწერები ჯერ არ არის.';
      box.appendChild(p);
      return;
    }
    items.forEach(it => box.appendChild(buildCard(sec, it)));
  });
}

function buildCard(sec, it) {
  const card = document.createElement('div');
  card.className = sec.card;
  if (sec.key === 'school_teachers' && it.subject) card.dataset.subject = it.subject; // საგნის ფილტრისთვის

  const imgs = (Array.isArray(it.images) && it.images.length ? it.images : (it.image ? [it.image] : []))
    .filter(u => /^https:\/\//i.test(u));
  if (imgs.length) {
    const img = document.createElement('img');
    img.src = imgs[0];
    img.alt = it.title || '';
    img.loading = 'lazy';
    // ფოტოს სტილი სექციის მიხედვით: დირექცია და პედაგოგები სრულად ჩანს (არ იჭრება)
    const photoStyle = {
      school_management: 'width:220px;max-width:100%;height:auto;max-height:360px;object-fit:contain;border-radius:12px;margin:0;flex-shrink:0;',
      school_teachers: 'width:100%;height:auto;max-height:240px;object-fit:contain;border-radius:10px;margin-bottom:10px;'
    }[sec.key] || 'width:100%;height:200px;object-fit:cover;object-position:center top;border-radius:12px;margin-bottom:14px;';
    img.style.cssText = photoStyle;
    if (sec.gallery) { img.style.cursor = 'zoom-in'; img.onclick = () => openLightbox(imgs, 0); }
    card.appendChild(img);

    if (sec.gallery && imgs.length > 1) {
      const strip = document.createElement('div');
      strip.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;';
      imgs.forEach((u, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'ფოტო ' + (i + 1));
        b.style.cssText = 'padding:0;border:0;background:none;cursor:pointer;';
        const t = document.createElement('img');
        t.src = u; t.alt = ''; t.loading = 'lazy';
        t.style.cssText = 'width:56px;height:56px;object-fit:cover;border-radius:8px;margin:0;border:1px solid rgba(255,255,255,.2);';
        b.appendChild(t);
        b.onclick = () => openLightbox(imgs, i);
        strip.appendChild(b);
      });
      card.appendChild(strip);
    }
  }

  const extra = sec.extra ? it[sec.extra.name] : '';
  if (extra && sec.extra.name === 'category') {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = extra;
    card.appendChild(badge);
  }

  const h = document.createElement('h4');
  h.textContent = it.title || '';
  card.appendChild(h);

  if (extra && sec.extra.name !== 'category') {
    const m = document.createElement('p');
    m.style.fontWeight = '600';
    m.textContent = extra;
    card.appendChild(m);
  }

  if (it.text) {
    if (/^https?:\/\//i.test(it.text)) {
      const a = document.createElement('a');
      a.href = it.text;
      a.textContent = it.text;
      a.target = '_blank';
      a.rel = 'noopener';
      card.appendChild(a);
    } else {
      const p = document.createElement('p');
      p.style.whiteSpace = 'pre-line';
      p.textContent = it.text;
      card.appendChild(p);
    }
  }
  // დირექცია: ფოტო მარცხნივ, ტექსტი მარჯვნივ (ვიწრო ეკრანზე ტექსტი ფოტოს ქვეშ ჩამოდის)
  if (sec.key === 'school_management' && imgs.length) {
    const body = document.createElement('div');
    body.style.cssText = 'flex:1 1 240px;min-width:0;';
    [...card.children].slice(1).forEach(n => body.appendChild(n));
    card.style.cssText = 'display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;max-width:680px;';
    card.appendChild(body);
  }
  return card;
}

// უსაფრთხოებისთვის (XSS)
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* ---------- იდეები: გაგზავნა და სია ---------- */
function renderIdeas() {
  const box = document.getElementById('ideasContainer');
  if (!box) return;
  const items = SchoolStore.read('school_ideas');
  box.innerHTML = '';
  if (!items.length) {
    const p = document.createElement('p');
    p.textContent = 'იდეები ჯერ არ შემოსულა.';
    box.appendChild(p);
    return;
  }
  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'bell-row';
    row.style.flexDirection = 'column';
    const b = document.createElement('b');
    b.textContent = it.author || 'უსახელო';
    const p = document.createElement('p');
    p.textContent = it.text || '';
    row.append(b, p);
    if (it.date) {
      const d = document.createElement('small');
      d.textContent = it.date;
      row.appendChild(d);
    }
    box.appendChild(row);
  });
}

function initIdeas() {
  renderIdeas();
  const form = document.getElementById('publicIdeaForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const author = document.getElementById('ideaAuthor').value.trim();
    const text = document.getElementById('ideaText').value.trim();
    if (!author || !text) return;
    const items = SchoolStore.read('school_ideas');
    items.unshift({ id: Date.now(), author, text, date: new Date().toLocaleDateString('ka-GE') });
    SchoolStore.write('school_ideas', items);
    form.reset();
    renderIdeas();
  });
}

/* ---------- ბიბლიოთეკის ძებნა ---------- */
function initBookSearch() {
  const input = document.getElementById('bookSearchInput');
  const grid = document.getElementById('libraryBooksGrid');
  if (!input || !grid) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    [...grid.children].forEach(card => {
      card.hidden = q !== '' && !card.textContent.toLowerCase().includes(q);
    });
  });
}

/* ---------- თემის გადამრთველი ---------- */
function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  let dark = false;
  try { dark = localStorage.getItem('school_theme') === 'dark'; } catch (e) {}
  const apply = d => { document.body.classList.toggle('dark', d); btn.textContent = d ? '☀️' : '🌙'; };
  apply(dark);
  btn.addEventListener('click', () => {
    dark = !dark;
    apply(dark);
    try { localStorage.setItem('school_theme', dark ? 'dark' : 'light'); } catch (e) {}
  });
}

/* ---------- ფოტო გალერეა (ლაითბოქსი) ---------- */
function openLightbox(imgs, start) {
  let i = start;
  const ov = document.createElement('div');
  ov.className = 'modal';
  ov.style.cssText = 'flex-direction:column;gap:12px;';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-label', 'ფოტო გალერეა');

  const pic = document.createElement('img');
  pic.style.cssText = 'max-width:92vw;max-height:78vh;border-radius:12px;object-fit:contain;';
  pic.alt = '';
  pic.onclick = e => e.stopPropagation();

  const cnt = document.createElement('span');
  cnt.style.color = '#ffffff';
  const show = () => { pic.src = imgs[i]; cnt.textContent = (i + 1) + ' / ' + imgs.length; };
  const next = () => { i = (i + 1) % imgs.length; show(); };
  const prev = () => { i = (i - 1 + imgs.length) % imgs.length; show(); };
  const close = () => { document.removeEventListener('keydown', onKey); ov.remove(); };
  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }
  const mk = (t, fn, label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn-secondary';
    b.textContent = t; b.setAttribute('aria-label', label);
    b.onclick = e => { e.stopPropagation(); fn(); };
    return b;
  };
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:10px;align-items:center;';
  bar.append(mk('‹', prev, 'წინა'), cnt, mk('›', next, 'შემდეგი'), mk('✕', close, 'დახურვა'));

  ov.onclick = close;
  ov.append(pic, bar);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(ov);
  show();
}