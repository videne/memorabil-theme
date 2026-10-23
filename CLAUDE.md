# Memorabil – temă Shopify (Streamline 7.2.0, Archetype Themes)

Magazin: memorabil.ro (MEMORABIL MEDIA S.R.L.). Tricouri, hanorace, căni și tote bags cu sloganuri amuzante în română,
imprimate la comandă (print on demand) de un partener din București, care le și livrează.
Slogan: „Replici care se poartă.” Brand statement: „Pentru că nu ne stă bine să tăcem.”
(Vechiul slogan „Ușor de purtat. Greu de uitat.” nu se mai folosește.)
Unde apar: imaginea mare și „De ce Memorabil” de pe prima pagină, banda care se derulează, pagina Despre noi,
finalul Manifestului și Organization din snippets/structured-data.liquid (datele pentru Google, doar pe prima pagină).

## Ce e custom (prefix mem-)
- snippets/mem-delivery.liquid + assets/mem.js: „Ajunge cel târziu …” = zile de producție + zile de curier (zile lucrătoare)
- snippets/mem-badges.liquid: Nou / Bestseller (tag) / Reducere
- snippets/mem-details-tabs.liquid: tab-urile Detalii și materiale, Îngrijire, Siguranța produsului.
  Valoarea de pe produs (metafield custom.*) are prioritate; altfel se folosește valoarea comună din setările blocului
  „Memorabil: tab-uri” din fiecare șablon de produs.
- snippets/mem-free-shipping.liquid: bara de livrare gratuită în coșul lateral și pe pagina coșului (se actualizează din /cart.js)
- snippets/structured-data.liquid (Streamline, modificat): Organization cu sloganul + WebSite pe prima pagină, BreadcrumbList pe colecții și produse.
  Nu adăuga alt Organization în altă parte, ar fi dublat.
- sections/mem-manifest.liquid + templates/page.manifest.json + assets/mem-manifest.css: pagina Despre noi (manifestul).
  Textul e în conținutul paginii „Despre noi”, cu clase mm-*. /pages/manifest e redirecționat spre /pages/despre-noi.
- sections/mem-contact.liquid + templates/page.contact.json + assets/mem-contact.css: pagina Contact (textele se schimbă din Customize)
- sections/mem-page.liquid + templates/page.info.json + assets/mem-page.css: paginile de informații (livrare, retur, termeni,
  confidențialitate, cookie-uri, întrebări frecvente, ghiduri de mărimi). Textul e în conținutul paginii, cu clase mp-*
  (mp-lead, mp-facts, mp-steps, mp-note, mp-faq cu <details>, mp-table-wrap, mp-figure); cuprinsul se face singur din h2.
  Paginile tabel-marimi-tricouri și tabel-marimi-hanorace apar și în fereastra „Tabel mărimi” de pe produs
  (blocul size_chart din șabloanele tricouri, alexa-lincu-tricouri, hanorac); stilurile pentru fereastră sunt în mem.css (.tool-tip__content).
  Politicile din Shopify admin (Settings → Policies, apar în checkout) trebuie ținute la zi manual, cu aceleași texte.
- snippets/mem-product-jsonld.liquid: datele structurate pentru Google (randat din product-template-variables.liquid)
- Blocurile noi sunt declarate în sections/main-product.liquid și randate în snippets/product-template.liquid
- Setări: Theme settings → Memorabil (prag livrare gratuită, zile de producție/livrare, ora limită, zile libere)

## Șabloane de produs
tricouri, alexa-lincu-tricouri, hanorac, cani, tote-bag și product.json (implicit).
Fiecare produs alege șablonul din admin (Theme template). Hanoracele folosesc „hanorac”.

## Limbă
Limba principală a magazinului e „en”, dar toate textele din locales/en.default.json sunt în română.
Nu traduce în engleză. Atenție: în română first name = Prenume, last name = Nume.

## Reguli
- Nu modifica fișierele Streamline decât dacă e necesar; preferă fișiere mem-.
- ID-urile blocurilor trebuie să fie unice în fiecare șablon JSON. „unit” la range: maximum 3 caractere.
- „name” la blocuri și secțiuni: maximum 25 de caractere (altfel Shopify respinge secțiunea și toate șabloanele care o folosesc).
- Shopify reîncearcă un fișier respins la sincronizare doar când acel fișier se schimbă.
- Pull request cu rezumat în română, pe înțelesul cuiva care nu e programator.
