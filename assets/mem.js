/* Memorabil: livrare estimată și bara de livrare gratuită.
   Fără dependențe. Fiecare element pornește din HTML-ul randat de server și funcționează și fără JavaScript. */

/* ------------------------------------------------------------------ livrare estimată */
const MEM_TZ = 'Europe/Bucharest';

/** Data și ora din România, indiferent de fusul orar al vizitatorului. */
function memNowInRomania() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MEM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') % 24, minute: get('minute') };
}

const memIsoDate = (d) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

class MemDeliveryEstimate extends HTMLElement {
  connectedCallback() {
    this.dateEl = this.querySelector('[data-delivery-date]');
    this.noteEl = this.querySelector('[data-delivery-note]');
    this.stepsEl = this.querySelector('[data-delivery-steps]');
    this.holidays = new Set(
      (this.dataset.holidays || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
    this.render();
    this.timer = window.setInterval(() => this.render(), 60000);
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
  }

  isWorkingDay(date) {
    const dow = date.getUTCDay();
    return dow !== 0 && dow !== 6 && !this.holidays.has(memIsoDate(date));
  }

  addWorkingDays(start, days) {
    const d = new Date(start);
    let added = 0;
    while (added < days) {
      d.setUTCDate(d.getUTCDate() + 1);
      if (this.isWorkingDay(d)) added += 1;
    }
    return d;
  }

  render() {
    const now = memNowInRomania();
    const today = new Date(Date.UTC(now.year, now.month - 1, now.day));
    const cutoff = Number(this.dataset.cutoffHour || 14) * 60;
    const minutesNow = now.hour * 60 + now.minute;
    const production = Math.max(Number(this.dataset.productionDays || 3), 1);
    const transit = Math.max(Number(this.dataset.transitDays || 2), 1);

    // Ziua în care comanda intră în producție: azi, dacă e zi lucrătoare și nu a trecut ora limită.
    const start = new Date(today);
    // Produsele din stoc (data-stock) n-au oră limită: o comandă din ziua asta pleacă la curier în următoarea zi lucrătoare.
    const isStock = this.dataset.stock === 'true';
    const startsToday = this.isWorkingDay(today) && (isStock || minutesNow < cutoff);
    if (!startsToday) {
      do {
        start.setUTCDate(start.getUTCDate() + 1);
      } while (!this.isWorkingDay(start));
    }

    // Ziua de start e prima zi de producție, deci se adaugă (producție − 1) zile lucrătoare până la predarea la curier
    // și (producție + curier − 1) până la livrare. Ex.: comandă vineri seara → start luni → predat miercuri → livrat vineri.
    const dispatched = this.addWorkingDays(start, production - 1);
    const latest = this.addWorkingDays(start, production + transit - 1);

    const dayNames = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
    const monthNames = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const dayNum = (d) => `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]}`;
    const short = (d) => `${dayNames[d.getUTCDay()]}, ${dayNum(d)}`;
    const dayDiff = (d) => Math.round((d.getTime() - today.getTime()) / 86400000);
    const relative = (d) => (dayDiff(d) === 0 ? 'Azi' : dayDiff(d) === 1 ? 'Mâine' : null);
    const label = (d) => relative(d) || short(d);

    if (this.dateEl) this.dateEl.textContent = `Ajunge estimativ ${short(latest)}`;

    const set = (sel, text) => {
      const el = this.querySelector(sel);
      if (el) el.textContent = text;
    };
    set('[data-step-dispatched]', label(dispatched));
    set('[data-step-delivered]', label(latest));
    if (this.stepsEl) this.stepsEl.hidden = false;

    if (!this.noteEl) return;
    const noteText = this.querySelector('[data-delivery-note-text]');
    if (isStock) {
      noteText.textContent = startsToday
        ? 'Comandă azi și pleacă la curier în următoarea zi lucrătoare.'
        : `Comanda pleacă la curier ${relative(dispatched) ? relative(dispatched).toLowerCase() : short(dispatched)}.`;
    } else if (startsToday) {
      const left = cutoff - minutesNow;
      const h = Math.floor(left / 60);
      const m = left % 60;
      const time = h > 0 ? `${h} h ${m} min` : `${m} min`;
      noteText.innerHTML = `Comandă în următoarele <b>${time}</b> ca să fie procesată azi.`;
    } else {
      const startLabel = relative(start) ? relative(start).toLowerCase() : short(start);
      noteText.textContent = `Comanda se procesează ${startLabel}.`;
    }
    this.noteEl.hidden = false;
  }
}

/* ------------------------------------------------------------------ „Economisești X lei” lângă preț */
/* Randat de server pentru varianta aleasă; la schimbarea variantei (eveniment variantChange din temă) se recalculează. */
class MemSavings extends HTMLElement {
  connectedCallback() {
    this.valueEl = this.querySelector('[data-mem-saved]');
    this.container = this.closest('[data-section-type="product-template"]') || this.closest('[data-section-id]');
    this.handler = (event) => this.update(event.detail && event.detail.variant);
    this.container?.addEventListener('variantChange', this.handler);
  }

  disconnectedCallback() {
    this.container?.removeEventListener('variantChange', this.handler);
  }

  update(variant) {
    const saved = variant && variant.compare_at_price > variant.price ? variant.compare_at_price - variant.price : 0;
    this.hidden = saved <= 0;
    if (saved > 0 && this.valueEl) {
      const lei = saved / 100;
      this.valueEl.textContent = Number.isInteger(lei) ? String(lei) : lei.toFixed(2).replace('.', ',');
    }
  }
}

/* ------------------------------------------------------------------ bara de livrare gratuită */
/* Coșul lateral din Streamline se actualizează prin JavaScript, fără să se reîncarce pagina.
   Bara își reface calculul din /cart.js de fiecare dată când se schimbă subtotalul afișat. */
class MemFreeShipping extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.threshold = Number(this.dataset.threshold || 0) * 100;
    this.textEl = this.querySelector('[data-fs-text]');
    this.fillEl = this.querySelector('[data-fs-fill]');
    this.update(Number(this.dataset.total || 0));

    const scope = this.closest('form, .cart, .drawer') || document;
    const subtotal = scope.querySelector('[data-subtotal]');
    if (subtotal) {
      this.observer = new MutationObserver(() => this.refresh());
      this.observer.observe(subtotal, { childList: true, characterData: true, subtree: true });
    }
    ['cart:updated', 'ajaxProduct:added', 'cart:change'].forEach((name) =>
      document.addEventListener(name, () => this.refresh())
    );
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  refresh() {
    window.clearTimeout(this._t);
    this._t = window.setTimeout(() => {
      fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, { headers: { Accept: 'application/json' } })
        .then((r) => r.json())
        .then((cart) => this.update(cart.total_price))
        .catch(() => {});
    }, 150);
  }

