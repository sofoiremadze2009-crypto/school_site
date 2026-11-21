/* =========================================================
   js/admin.js — ადმინ-პანელის ლოგიკა (მუშაობს მხოლოდ admin.html-ზე)
   ---------------------------------------------------------
   თანმიმდევრობა ფაილში:
   1. PASSWORD და მდგომარეობა (ამჟამინდელი სექცია, რედაქტირების ID)
   2. გალერეა       – ექსკურსიების მრავალი ფოტო (renderGallery, ატვირთვა)
   3. შესვლა        – პაროლის შემოწმება, sessionStorage-ით დამახსოვრება
   4. ჩანართები     – buildTabs(), resetForm()
   5. render()      – სიის გამოტანა, ღილაკები ✎ (რედაქტირება) და 🗑 (წაშლა)
   6. startEdit()   – ჩანაწერის ჩატვირთვა ფორმაში; form submit – დამატება/შენახვა
   7. Cloudinary    – ერთი ფოტოს ატვირთვა (სიახლე, მიღწევა, პედაგოგი...)
   საჭიროებს: data.js-ს (SCHOOL_SECTIONS, SchoolStore) მასზე ადრე ჩატვირთვას
   რა სად შევცვალო:
   - პაროლი               → const PASSWORD
   - Cloudinary-ს მონაცემები → cloudName და uploadPreset (ორ ადგილას)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  if (!$('adminApp')) return;

  const PASSWORD = 'admin123';
  let cur = SCHOOL_SECTIONS[0];
  let editId = null;
  let widget = null;
  let gal = [];          // ექსკურსიის ფოტოების სია (გალერეა)
  let galWidget = null;

  /* ---------- გალერეის ბლოკი (მრავალი ფოტო) ---------- */
  const galleryRow = document.createElement('div');
  galleryRow.id = 'galleryRow';
  galleryRow.hidden = true;
  galleryRow.innerHTML = '<div class="row" id="galleryThumbs"></div>' +
    '<button class="btn-secondary" type="button" id="galUpBtn" style="margin-top:8px">ფოტოების ატვირთვა (რამდენიმე)</button>';
  $('imgRow').after(galleryRow);

  function renderGallery() {
    const box = $('galleryThumbs');
    box.innerHTML = '';
    gal.forEach((u, i) => {
      const w = document.createElement('div');
      w.style.cssText = 'position:relative;width:72px;height:72px;';
      const im = document.createElement('img');
      im.src = u; im.alt = '';
      im.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:8px;';
      const x = document.createElement('button');
      x.type = 'button'; x.textContent = '×';
      x.title = 'ფოტოს წაშლა'; x.setAttribute('aria-label', 'ფოტოს წაშლა');
      x.style.cssText = 'position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:0;background:var(--emerald-dark);color:#fff;cursor:pointer;line-height:1;';
      x.onclick = () => { gal.splice(i, 1); renderGallery(); };
      w.append(im, x);
      box.appendChild(w);
    });
  }

  $('galUpBtn').onclick = () => {
    if (!window.cloudinary) {
      alert('Cloudinary ვიჯეტი ვერ ჩაიტვირთა. შეამოწმეთ ინტერნეტი.');
      return;
    }
    if (!galWidget) {
      galWidget = cloudinary.createUploadWidget(
        { cloudName: 'dvmiinq4w', uploadPreset: 'school_site', sources: ['local', 'url', 'camera'], multiple: true, maxFiles: 20 },
        (err, res) => {
          if (!err && res && res.event === 'success') { gal.push(res.info.secure_url); renderGallery(); }
        }
      );
    }
    galWidget.open();
  };

  /* ---------- შესვლა ---------- */
  function unlock() {
    $('lock').hidden = true;
    $('adminApp').hidden = false;
    buildTabs();
    render();
  }
  let remembered = false;
  try { remembered = sessionStorage.getItem('adm_ok') === '1'; } catch (e) {}
  if (remembered) unlock(); else $('lock').hidden = false;

  $('lockForm').addEventListener('submit', e => {
    e.preventDefault();
    if ($('pw').value === PASSWORD) {
      try { sessionStorage.setItem('adm_ok', '1'); } catch (e) {}
      unlock();
    } else {
      $('lockErr').textContent = 'პაროლი არასწორია. სცადეთ ხელახლა.';
      $('pw').value = '';
    }
  });

  /* ---------- ჩანართები ---------- */
  function buildTabs() {
    const nav = $('tabs');
    nav.innerHTML = '';
    SCHOOL_SECTIONS.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sub-btn';
      b.textContent = s.label;
      b.onclick = () => { cur = s; resetForm(); render(); };
      nav.appendChild(b);
    });
  }

  function resetForm() {
    editId = null;
    $('form').reset();
    gal = [];
    renderGallery();
    $('saveBtn').textContent = 'დამატება';
    $('cancelBtn').hidden = true;
  }

  /* ---------- გამოტანა ---------- */
  function render() {
    [...$('tabs').children].forEach((b, i) => b.classList.toggle('active', SCHOOL_SECTIONS[i] === cur));

    $('formBox').hidden = !!cur.readonly;
    $('imgRow').hidden = !cur.image;
    $('galleryRow').hidden = !cur.gallery;
    $('extraRow').hidden = !cur.extra;
    if (cur.extra) $('fExtra').placeholder = cur.extra.label;
    $('fText').placeholder = cur.textLabel || 'ტექსტი';
    $('formTitle').textContent = (editId ? 'რედაქტირება: ' : 'ახალი ჩანაწერი: ') + cur.label;
    $('listTitle').textContent = cur.label;

    const list = $('list');
    list.innerHTML = '';
    const items = SchoolStore.read(cur.key);

    if (!items.length) {
      const p = document.createElement('p');
      p.className = 'italic';
      p.textContent = cur.readonly ? 'იდეები ჯერ არ შემოსულა.' : 'ჩანაწერები ჯერ არ არის. დაამატეთ პირველი ზემოთ.';
      list.appendChild(p);
      return;
    }

    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'item';

      const cover = (it.images && it.images[0]) || it.image;
      if (cover && /^https:\/\//i.test(cover)) {
        const im = document.createElement('img');
        im.src = cover; im.alt = '';
        row.appendChild(im);
      }

      const t = document.createElement('div');
      t.className = 't';
      const b = document.createElement('b');
      const sp = document.createElement('span');
      if (cur.readonly) {
        b.textContent = it.author || 'უსახელო';
        sp.textContent = [it.text, it.date].filter(Boolean).join(' · ');
      } else {
        b.textContent = it.title || '(უსათაურო)';
        const ex = cur.extra && it[cur.extra.name] ? it[cur.extra.name] + ' · ' : '';
        const n = (it.images || []).length;
        sp.textContent = (n ? '📷 ' + n + ' ფოტო · ' : '') + ex + (it.text || '');
      }
      t.append(b, sp);
      row.appendChild(t);

      if (!cur.readonly) {
        const ed = document.createElement('button');
        ed.type = 'button'; ed.className = 'ic'; ed.textContent = '✎';
        ed.title = 'რედაქტირება'; ed.setAttribute('aria-label', 'რედაქტირება');
        ed.onclick = () => startEdit(it);
        row.appendChild(ed);
      }

      const del = document.createElement('button');
      del.type = 'button'; del.className = 'ic'; del.textContent = '🗑';
      del.title = 'წაშლა'; del.setAttribute('aria-label', 'წაშლა');
      del.onclick = () => {
        if (!confirm('წაშალოთ ჩანაწერი?')) return;
        SchoolStore.write(cur.key, SchoolStore.read(cur.key).filter(x => x.id !== it.id));
        if (editId === it.id) resetForm();
        render();
      };
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  /* ---------- რედაქტირება ფორმაში ---------- */
  function startEdit(it) {
    editId = it.id;
    $('fTitle').value = it.title || '';
    $('fText').value = it.text || '';
    $('fImage').value = it.image || '';
    gal = (it.images && it.images.slice()) || (it.image ? [it.image] : []);
    renderGallery();
    if (cur.extra) $('fExtra').value = it[cur.extra.name] || '';
    $('saveBtn').textContent = 'ცვლილებების შენახვა';
    $('cancelBtn').hidden = false;
    $('formTitle').textContent = 'რედაქტირება: ' + cur.label;
    $('formBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('fTitle').focus();
  }

  $('cancelBtn').onclick = () => { resetForm(); render(); };

  $('form').addEventListener('submit', e => {
    e.preventDefault();
    const items = SchoolStore.read(cur.key);
    const data = { title: $('fTitle').value.trim(), text: $('fText').value.trim() };
    if (cur.image) data.image = $('fImage').value.trim();
    if (cur.gallery) data.images = gal.slice();
    if (cur.extra) data[cur.extra.name] = $('fExtra').value.trim();

    if (editId) {
      const i = items.findIndex(x => x.id === editId);
      if (i > -1) items[i] = Object.assign({}, items[i], data);
    } else {
      items.unshift(Object.assign({ id: Date.now() }, data));
    }
    SchoolStore.write(cur.key, items);
    resetForm();
    render();
  });

  /* ---------- Cloudinary ---------- */
  $('upBtn').onclick = () => {
    if (!window.cloudinary) {
      alert('Cloudinary ვიჯეტი ვერ ჩაიტვირთა. შეამოწმეთ ინტერნეტი.');
      return;
    }
    if (!widget) {
      widget = cloudinary.createUploadWidget(
        { cloudName: 'dvmiinq4w', uploadPreset: 'school_site', sources: ['local', 'url', 'camera'], multiple: false },
        (err, res) => {
          if (!err && res && res.event === 'success') $('fImage').value = res.info.secure_url;
        }
      );
    }
    widget.open();
  };
});