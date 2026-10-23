# Memorabil – temă Shopify (Streamline 7.2.0, Archetype Themes)

Magazin: memorabil.ro (MEMORABIL MEDIA S.R.L.). Tricouri, hanorace, căni și tote bags cu sloganuri amuzante în română,
imprimate la comandă (print on demand) de un partener din București, care le și livrează.
Slogan: „Ușor de purtat. Greu de uitat.”

## Ce e custom (prefix mem-)
- snippets/mem-delivery.liquid + assets/mem.js: „Ajunge cel târziu …” = zile de producție + zile de curier (zile lucrătoare)
- snippets/mem-badges.liquid: Nou / Bestseller (tag) / Reducere
- snippets/mem-details-tabs.liquid: tab-urile Detalii și materiale, Îngrijire, Siguranța produsului.
  Valoarea de pe produs (metafield custom.*) are prioritate; altfel se folosește valoarea comună din setările blocului
  „Memorabil: tab-uri din câmpuri” din fiecare șablon de produs.
- snippets/mem-free-shipping.liquid: bara de livrare gratuită în coșul lateral și pe pagina coșului (se actualizează din /cart.js)
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
- Shopify reîncearcă un fișier respins la sincronizare doar când acel fișier se schimbă.
- Pull request cu rezumat în română, pe înțelesul cuiva care nu e programator.