  update(totalCents) {
    if (!this.threshold) return;
    const left = Math.max(0, this.threshold - totalCents);
    const progress = Math.min(100, Math.round((totalCents / this.threshold) * 100));
    const reached = left === 0;
    this.hidden = totalCents === 0;
    this.classList.toggle('mem-fs--done', reached);
    if (this.fillEl) this.fillEl.style.width = `${progress}%`;
    const track = this.querySelector('[data-fs-track]');
    if (track) track.setAttribute('aria-valuenow', String(progress));
    const cartEl = this.querySelector('[data-fs-cart]');
    if (cartEl) cartEl.textContent = `${memLei(totalCents)} în coș`;
    const subEl = this.querySelector('[data-fs-sub]');
    if (subEl) {
      subEl.textContent = reached ? 'Transportul e pe noi la comanda asta.' : 'Mai adaugă ceva și transportul e pe noi.';
    }
    if (!this.textEl) return;
    this.textEl.innerHTML = reached
      ? 'Felicitări, ai livrare gratuită!'
      : `Mai ai <strong>${memLei(left)}</strong> până la <strong class="mem-fs__goal">livrare gratuită</strong>`;
  }
}

/* Sumă în lei, fără zecimale când nu e nevoie: 150 lei, 149,90 lei. */
function memLei(cents) {
  return (cents / 100).toLocaleString('ro-RO', {
    minimumFractionDigits: cents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }) + ' lei';
}

/* ------------------------------------------------------------------ coșul lateral */
/* Numărul de produse din titlu, rândul „Livrare” și suma de pe butonul de finalizare
   se refac din /cart.js după orice schimbare în coș. „Șterge” pune cantitatea pe 0. */
