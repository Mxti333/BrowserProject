const translations = {
  pl: {
    search: "Szukaj",
    clock: "Zegar",
    recent: "Ostatnio odwiedzone",
    quick_access: "Quick Access"
  },
  en: {
    search: "Search",
    clock: "Clock",
    recent: "Recently visited",
    quick_access: "Quick Access"
  },
  de: {
    search: "Suchen",
    clock: "Uhr",
    recent: "Zuletzt besucht",
    quick_access: "Schnellzugriff"
  },
  fr: {
    search: "Rechercher",
    clock: "Horloge",
    recent: "Recemment visites",
    quick_access: "Acces rapide"
  },
  es: {
    search: "Buscar",
    clock: "Reloj",
    recent: "Visitados recientemente",
    quick_access: "Acceso rapido"
  },
  jp: {
    search: "??",
    clock: "??",
    recent: "???????",
    quick_access: "????????"
  }
};

const languageOptions = [
  { code: "pl", label: "Polski" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Francais" },
  { code: "es", label: "Espanol" },
  { code: "jp", label: "???" }
];

let currentLanguage = "pl";

export function getLanguageOptions() {
  return languageOptions.slice();
}

export function setLanguage(language) {
  if (translations[language]) {
    currentLanguage = language;
  }
}

export function getLanguage() {
  return currentLanguage;
}

export function translate(key) {
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = translate(key);
  });
}
