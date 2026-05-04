window.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Sten & Chrissy - Wedding Invite
  // app.js (clean & working)
  // =============================

  const CONFIG = {
    weddingDateISO: "2027-05-21T13:00:00+02:00",
    dateText: "Vrijdag 21 mei 2027",
    locationText: "Landgoed Rhederoord, De Steeg",
    mapsQuery: "Landgoed Rhederoord, De Steeg",
    rsvpDeadlineText: "31 december 2026",
    copyAddressText: "Parkweg 19, 6994 CM De Steeg",

    // tijden die je wil tonen in pill
    dayStart: "13:30",
    eveningStart: "20:30",

    dresscode:
      "Feestelijk, zomers & comfortabel ✨ Denk aan summer chic of cocktail chic. Draag vooral iets waar je je mooi in voelt.",

    overnightHint:
      "Overnachting is optioneel (1 nacht) tegen €50 p.p. — inclusief ontbijt van 9:00 tot 10:30 • check-out om 10:30."
  };

  // ===== Elements =====
  const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbz9BglxU3baverTDpz3Ty3
  const gate = document.getElementById("gate");
  const protectedWrap = document.getElementById("protected");
  const gateMsg = document.getElementById("gateMsg");
  const codeForm = document.getElementById("codeForm");
  const codeInput = document.getElementById("codeInput");

  const youPronounHero = document.getElementById("youPronounHero");
  const youGift1 = document.getElementById("youGift1");
  const youGift2 = document.getElementById("youGift2");
  const youGiftVerb = document.getElementById("youGiftVerb");

  const guestTypePill = document.getElementById("guestTypePill");
  const startTimePill = document.getElementById("startTimePill");

  const helloText = document.getElementById("helloText");
  const dateText = document.getElementById("dateText");
  const locationText = document.getElementById("locationText");
  const dresscodeText = document.getElementById("dresscodeText");

  const mapsBtn = document.getElementById("mapsBtn");
  const copyAddressBtn = document.getElementById("copyAddressBtn");
  const copyMsg = document.getElementById("copyMsg");

  const locationImg = document.getElementById("locationImg");
  const locationFallback = document.getElementById("locationFallback");
  const usImg = document.getElementById("usImg");
  const usFallback = document.getElementById("usFallback");

  const menuSection = document.getElementById("menuSection");
  const afterpartyRow = document.getElementById("afterpartyRow");
  const overnightRow = document.getElementById("overnightRow");
  const dayTimesNote = document.getElementById("dayTimesNote");

  const rsvpDeadline = document.getElementById("rsvpDeadline");
  const rsvpIntro = document.getElementById("rsvpIntro");
  const optYes = document.getElementById("optYes");
  const optNo = document.getElementById("optNo");

  const inviteToken = document.getElementById("inviteToken");
  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpMsg = document.getElementById("rsvpMsg");
  const attending = document.getElementById("attending");
  const peopleWrap = document.getElementById("peopleWrap");
  const people = document.getElementById("people");
  const peopleHint = document.getElementById("peopleHint");
  const overnightWrap = document.getElementById("overnightWrap");
  const overnight = document.getElementById("overnight");
  const overnightHint = document.getElementById("overnightHint");
  const notes = document.getElementById("notes");

  const dEl = document.getElementById("d");
  const hEl = document.getElementById("h");
  const mEl = document.getElementById("m");
  const sEl = document.getElementById("s");

  let COPY_STATE = { single: false, isDay: false };

  // ===== Basic validations =====
  if (!window.INVITES) {
    console.error("window.INVITES is undefined. Zorg dat invites.js vóór app.js wordt geladen.");
    if (gateMsg) gateMsg.textContent = "Er ging iets mis: invites.js is niet geladen.";
    return;
  }

  if (!codeForm || !codeInput) {
    console.error("codeForm/codeInput niet gevonden. Check IDs in index.html.");
    return;
  }

  // ===== Helpers =====
  function normalize(v) {
    return (v || "").trim().toUpperCase();
  }

  function getTokenFromUrl() {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    return token ? normalize(token) : "";
  }

  function isSingleInvite(invite) {
    return Number(invite?.maxPeople) === 1;
  }

  function applyCopy(invite) {
    const single = isSingleInvite(invite);

    if (youPronounHero) youPronounHero.textContent = single ? "je" : "jullie";
    if (youGift1) youGift1.textContent = single ? "je" : "jullie";
    if (youGift2) youGift2.textContent = single ? "je" : "jullie";
    if (youGiftVerb) youGiftVerb.textContent = single ? "bent" : "zijn";

    if (optYes) optYes.textContent = single ? "Ja, ik kom" : "Ja, wij komen";
    if (optNo) optNo.textContent = "Nee, helaas";
    if (rsvpIntro) rsvpIntro.textContent = "Laat het ons weten";

    return single;
  }

  function setDayOnlyVisibility(isDay) {
    // alles met class dayOnly wordt verborgen voor avondgasten
    document.querySelectorAll(".dayOnly").forEach((el) => {
      el.classList.toggle("hidden", !isDay);
    });

    // extra zekerheid
    if (menuSection) menuSection.classList.toggle("hidden", !isDay);
    if (afterpartyRow) afterpartyRow.classList.toggle("hidden", !isDay);
    if (overnightRow) overnightRow.classList.toggle("hidden", !isDay);
    if (overnightWrap) overnightWrap.classList.toggle("hidden", !isDay);
    if (dayTimesNote) dayTimesNote.classList.toggle("hidden", !isDay);
  }

  function startCountdown(targetISO) {
    const target = new Date(targetISO).getTime();

    const tick = () => {
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * (1000 * 60);
      const secs = Math.floor(diff / 1000);

      if (dEl) dEl.textContent = String(days);
      if (hEl) hEl.textContent = String(hours).padStart(2, "0");
      if (mEl) mEl.textContent = String(mins).padStart(2, "0");
      if (sEl) sEl.textContent = String(secs).padStart(2, "0");
    };

    tick();
    setInterval(tick, 1000);
  }

  function configureMaps() {
    if (!mapsBtn) return;
    const q = encodeURIComponent(CONFIG.mapsQuery);
    mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function setPeopleVisibility() {
    const isYes = attending?.value === "yes";
    if (peopleWrap) peopleWrap.style.display = isYes ? "block" : "none";
    if (!isYes && people) people.value = "1";
  }

  function setupImageFallback(imgEl, fallbackEl) {
    if (!imgEl || !fallbackEl) return;

    // default: hide fallback, show it only on error
    fallbackEl.classList.add("hidden");

    imgEl.addEventListener("load", () => fallbackEl.classList.add("hidden"));
    imgEl.addEventListener("error", () => fallbackEl.classList.remove("hidden"));
  }

  function showInvite(token, invite) {
    // show protected content
    if (gate) gate.classList.add("hidden");
    
    if (protectedWrap) {
      protectedWrap.classList.remove("hidden");
      protectedWrap.classList.add("is-visible");
    }

    // store token
    if (inviteToken) inviteToken.value = token;

    // copy/pronouns
    const single = applyCopy(invite);

    // day vs evening
    const isDay = invite.type === "day";
    COPY_STATE = { single, isDay };
    setDayOnlyVisibility(isDay);

    // greet
    if (helloText) helloText.textContent = invite?.label ? `Hallo ${invite.label} 👋` : "";

    // fill text
    if (dateText) dateText.textContent = CONFIG.dateText;
    if (locationText) locationText.textContent = CONFIG.locationText;
    if (dresscodeText) dresscodeText.textContent = CONFIG.dresscode;

    // pills
    if (guestTypePill) guestTypePill.textContent = isDay ? "Daggast" : "Avondgast";
    if (startTimePill) startTimePill.textContent = `Starttijd: ${isDay ? CONFIG.dayStart : CONFIG.eveningStart}`;

    // RSVP deadline
    if (rsvpDeadline) rsvpDeadline.textContent = CONFIG.rsvpDeadlineText;

    // max people
    if (people && invite.maxPeople) {
      people.max = String(invite.maxPeople);
      people.value = "1";
    }
    if (peopleHint && invite.maxPeople) {
      peopleHint.textContent = `Maximaal ${invite.maxPeople} persoon/personen voor deze uitnodiging.`;
    }

    // overnight hint
    if (overnightHint) overnightHint.textContent = CONFIG.overnightHint;

    // reset RSVP
    if (rsvpMsg) rsvpMsg.textContent = "";
    if (attending) attending.value = "";
    if (overnight) overnight.value = "";
    if (notes) notes.value = "";
    if (people) people.value = "1";
    setPeopleVisibility();

    startCountdown(CONFIG.weddingDateISO);
  }

  function tryOpen(token) {
    const t = normalize(token);
    const invite = window.INVITES?.[t];
    if (invite) {
      showInvite(t, invite);
      return true;
    }
    return false;
  }

  // ===== Init =====
  configureMaps();
  setupImageFallback(locationImg, locationFallback);
  setupImageFallback(usImg, usFallback);

  if (copyAddressBtn) {
    copyAddressBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(CONFIG.copyAddressText);
      if (copyMsg) copyMsg.textContent = ok ? "Adres gekopieerd ✅" : "Kopiëren niet gelukt. Kopieer handmatig.";
      setTimeout(() => { if (copyMsg) copyMsg.textContent = ""; }, 2200);
    });
  }
  
  // Init: always start locked (gate visible, protected hidden)
  if (gate) gate.classList.remove("hidden");
  
  if (protectedWrap) {
    protectedWrap.classList.add("hidden");
    protectedWrap.classList.remove("is-visible");
  }

  // auto-open via URL token
  const urlToken = getTokenFromUrl();
  if (urlToken) {
    const ok = tryOpen(urlToken);
    if (!ok && gateMsg) gateMsg.textContent = "Deze link/token is niet geldig. Controleer de link of voer je code in.";
  }

  // open via code form
  codeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = tryOpen(codeInput.value);
    if (gateMsg) gateMsg.textContent = ok ? "" : "Oeps—de code klopt niet. Controleer hem en probeer opnieuw.";
  });

  if (attending) attending.addEventListener("change", setPeopleVisibility);

  // RSVP submit (placeholder: console.log)
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (rsvpMsg) rsvpMsg.textContent = "Bezig met versturen…";

      const token = inviteToken?.value || "";
      const invite = window.INVITES?.[token];

      if (!invite) {
        if (rsvpMsg) rsvpMsg.textContent = "Er ging iets mis: uitnodiging niet gevonden.";
        return;
      }

      const payload = {
        token,
        label: invite.label || "",
        type: invite.type,
        attending: attending?.value || "",
        people: attending?.value === "yes" ? Number(people?.value || 1) : 0,
        overnight: invite.type === "day" ? (overnight?.value || "") : "",
        notes: notes?.value || "",
        submittedAt: new Date().toISOString()
      };

      // RSVP submit (Google Sheets via Apps Script)