(function memCartDrawer() {
  let timer;
  function refresh() {
    const drawer = document.getElementById('CartDrawer');
    if (!drawer) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, { headers: { Accept: 'application/json' } })
        .then((r) => r.json())
        .then((cart) => paint(drawer, cart))
        .catch(() => {});
    }, 150);
  }

  function paint(drawer, cart) {
    const count = drawer.querySelector('[data-mem-cart-count]');
    if (count) count.textContent = `(${cart.item_count})`;
    const total = drawer.querySelector('[data-mem-checkout-total]');
    if (total) total.textContent = cart.item_count > 0 ? ` · ${memLei(cart.total_price)}` : '';
    const ship = drawer.querySelector('[data-mem-ship]');
    const shipValue = drawer.querySelector('[data-mem-ship-value]');
    if (ship && shipValue) {
      const threshold = Number(ship.dataset.threshold || 0) * 100;
      const free = threshold > 0 && cart.total_price >= threshold;
      const cost = Number(ship.dataset.cost || 0) * 100;
      shipValue.textContent = free ? 'Gratuită' : cost > 0 ? memLei(cost) : 'Se calculează la finalizare';
      shipValue.classList.toggle('is-free', free);
    }
  }

  function init() {
    const drawer = document.getElementById('CartDrawer');
    if (!drawer) return;
    const subtotal = drawer.querySelector('[data-subtotal]');
    if (subtotal) {
      new MutationObserver(refresh).observe(subtotal, { childList: true, characterData: true, subtree: true });
    }
    ['cart:updated', 'ajaxProduct:added', 'cart:change'].forEach((name) => document.addEventListener(name, refresh));
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mem-remove]');
    if (!button) return;
    const item = button.closest('.cart__item');
    const input = item && item.querySelector('.js-qty__num');
    if (!input) return;
    event.preventDefault();
    input.value = 0;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ------------------------------------------------------------------ recomandări sub zona produsului */
/* Cere secțiunea mem-recommendations de la Shopify (Product Recommendations), o pune în pagină și leagă butoanele „Adaugă”.
   Adăugarea în coș folosește același eveniment ca butoanele Streamline (ajaxProduct:added): coșul lateral se reface singur,
   se deschide, iar numărul din antet și bara de livrare gratuită se actualizează. */
class MemRecommendations extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const url = this.dataset.url;
    if (!url) return;
    const load = () => {
      fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then((r) => (r.ok ? r.text() : ''))
        .then((html) => {
          if (!html) return;
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const zone = doc.querySelector('[data-mem-recs-section]');
          if (!zone || !zone.querySelector('.mem-recs__card')) return;
          this.innerHTML = '';
          this.append(document.importNode(zone, true));
          this.hidden = false;
          this.bind();
        })
        .catch(() => {});
    };
    load();
  }

  bind() {
    this.querySelectorAll('[data-mem-recs-add]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.add(form);
      });
    });
  }

  add(form) {
    const button = form.querySelector('button');
    const label = form.querySelector('[data-mem-recs-label]');
    if (!button || button.disabled) return;
    const id = Number(form.querySelector('[name="id"]').value);
    const original = label.textContent;
    button.disabled = true;
    button.classList.add('is-loading');
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id, quantity: 1 }),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        button.classList.remove('is-loading');
        if (!ok) {
          label.textContent = 'Indisponibil';
          window.setTimeout(() => { label.textContent = original; button.disabled = false; }, 2200);
          return;
        }
        label.textContent = 'Adăugat ✓';
        button.classList.add('is-added');
        if (window.theme && window.theme.settings && window.theme.settings.cartType === 'page') {
          window.location = window.theme.routes.cartPage;
          return;
        }
        form.dispatchEvent(new CustomEvent('ajaxProduct:added', { detail: { product: data, addToCartBtn: button }, bubbles: true }));
        window.setTimeout(() => {
          label.textContent = original;
          button.classList.remove('is-added');
          button.disabled = false;
        }, 2200);
      })
      .catch(() => {
        button.classList.remove('is-loading');
        label.textContent = original;
        button.disabled = false;
      });
  }
}


if (!customElements.get('mem-delivery-estimate')) customElements.define('mem-delivery-estimate', MemDeliveryEstimate);
if (!customElements.get('mem-savings')) customElements.define('mem-savings', MemSavings);
if (!customElements.get('mem-free-shipping')) customElements.define('mem-free-shipping', MemFreeShipping);
if (!customElements.get('mem-recommendations')) customElements.define('mem-recommendations', MemRecommendations);
