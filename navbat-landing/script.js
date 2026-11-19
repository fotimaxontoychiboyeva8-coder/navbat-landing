(function () {
  'use strict';

  /* ---- Navbat demo taxtasi ---- */
  var names = ['Aziz', 'Madina', 'Jasur', 'Nilufar', 'Sardor', 'Zilola', 'Bekzod', 'Malika', 'Otabek', 'Dilnoza'];
  var services = ['Soch olish', 'Soqol', 'Bo‘yash', 'Soch olish', 'Konsultatsiya'];
  var number = 24;
  var now = document.getElementById('now');
  var queue = document.getElementById('queue');
  var btn = document.getElementById('nextBtn');
  var timer;

  function pad(n) { return 'A-' + n; }
  function personFor(n) { return names[n % names.length]; }
  function serviceFor(n) { return services[n % services.length]; }

  function render() {
    now.textContent = pad(number);
    now.classList.remove('flip');
    void now.offsetWidth;
    now.classList.add('flip');
    queue.innerHTML = '';
    for (var i = 1; i <= 3; i++) {
      var n = number + i;
      var li = document.createElement('li');
      var a = document.createElement('span');
      var b = document.createElement('span');
      a.textContent = pad(n) + ' · ' + personFor(n);
      b.textContent = i === 1 ? 'keyingi' : serviceFor(n);
      li.appendChild(a);
      li.appendChild(b);
      queue.appendChild(li);
    }
  }

  function next() { number += 1; render(); }
  function auto() { clearInterval(timer); timer = setInterval(next, 5000); }

  if (now && queue && btn) {
    render();
    btn.addEventListener('click', function () { next(); auto(); });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) auto();
  }

  /* ---- Tarif davri ---- */
  var toggles = document.querySelectorAll('.toggle button');
  var amounts = document.querySelectorAll('.amount');
  var note = document.getElementById('billNote');

  function fmt(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  toggles.forEach(function (t) {
    t.addEventListener('click', function () {
      var period = t.getAttribute('data-period');
      toggles.forEach(function (o) {
        var on = o === t;
        o.classList.toggle('on', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      amounts.forEach(function (a) { a.textContent = fmt(a.getAttribute('data-' + period)); });
      note.textContent = period === 'year'
        ? 'Yillik to‘lovda narx oyiga hisoblab ko‘rsatilgan (−20%).'
        : 'Narxlar oylik to‘lov uchun ko‘rsatilgan.';
    });
  });

  /* Tarif tugmasi -> formada tarif tanlanadi */
  var planSelect = document.getElementById('plan');
  document.querySelectorAll('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () { planSelect.value = a.getAttribute('data-plan'); });
  });

  /* ---- Obuna formasi ---- */
  var form = document.getElementById('subForm');
  var ok = document.getElementById('ok');

  function setErr(id, msg) {
    var el = form.querySelector('.err[data-for="' + id + '"]');
    var input = document.getElementById(id);
    if (el) el.textContent = msg;
    if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validContact(v) {
    var email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    var digits = v.replace(/\D/g, '');
    var phone = /^[+\d\s()-]+$/.test(v) && digits.length >= 9 && digits.length <= 12;
    return email || phone;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ok.hidden = true;
    var name = form.name.value.trim();
    var contact = form.contact.value.trim();
    var agree = document.getElementById('agree').checked;
    var good = true;

    setErr('name', ''); setErr('contact', ''); setErr('agree', '');
    if (name.length < 2) { setErr('name', 'Ismingizni kiriting.'); good = false; }
    if (!validContact(contact)) { setErr('contact', 'To‘g‘ri email yoki telefon raqam kiriting.'); good = false; }
    if (!agree) { setErr('agree', 'Davom etish uchun rozilik bering.'); good = false; }
    if (!good) return;

    /* Haqiqiy serverga ulash uchun shu yerda fetch() ishlatiladi (README ga qarang). */
    var saved = JSON.parse(localStorage.getItem('navbat_subs') || '[]');
    saved.push({ name: name, contact: contact, plan: form.plan.value, date: new Date().toISOString() });
    localStorage.setItem('navbat_subs', JSON.stringify(saved));

    ok.textContent = 'Rahmat, ' + name + '! ' + form.plan.value + ' tarifi bo‘yicha kirish havolasini tez orada yuboramiz.';
    ok.hidden = false;
    form.reset();
    planSelect.value = 'Biznes';
  });
})();
