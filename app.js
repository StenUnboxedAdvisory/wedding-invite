window.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Sten & Chrissy - Summer Party Invite
  // app.js (clean)
  // =============================

  const RSVP_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbz9BglxU3baverTDpz3Ty3R9oBMlXDSbF01qRWATZoIiFOhJBkzifU4OtP0aksBXIsb/exec";

  const CONFIG = {
    weddingDateISO: "2027-05-21T13:00:00+02:00",
    dateText: "Vrijdag 21 mei 2027",
    locationText: "Landgoed Rhederoord, Parkweg 19, 6994 CM De Steeg",
    mapsQuery: "Parkweg 19, 6994 CM De Steeg",
    rsvpDeadlineText: "31 december 2026",
    copyAddressText: "Parkweg 19, 6994 CM De Steeg",

    dayStart: "13:30",
    eveningStart: "20:30",

    dresscode:
      "Feestelijk, zomers & comfortabel ✨ Denk aan summer chic of cocktail chic. Draag vooral iets waar je je mooi in voelt.",

    overnightHint:
      "Bij een overnachting nemen we later contact op over de kamerindeling en betaling (€50 p.p.). Ontbijt is van 09:00 tot 10:15 en uitchecken om 10:30."
  };

  // ===== Elements =====
  const intro = document.getElementById("intro");
  const pageTransition = document.getElementById("pageTransition");
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
  const guestTypeIcon = document.getElementById("guestTypeIcon");
  const guestTypeIntro = document.getElementById("guestTypeIntro");
  const welcomeCopy = document.getElementById("welcomeCopy");
  const guestTypeExplanation = document.getElementById("guestTypeExplanation");
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

  const menuSection = document.getElementById("menu");
  const planningSection = document.getElementById("planning");
  const planningNav = document.getElementById("planningNav");
  const menuNav = document.getElementById("menuNav");
  const menuDietCopy = document.getElementById("menuDietCopy");
  const contactCopy = document.getElementById("contactCopy");
  const rsvpHeading = document.getElementById("rsvpHeading");
  const rsvpDeadlineHeading = document.getElementById("rsvpDeadlineHeading");
  const overnightLabel = document.getElementById("overnightLabel");
  const closingCopy = document.getElementById("closingCopy");
  const afterpartyRow = document.getElementById("afterpartyRow");
  const overnightRow = document.getElementById("overnightRow");
  const dayTimesNote = document.getElementById("dayTimesNote");
  const practicalGrid = document.getElementById("practicalGrid");

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
  let countdownTimer = null;

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

    if (welcomeCopy) welcomeCopy.textContent = single
      ? "We kijken er heel erg naar uit om deze dag samen met je te vieren."
      : "We kijken er heel erg naar uit om deze dag samen met jullie te vieren.";
    if (guestTypeIntro) guestTypeIntro.textContent = single ? "Je bent uitgenodigd als" : "Jullie zijn uitgenodigd als";
    if (menuDietCopy) menuDietCopy.textContent = single
      ? "Allergieën en dieetwensen kun je doorgeven bij je aanwezigheidsbevestiging onderaan de pagina."
      : "Allergieën en dieetwensen kun je doorgeven bij jullie aanwezigheidsbevestiging onderaan de pagina.";
    if (contactCopy) contactCopy.textContent = single
      ? "Voor praktische vragen, opmerkingen of plannen die voor ons nog een verrassing moeten blijven, kun je bij Nikki en Malou terecht."
      : "Voor praktische vragen, opmerkingen of plannen die voor ons nog een verrassing moeten blijven, kunnen jullie bij Nikki en Malou terecht.";
    if (rsvpHeading) rsvpHeading.textContent = single
      ? "We hopen natuurlijk dat je erbij bent!"
      : "We hopen natuurlijk dat jullie erbij zijn!";
    if (rsvpDeadlineHeading) {
      rsvpDeadlineHeading.innerHTML = single
        ? `Laat vóór <span id="rsvpDeadline">${CONFIG.rsvpDeadlineText}</span> weten of je komt`
        : `Laat vóór <span id="rsvpDeadline">${CONFIG.rsvpDeadlineText}</span> weten of jullie komen`;
    }
    if (overnightLabel) overnightLabel.textContent = single ? "Wil je overnachten?" : "Willen jullie overnachten?";
    if (closingCopy) closingCopy.textContent = single
      ? "We kunnen niet wachten om samen met je de liefde te vieren."
      : "We kunnen niet wachten om samen met jullie de liefde te vieren.";

    if (optYes) optYes.textContent = single ? "Ja, ik kom" : "Ja, wij komen";
    if (optNo) optNo.textContent = "Nee, helaas";
    if (rsvpIntro) rsvpIntro.textContent = "Laat het ons weten";

    return single;
  }

  function setDayOnlyVisibility(isDay) {
    document.querySelectorAll(".dayOnly").forEach((el) => {
      el.classList.toggle("hidden", !isDay);
    });
    if (planningSection) planningSection.classList.toggle("hidden", !isDay);
    if (menuSection) menuSection.classList.toggle("hidden", !isDay);
    if (planningNav) planningNav.classList.toggle("hidden", !isDay);
    if (menuNav) menuNav.classList.toggle("hidden", !isDay);
    if (afterpartyRow) afterpartyRow.classList.toggle("hidden", !isDay);
    if (overnightRow) overnightRow.classList.toggle("hidden", !isDay);
    if (overnightWrap) overnightWrap.classList.toggle("hidden", !isDay);
    if (dayTimesNote) dayTimesNote.classList.toggle("hidden", !isDay);
    if (practicalGrid) practicalGrid.classList.toggle("single-card", !isDay);
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
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 1000);
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
  
    // People: alleen tonen als attending = yes
    if (peopleWrap) peopleWrap.style.display = isYes && peopleWrap.dataset.single !== "true" ? "block" : "none";
    if (!isYes && people) people.value = "1";
  
    // Overnight: alleen zinvol als attending = yes én daggast
       // COPY_STATE.isDay wordt gezet in showInvite() op basis van invite.type.
    const showOvernight = isYes && COPY_STATE.isDay;
  
    if (overnightWrap) overnightWrap.style.display = showOvernight ? "block" : "none";
  
    // Als attending = no (of nog leeg), reset overnight keuze zodat je nooit "nee + overnachting ja" krijgt
    if (!showOvernight && overnight) overnight.value = "";
  }

  function setupImageFallback(imgEl, fallbackEl) {
    if (!imgEl || !fallbackEl) return;
    fallbackEl.classList.add("hidden");
    imgEl.addEventListener("load", () => fallbackEl.classList.add("hidden"));
    imgEl.addEventListener("error", () => fallbackEl.classList.remove("hidden"));
  }

  function showInvite(token, invite) {
    if (gate) gate.classList.add("is-confirmed");
    if (pageTransition) pageTransition.classList.add("is-active");

    if (protectedWrap) {
      protectedWrap.classList.remove("hidden");
      protectedWrap.classList.add("app-reveal");
    }

    window.setTimeout(() => {
      if (intro) intro.classList.add("intro-exit");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 260);

    window.setTimeout(() => {
      if (intro) intro.classList.add("hidden");
      if (protectedWrap) protectedWrap.classList.add("app-visible");
      if (pageTransition) pageTransition.classList.remove("is-active");
    }, 760);

    if (inviteToken) inviteToken.value = token;

    const single = applyCopy(invite);
    const isDay = invite.type === "day";
    COPY_STATE = { single, isDay };
    setDayOnlyVisibility(isDay);

    if (helloText) helloText.textContent = invite?.label ? `${invite.label}` : "Wat leuk dat jullie er zijn";

    if (dateText) dateText.textContent = CONFIG.dateText;
    if (locationText) locationText.textContent = CONFIG.locationText;
    if (dresscodeText) dresscodeText.textContent = CONFIG.dresscode;

    if (guestTypeIcon) guestTypeIcon.textContent = isDay ? "☼" : "☾";
    if (guestTypePill) guestTypePill.textContent = isDay
      ? (single ? "Daggast" : "Daggasten")
      : (single ? "Avondgast" : "Avondgasten");
    if (startTimePill) startTimePill.textContent = isDay
      ? `Welkom vanaf ${CONFIG.dayStart}`
      : `${CONFIG.eveningStart}–00:30`;
    if (guestTypeExplanation) {
      guestTypeExplanation.textContent = isDay
        ? "Deze uitnodiging geldt voor het volledige programma: van de ceremonie en het diner tot en met het feest."
        : (single
          ? "Overdag zullen wij met een klein groepje onze bruiloft vieren. Hierna gaat de dansvloer open en zien we je graag om te proosten op ons trouwen!"
          : "Overdag zullen wij met een klein groepje onze bruiloft vieren. Hierna gaat de dansvloer open en zien we jullie graag om te proosten op ons trouwen!");
    }

    const currentDeadline = document.getElementById("rsvpDeadline");
    if (currentDeadline) currentDeadline.textContent = CONFIG.rsvpDeadlineText;
    if (overnightHint) overnightHint.textContent = CONFIG.overnightHint;

    if (people && invite.maxPeople) {
      people.max = String(invite.maxPeople);
      people.value = "1";
    }
    if (peopleHint && invite.maxPeople) {
      peopleHint.textContent = single
        ? "Deze uitnodiging is voor één persoon."
        : `Maximaal ${invite.maxPeople} personen voor deze uitnodiging.`;
    }
    if (peopleWrap) peopleWrap.dataset.single = single ? "true" : "false";

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

  // Start locked
  if (protectedWrap) protectedWrap.classList.add("hidden");

  // Auto-open via URL token
  const urlToken = getTokenFromUrl();
  if (urlToken) {
    const ok = tryOpen(urlToken);
    if (!ok && gateMsg) gateMsg.textContent = "Deze link/token is niet geldig. Controleer de link of voer je code in.";
  }

  // Open via code form
  codeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = tryOpen(codeInput.value);
    if (gateMsg) gateMsg.textContent = ok ? "" : "Oeps—de code klopt niet. Controleer hem en probeer opnieuw.";
  });

  if (attending) attending.addEventListener("change", setPeopleVisibility);

  // RSVP submit -> Google Sheets via Apps Script
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
        overnight: (invite.type === "day" && attending?.value === "yes") ? (overnight?.value || "") : "",
        notes: notes?.value || "",
        submittedAt: new Date().toISOString()
      };

      try {
        const res = await fetch(
          RSVP_ENDPOINT + "?src=invite&ua=" + encodeURIComponent(navigator.userAgent),
          {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
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
            ? "Dankjewel! Je aanwezigheid is doorgegeven ✅. Mocht er iets veranderen, log dan opnieuw in en pas de gegevens aan voor 31 december."
            : "Dankjewel! Jullie aanwezigheid is doorgegeven ✅. Mocht er iets veranderen, log dan opnieuw in en pas de gegevens aan voor 31 december.";
        }

        const btn = rsvpForm.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

      } catch (err) {
        if (rsvpMsg) rsvpMsg.textContent = "Oops — opslaan lukt niet. Probeer het later opnieuw.";
      }
    });
  }
  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Video placeholder when the local file is not present.
  const saveVideo = document.getElementById("saveTheDateVideo");
  const videoFallback = document.getElementById("videoFallback");
  if (saveVideo && videoFallback) {
    saveVideo.addEventListener("error", () => { saveVideo.classList.add("hidden"); videoFallback.classList.remove("hidden"); }, true);
    const source = saveVideo.querySelector("source");
    if (source) source.addEventListener("error", () => { saveVideo.classList.add("hidden"); videoFallback.classList.remove("hidden"); });
  }

});
