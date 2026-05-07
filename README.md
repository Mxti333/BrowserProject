# NEXORA Browser

NEXORA to statyczna aplikacja webowa (HTML + CSS + Vanilla JS) stylizowana na futurystyczna przegladarke.
Tagline: **Beyond the Horizon**.

## Najwazniejsze funkcje

- Multi-tab (do 15 kart), drag and drop, favicon, zamykanie z animacja
- Pasek adresu z autouzupelnianiem, detekcja URL/frazy i fallback iframe -> nowa karta systemowa
- New tab page: particles canvas, model 3D Three.js (TorusKnot), zegar cyfrowy + analogowy, world clocks
- Quick Access (8 kafelkow) z menu kontekstowym: otworz/edytuj/usun
- Ostatnio odwiedzone (poziomy scroll)
- Ustawienia live update (bez przycisku zapisu): motyw, kolor akcentu, font, zoom, jezyk, kraj, timezone, tapeta
- Tapeta custom z dysku (base64 + kompresja >2MB), dim/blur/fit + presety
- i18n: PL/EN/DE/FR/ES/JP
- Tryb incognito (sesyjny, brak zapisu historii), Reader Mode, PiP, Find Bar, DevTools (symulowany), Extensions Manager (symulowany)
- Pelna responsywnosc: desktop/tablet/mobile

## Struktura plikow

```text
index.html
css/
  style.css
  themes.css
  animations.css
  glassmorphism.css
  responsive.css
js/
  app.js
  tabs.js
  settings.js
  i18n.js
  themes.js
  shortcuts.js
  history.js
  particles.js
  three-scene.js
  clock.js
  wallpaper.js
  notifications.js
README.md
```

## Uruchomienie lokalne

1. Otworz `index.html` w przegladarce.
2. Dla stabilniejszych testow iframe uruchom prosty serwer statyczny (np. Live Server).

## Deploy na GitHub Pages

1. Wrzuc repozytorium na GitHub.
2. Wejdz w: `Settings -> Pages`.
3. `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: `main`, folder: `/ (root)`
4. Zapisz i poczekaj na publikacje.
5. Otworz adres GitHub Pages.

## Ograniczenia techniczne

- Czesci witryn nie pozwalaja na osadzanie w iframe (CSP/X-Frame-Options). Wtedy NEXORA automatycznie otwiera URL w nowej karcie systemowej.
- Reader mode i find on page dla cross-origin sa symulowane (ograniczenia bezpieczenstwa przegladarki).
- Aplikacja nie posiada backendu - wszystko dziala po stronie klienta.
