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
    const production = Number(this.dataset.productionDays || 3);
    const transit = Number(this.dataset.transitDays || 2);

    // Ziua în care comanda intră în producție: azi, dacă e zi lucrătoare și nu a trecut ora limită.
    let start = new Date(today);
    const startsToday = this.isWorkingDay(today) && minutesNow < cutoff;
    if (!startsToday) {
      do {
        start.setUTCDate(start.getUTCDate() + 1);
      } while (!this.isWorkingDay(start));
    }

    // Termenul maxim: producția plus livrarea, numărate în zile lucrătoare de la ziua de start.
    const latest = this.addWorkingDays(start, production + transit);
    const fmt = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

    if (this.dateEl) {
      this.dateEl.textContent = `Ajunge cel târziu ${fmt.format(latest)}`;
    }

    if (!this.noteEl) return;
    if (startsToday) {
      const left = cutoff - minutesNow;
      const h = Math.floor(left / 60);
      const m = left % 60;
      const time = h > 0 ? `${h} h ${m} min` : `${m} min`;
      this.noteEl.innerHTML = `dacă plasezi comanda în următoarele <b>${time}</b>. Imprimăm produsul special pentru tine.`;
    } else {
      this.noteEl.textContent = 'dacă plasezi comanda acum. Imprimăm produsul special pentru tine.';
    }
    this.noteEl.hidden = false;
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
    this.hidden = totalCents === 0;
    if (this.fillEl) this.fillEl.style.width = `${progress}%`;
    if (!this.textEl) return;
    if (left === 0) {
      this.textEl.innerHTML = '<strong>Livrarea e gratuită.</strong>';
    } else {
      const lei = (left / 100).toLocaleString('ro-RO', { minimumFractionDigits: left % 100 ? 2 : 0, maximumFractionDigits: 2 });
      this.textEl.innerHTML = `Mai ai <strong>${lei} lei</strong> până la livrare gratuită.`;
    }
  }
}

if (!customElements.get('mem-delivery-estimate')) customElements.define('mem-delivery-estimate', MemDeliveryEstimate);
if (!customElements.get('mem-free-shipping')) customElements.define('mem-free-shipping', MemFreeShipping);
