const fallbackTimeZones = [
  "Europe/Warsaw", "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Prague", "Europe/Vienna", "Europe/Zurich",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Toronto", "America/Vancouver", "America/Sao_Paulo", "America/Bogota", "America/Mexico_City",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore", "Asia/Bangkok", "Asia/Dubai", "Asia/Kolkata", "Asia/Kathmandu", "Asia/Jakarta",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Nairobi", "Africa/Lagos", "Africa/Casablanca", "Africa/Algiers",
  "Australia/Sydney", "Australia/Melbourne", "Australia/Perth", "Australia/Brisbane", "Pacific/Auckland", "Pacific/Honolulu", "Pacific/Fiji",
  "UTC", "Etc/GMT+1", "Etc/GMT+2", "Etc/GMT+3", "Etc/GMT+4", "Etc/GMT+5", "Etc/GMT+6", "Etc/GMT+7", "Etc/GMT+8", "Etc/GMT+9"
];

const countryToZone = {
  PL: "Europe/Warsaw", DE: "Europe/Berlin", FR: "Europe/Paris", ES: "Europe/Madrid", IT: "Europe/Rome", GB: "Europe/London", NL: "Europe/Amsterdam",
  BE: "Europe/Brussels", AT: "Europe/Vienna", CH: "Europe/Zurich", CZ: "Europe/Prague", SK: "Europe/Bratislava", HU: "Europe/Budapest", RO: "Europe/Bucharest",
  BG: "Europe/Sofia", GR: "Europe/Athens", FI: "Europe/Helsinki", SE: "Europe/Stockholm", NO: "Europe/Oslo", DK: "Europe/Copenhagen", IE: "Europe/Dublin",
  PT: "Europe/Lisbon", UA: "Europe/Kyiv", LT: "Europe/Vilnius", LV: "Europe/Riga", EE: "Europe/Tallinn", IS: "Atlantic/Reykjavik", TR: "Europe/Istanbul",
  US: "America/New_York", CA: "America/Toronto", MX: "America/Mexico_City", BR: "America/Sao_Paulo", AR: "America/Argentina/Buenos_Aires", CL: "America/Santiago",
  CO: "America/Bogota", PE: "America/Lima", VE: "America/Caracas", UY: "America/Montevideo", PY: "America/Asuncion", BO: "America/La_Paz",
  JP: "Asia/Tokyo", KR: "Asia/Seoul", CN: "Asia/Shanghai", HK: "Asia/Hong_Kong", TW: "Asia/Taipei", SG: "Asia/Singapore", MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok", VN: "Asia/Ho_Chi_Minh", ID: "Asia/Jakarta", PH: "Asia/Manila", IN: "Asia/Kolkata", PK: "Asia/Karachi", BD: "Asia/Dhaka",
  NP: "Asia/Kathmandu", LK: "Asia/Colombo", AE: "Asia/Dubai", SA: "Asia/Riyadh", IL: "Asia/Jerusalem", IR: "Asia/Tehran", IQ: "Asia/Baghdad",
  EG: "Africa/Cairo", ZA: "Africa/Johannesburg", NG: "Africa/Lagos", KE: "Africa/Nairobi", MA: "Africa/Casablanca", DZ: "Africa/Algiers", GH: "Africa/Accra",
  AU: "Australia/Sydney", NZ: "Pacific/Auckland", FJ: "Pacific/Fiji", PG: "Pacific/Port_Moresby"
};

const countryToLanguage = {
  PL: "pl", DE: "de", FR: "fr", ES: "es", JP: "jp", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", VE: "es", UY: "es", PY: "es", BO: "es",
  AT: "de", CH: "de", BE: "fr", CA: "en", US: "en", GB: "en", AU: "en", NZ: "en", IE: "en", ZA: "en"
};

const regionCodes = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ",
  "CA","CD","CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ","FM",
  "FR","GA","GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY","HN","HR","HT","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KG",
  "KH","KI","KM","KN","KP","KR","KW","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MR",
  "MT","MU","MV","MW","MX","MY","MZ","NA","NE","NG","NI","NL","NO","NP","NR","NZ","OM","PA","PE","PG","PH","PK","PL","PT","PY","QA","RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY","SZ","TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW",
  "TZ","UA","UG","US","UY","UZ","VA","VC","VE","VN","VU","WS","YE","ZA","ZM","ZW"
];