if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (rsvpMsg) rsvpMsg.textContent = "Bezig met versturen…";

    const token = inviteToken?.value || "";
    const invite = window.INVITES?.[token];

    if (!invite) {
      if (rsvpMsg) rsvpMsg.textContent = "Er ging iets mis: uitnodiging niet gevonden.";
      return;
    }

    const payload = {
      token,
      label: invite.label || "",
      type: invite.type,
      attending: attending?.value || "",
      people: attending?.value === "yes" ? Number(people?.value || 1) : 0,
      overnight: invite.type === "day" ? (overnight?.value || "") : "",
      notes: notes?.value || "",
      submittedAt: new Date().toISOString()
    };

      try {
        // Gebruik text/plain om CORS preflight issues te vermijden [3](https://developers.google.com/apps-script/reference/content/content-service)[4](https://docs.philips.com/personal/sten_van_boxtel_philips_com/Documents/Microsoft%20Copilot%20Chat%20Files/styles.css)
        const res = await fetch(
          RSVP_ENDPOINT + "?src=invite&ua=" + encodeURIComponent(navigator.userAgent),
          {
            method: "POST",
            redirect: "follow", // Apps Script kan redirecten; follow helpt [3](https://developers.google.com/apps-script/reference/content/content-service)
            headers: { "Content-Type": "text/plain;charset=utf-8" }, // minder CORS gedoe [3](https://developers.google.com/apps-script/reference/content/content-service)[4](https://docs.philips.com/personal/sten_van_boxtel_philips_com/Documents/Microsoft%20Copilot%20Chat%20Files/styles.css)
            body: JSON.stringify(payload)
          }
        );
  
        const out = await res.json();
  
        if (!out.ok) {
          if (rsvpMsg) rsvpMsg.textContent = "Oops — opslaan lukt niet. Probeer het later opnieuw.";
          return;
        }
  
        if (rsvpMsg) {
          rsvpMsg.textContent = COPY_STATE.single
            ? "Dankjewel! Je RSVP is opgeslagen ✅"
            : "Dankjewel! Jullie RSVP is opgeslagen ✅";
        }
  
        const btn = rsvpForm.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
  
      } catch (err) {
        if (rsvpMsg) rsvpMsg.textContent = "Oops — opslaan lukt niet. Probeer het later opnieuw.";
      }
    });
  }

      if (rsvpMsg) {
        rsvpMsg.textContent = COPY_STATE.single
          ? "Dankjewel! We kijken ernaar uit om je te zien 💛"
          : "Dankjewel! We kijken ernaar uit om jullie te zien 💛";
      }

      const btn = rsvpForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
    });
  }
});
