# Memorabil – temă Shopify (Streamline 7.2.0, Archetype Themes)

Magazin: memorabil.ro (MEMORABIL MEDIA S.R.L.). Tricouri, hanorace, căni și tote bags cu sloganuri amuzante în română,
imprimate la comandă (print on demand) de un partener din București, care le și livrează.
Slogan: „Replici care se poartă.” Brand statement: „Pentru că nu ne stă bine să tăcem.”
(Vechiul slogan „Ușor de purtat. Greu de uitat.” nu se mai folosește.)
Unde apar: imaginea mare și „De ce Memorabil” de pe prima pagină, banda care se derulează, pagina Despre noi,
finalul Manifestului și Organization din snippets/structured-data.liquid (datele pentru Google, doar pe prima pagină).

## Ce e custom (prefix mem-)
- snippets/mem-delivery.liquid + assets/mem.js: „Ajunge estimativ …” = zile de producție + zile de curier (zile lucrătoare; ziua în care începe producția e prima zi)
- snippets/mem-badges.liquid: Nou / Bestseller (tag) / Reducere
- snippets/mem-sale-pill.liquid: stickerul roșu „−X%” (#e1251b) din colțul stânga sus al pozei, pe cardurile de produs (product-grid-item.liquid, în locul etichetei „Reducere” Streamline) și pe prima poză din pagina produsului (product-images.liquid). Stilurile în mem.css (.mem-sale-pill).
- snippets/mem-details-tabs.liquid: tab-urile Detalii și materiale, Îngrijire, Siguranța produsului.
  Valoarea de pe produs (metafield custom.*) are prioritate; altfel se folosește valoarea comună din setările blocului
  „Memorabil: tab-uri” din fiecare șablon de produs.
- snippets/mem-free-shipping.liquid: cardul de livrare gratuită (coral sub prag, albastru deschis peste prag, cu bară de progres), sus în coșul lateral și pe pagina coșului (se actualizează din /cart.js)
- Coșul lateral (snippets/cart-drawer.liquid și cart-item.liquid, Streamline modificat; stiluri în mem.css, #CartDrawer; JS în mem.js): titlul „Coșul tău (N)”, butoane +/− mari, link „Șterge”, cardul „Preferi lockerul?” (snippets/mem-locker-note.liquid, și pe pagina coșului) cu nota mereu deschisă, rândul „Livrare” (Gratuită / 19 lei) și butonul „Finalizează comanda · X lei” cu lacăt. Design: https://claude.ai/artifact/9g4QnBsAwY9xu2amaV7Wem
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
- sections/mem-footer.liquid + assets/mem-footer.css: subsolul (în sections/footer-group.json; vechiul „footer” Streamline e dezactivat, nu șters).
  Coloanele vin din meniurile subsol-magazin, subsol-ajutor, subsol-memorabil, subsol-legal (Online Store → Navigation).
- Prima pagină: sections/mem-spotlight (un produs pe card albastru), mem-quotes (bandă albastră cu replici-produs),
  mem-numbers (bandă albastră cu cifre) + assets/mem-home.css (și retușuri la titlurile și avantajele de pe prima pagină).
  Nu publica recenzii sau citate de clienți inventate; doar recenzii reale, dintr-o aplicație de recenzii.
- sections/mem-showcase.liquid („Memorabil: produs vedetă”, stiluri .mh-show în mem-home.css): zonă specială pe prima pagină (după avantaje)
  pentru un produs, cu titlu, text, preț, „Vezi produsul” + „Adaugă în coș” și pozele produsului (mozaic pe desktop, primele 5;
  rând care se derulează pe telefon). Acum: Stickerele Tribunului. Produsul și textele se schimbă din Customize.
- sections/mem-noutati.liquid: caruselul „Noutăți” de pe prima pagină (înainte de felicitări): cele mai noi 20 de produse, după data
  adăugării, fără nimic de setat în admin (ia până la 250 de produse și le ordonează în temă). Ascunde produsele epuizate.
  Opțional se poate alege o colecție (atunci se păstrează ordinea ei). Cardurile și caruselul sunt cele din Streamline.
- sections/mem-recommendations.liquid + assets/mem-recommendations.css + elementul `mem-recommendations` din assets/mem.js: zona „Ți-ar mai plăcea și” chiar sub zona principală a fiecărui produs (secțiunea mem_recs, imediat după „main”, în toate șabloanele product*.json în afară de gift-card). Folosește recomandările Shopify (Product Recommendations, setările titlu, număr 4–10, tip „related”/„complementary”; complementary merge doar cu Search & Discovery). Nu spune că alții au cumpărat. Rând de carduri care se derulează (snap): poză pătrată, titlu pe max 2 rânduri, preț (cu prețul vechi tăiat), buton. Produs cu o singură variantă: „Adaugă” (POST /cart/add.js, apoi evenimentul `ajaxProduct:added`, deci se deschide coșul lateral, se actualizează numărul din antet și bara de livrare gratuită). Cu mai multe variante: „Alege mărimea” spre produs. Epuizatele nu apar; fără recomandări, zona rămâne ascunsă. Secțiunea Streamline „product-recommendations” e dezactivată în șabloane, nu ștearsă.
- snippets/mem-product-jsonld.liquid: datele structurate pentru Google (randat din product-template-variables.liquid)
- Blocurile noi sunt declarate în sections/main-product.liquid și randate în snippets/product-template.liquid
- sections/mem-collection-header.liquid + assets/mem-collection.css: antetul colecțiilor, un card albastru-deschis cu numele și descrierea colecției (ghilimele mari ” ca decor), în toate șabloanele de colecție (secțiunea mem_header); „collection-header” Streamline e dezactivat, nu șters.
- Cadranele albe din subsol (blocurile „Avantaj” din „Memorabil: subsol”, max 4): livrare, imprimare, retur, plată. Textele trebuie să rămână adevărate (prag și cost livrare ca în Theme settings → Memorabil).
- sections/mem-subscribe.liquid + assets/mem-subscribe.css + assets/mem-val-1.svg / mem-val-2.svg: newsletterul de pe prima pagină (card albastru-deschis cu două valuri, formular de client cu tag-urile prospect,newsletter și bifă pentru Politica de confidențialitate). Înlocuiește secțiunea „newsletter” Streamline, dezactivată, nu ștearsă.
- Setări: Theme settings → Memorabil (prag livrare gratuită, cost livrare, zile de producție/livrare, ora limită, zile libere)

## Livrare (din 19 noiembrie 2026)
O singură metodă: 19 lei, acasă sau la un locker al curierului preferat, gratuit peste 300 de lei. Nu numi brandurile de
lockere. AWB-urile le face George (el alege unde și cum se livrează); partenerul doar predă coletul curierului.
Pentru locker, clientul scrie în coș, în cardul „Preferi lockerul?”, orașul, curierul și lockerul; textul ajunge ca notă
în comandă. În checkout nu se poate adăuga un câmp (ar cere Shopify Plus): descrierea metodei de livrare și emailul de
confirmare spun și ele asta. mem_shipping_cost (19) și pragul trebuie să fie egale cu tarifele din admin.

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