function getDisplayNames() {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
}

export function getTimeZoneOptions() {
  try {
    const values = Intl.supportedValuesOf("timeZone");
    return values && values.length >= 50 ? values : fallbackTimeZones;
  } catch {
    return fallbackTimeZones;
  }
}

export function getCountryOptions(locale = "en") {
  const display = getDisplayNames();

  return regionCodes
    .map((code) => {
      let name = code;
      if (display) {
        name = display.of(code) || code;
      }
      const flag = code
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
      return { code, label: `${flag} ${name}` };
    })
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

export function getDefaultTimeZoneForCountry(countryCode) {
  return countryToZone[countryCode] || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getLanguageForCountry(countryCode) {
  return countryToLanguage[countryCode] || "en";
}

function formatInZone(date, timeZone, options = {}) {
  return new Intl.DateTimeFormat(undefined, { timeZone, ...options }).format(date);
}

export function buildClockTicks(ticksGroup) {
  if (!ticksGroup) {
    return;
  }

  ticksGroup.innerHTML = "";
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const x1 = 100 + Math.cos(angle) * 68;
    const y1 = 100 + Math.sin(angle) * 68;
    const x2 = 100 + Math.cos(angle) * 78;
    const y2 = 100 + Math.sin(angle) * 78;

    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", String(x1));
    tick.setAttribute("y1", String(y1));
    tick.setAttribute("x2", String(x2));
    tick.setAttribute("y2", String(y2));
    tick.setAttribute("stroke", "rgba(255,255,255,0.5)");
    tick.setAttribute("stroke-width", i % 3 === 0 ? "2" : "1");
    tick.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(tick);
  }
}

export function createClockController(elements) {
  const {
    digitalClock,
    fullDate,
    zoneLabel,
    hourHand,
    minuteHand,
    secondHand,
    worldClocksContainer
  } = elements;

  let timer = null;

  function getParts(timeZone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long"
    });

    const parts = formatter.formatToParts(now);
    const read = (type) => parts.find((item) => item.type === type)?.value || "00";

    return {
      now,
      h: Number(read("hour")),
      m: Number(read("minute")),
      s: Number(read("second")),
      dayName: read("weekday"),
      day: read("day"),
      month: read("month"),
      year: read("year")
    };
  }

  function renderMain(timeZone) {
    const { h, m, s, dayName, day, month, year } = getParts(timeZone);

    if (digitalClock) {
      digitalClock.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    if (fullDate) {
      fullDate.textContent = `${dayName}, ${day}.${month}.${year}`;
    }

    if (zoneLabel) {
      zoneLabel.textContent = timeZone;
    }

    const hourAngle = (h % 12) * 30 + m * 0.5;
    const minuteAngle = m * 6 + s * 0.1;
    const secondAngle = s * 6;

    hourHand?.setAttribute("transform", `rotate(${hourAngle} 100 100)`);
    minuteHand?.setAttribute("transform", `rotate(${minuteAngle} 100 100)`);
    secondHand?.setAttribute("transform", `rotate(${secondAngle} 100 100)`);
  }

  function renderWorld(worldClocks = []) {
    if (!worldClocksContainer) {
      return;
    }

    worldClocksContainer.innerHTML = "";

    if (!worldClocks.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Brak dodatkowych zegarow.";
      worldClocksContainer.appendChild(empty);
      return;
    }

    worldClocks.slice(0, 4).forEach((timeZone) => {
      const item = document.createElement("article");
      item.className = "world-clock-item";

      const main = document.createElement("div");
      const name = document.createElement("small");
      name.textContent = timeZone;
      const time = document.createElement("strong");
      time.textContent = formatInZone(new Date(), timeZone, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

      main.append(name, time);
      item.appendChild(main);
      worldClocksContainer.appendChild(item);
    });
  }

  function start(getSettings) {
    function tick() {
      const settings = getSettings();
      renderMain(settings.timeZone);
      renderWorld(settings.worldClocks || []);
    }

    tick();
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(timer);
  }

  return { start, stop, renderMain, renderWorld };
}
