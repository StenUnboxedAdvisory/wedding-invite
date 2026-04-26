// =============================
// Sten & Chrissy - Wedding Invite
// app.js (FIXED: no TDZ / correct initialization order)
// =============================

window.addEventListener("DOMContentLoaded", () => {

  // ====== CONFIG (jullie details) ======
  const CONFIG = {
    weddingDateISO: "2027-05-21T13:00:00+02:00",
    rsvpDeadlineText: "31 december 2026",
    locationText: "Landgoed Rhederoord, De Steeg",

    dresscode:
      "Feestelijk & verzorgd ✨ — draag iets waar je je mooi én comfortabel in voelt. Denk aan cocktail chic / summer chic (geen verplichtingen).",

    day: {
      dateText: "Vrijdag 21 mei 2027",
      startTimeText: "13:00",
      scheduleText:
        "Dagprogramma start om 13:00. (Meer details volgen later — zet de datum alvast in je agenda.)",
      menuText:
        "Menu volgt. Heb je allergieën of dieetwensen? Zet dit dan bij je RSVP in de opmerkingen.",
      overnightHint:
        "Er is 1 overnachting mogelijk voor daggasten. Mogelijke kosten: €50 per persoon. We nemen contact op voor bevestiging & afstemming."
    },

    evening: {
      dateText: "Vrijdag 21 mei 2027",
      startTimeText: "21:00",
      scheduleText:
        "Avondprogramma start om 21:00. (Meer details volgen later — we kijken ernaar uit om samen te proosten!)"
    }
  };

  // ====== ELEMENTS (EERST DECLAREREN, DAN PAS GEBRUIKEN) ======
  const gate = document.getElementById("gate");
  const content = document.getElementById("content");
  const gateMsg = document.getElementById("gateMsg");
  const codeForm = document.getElementById("codeForm");
  const codeInput = document.getElementById("codeInput");

  const helloText = document.getElementById("helloText");
  const dateText = document.getElementById("dateText");
  const locationText = document.getElementById("locationText");
  const startTimeText = document.getElementById("startTimeText");
  const guestTypeText = document.getElementById("guestTypeText");
  const scheduleText = document.getElementById("scheduleText");

  const dresscodeText = document.getElementById("dresscodeText");
  const rsvpDeadline = document.getElementById("rsvpDeadline");
  const rsvpIntro = document.getElementById("rsvpIntro");

  const optYes = document.getElementById("optYes");
  const optNo = document.getElementById("optNo");

  const dayOnlyMenu = document.getElementById("dayOnlyMenu");
  const menuText = document.getElementById("menuText");

  const overnightWrap = document.getElementById("overnightWrap");
  const overnightHint = document.getElementById("overnightHint");
  const overnight = document.getElementById("overnight");

  const inviteToken = document.getElementById("inviteToken");
  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpMsg = document.getElementById("rsvpMsg");
  const attending = document.getElementById("attending");
  const peopleWrap = document.getElementById("peopleWrap");
  const people = document.getElementById("people");
  const peopleHint = document.getElementById("peopleHint");
  const notes = document.getElementById("notes");

  // Pronoun spans
  const youPronounHero = document.getElementById("youPronounHero");
  const youGift1 = document.getElementById("youGift1");
  const youGift2 = document.getElementById("youGift2");
  const youGiftVerb = document.getElementById("youGiftVerb");

  // Countdown fields
  const dEl = document.getElementById("d");
  const hEl = document.getElementById("h");
  const mEl = document.getElementById("m");
  const sEl = document.getElementById("s");

  // ====== STATE ======
  let COPY_STATE = { single: false };

  // ====== SAFETY CHECKS ======
  // Als deze missen, is je HTML niet up-to-date.
  if (!codeForm || !codeInput) {
    console.error("codeForm of codeInput niet gevonden. Check je index.html IDs.");
    return;
  }
  if (!window.INVITES) {
    console.error("window.INVITES is undefined. invites.js wordt niet geladen of staat niet vóór app.js in index.html.");
    gateMsg.textContent = "Er ging iets mis: uitnodigingenbestand niet geladen.";
    return;
  }

  // ====== HELPERS ======
  function normalize(v){
    return (v || "").trim().toUpperCase();
  }

  function getTokenFromUrl(){
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    return token ? normalize(token) : "";
  }

  function isSingleInvite(invite){
    return Number(invite?.maxPeople) === 1;
  }

  function applyCopyForInvite(invite){
    const single = isSingleInvite(invite);

    // Hero: jullie/je
    if (youPronounHero) youPronounHero.textContent = single ? "je" : "jullie";

    // RSVP dropdown
    if (optYes) optYes.textContent = single ? "Ja, ik kom" : "Ja, wij komen";
    if (optNo) optNo.textContent = "Nee, helaas";

    if (rsvpIntro) rsvpIntro.textContent = "Laat het ons weten";

    // Cadeautip
    if (youGift1) youGift1.textContent = single ? "je" : "jullie";
    if (youGift2) youGift2.textContent = single ? "je" : "jullie";
    if (youGiftVerb) youGiftVerb.textContent = single ? "bent" : "zijn";

    return { single };
  }

  function startCountdown(targetISO){
    const target = new Date(targetISO).getTime();

    const tick = () => {
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000*60*60*24));
      diff -= days*(1000*60*60*24);
      const hours = Math.floor(diff / (1000*60*60));
      diff -= hours*(1000*60*60);
      const mins = Math.floor(diff / (1000*60));
      diff -= mins*(1000*60);
      const secs = Math.floor(diff / 1000);

      if (dEl) dEl.textContent = String(days);
      if (hEl) hEl.textContent = String(hours).padStart(2,"0");
      if (mEl) mEl.textContent = String(mins).padStart(2,"0");
      if (sEl) sEl.textContent = String(secs).padStart(2,"0");
    };

    tick();
    setInterval(tick, 1000);
  }

  function showInvite(token, invite){
    gate.classList.add("hidden");
    content.classList.remove("hidden");

    COPY_STATE = applyCopyForInvite(invite);
    if (inviteToken) inviteToken.value = token;

    // General content
    if (dresscodeText) dresscodeText.textContent = CONFIG.dresscode;
    if (rsvpDeadline) rsvpDeadline.textContent = CONFIG.rsvpDeadlineText;
    if (locationText) locationText.textContent = CONFIG.locationText;

    // Greeting
    if (helloText) helloText.textContent = invite?.label ? `Hallo ${invite.label} 👋` : "";

    // Type-based content
    const isDay = invite.type === "day";
    if (guestTypeText) guestTypeText.textContent = isDay ? "Daggast" : "Avondgast";

    if (isDay) {
      if (dateText) dateText.textContent = CONFIG.day.dateText;
      if (startTimeText) startTimeText.textContent = CONFIG.day.startTimeText;
      if (scheduleText) scheduleText.textContent = CONFIG.day.scheduleText;

      if (dayOnlyMenu) dayOnlyMenu.classList.remove("hidden");
      if (menuText) menuText.textContent = CONFIG.day.menuText;

      if (overnightWrap) overnightWrap.classList.remove("hidden");
      if (overnightHint) overnightHint.textContent = CONFIG.day.overnightHint;
    } else {
      if (dateText) dateText.textContent = CONFIG.evening.dateText;
      if (startTimeText) startTimeText.textContent = CONFIG.evening.startTimeText;
      if (scheduleText) scheduleText.textContent = CONFIG.evening.scheduleText;

      if (dayOnlyMenu) dayOnlyMenu.classList.add("hidden");
      if (overnightWrap) overnightWrap.classList.add("hidden");
      if (overnight) overnight.value = "";
    }

    // max people
    if (people && invite.maxPeople) {
      people.max = String(invite.maxPeople);
      people.value = "1";
    }
    if (peopleHint && invite.maxPeople) {
      peopleHint.textContent = `Maximaal ${invite.maxPeople} persoon/personen voor deze uitnodiging.`;
    }

    startCountdown(CONFIG.weddingDateISO);
  }

  function tryOpen(token){
    const t = normalize(token);
    const invite = window.INVITES?.[t];
    if (invite) {
      showInvite(t, invite);
      return true;
    }
    return false;
  }

  // ====== GATE LOGIC ======
  const urlToken = getTokenFromUrl();
  if (urlToken) {
    const ok = tryOpen(urlToken);
    if (!ok) {
      gateMsg.textContent = "Deze link/token is niet geldig. Controleer de link of voer je code in.";
    }
  }

  codeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = tryOpen(codeInput.value);
    gateMsg.textContent = ok ? "" : "Oeps—de code klopt niet. Controleer hem en probeer opnieuw.";
  });

  // ====== RSVP LOGIC ======
  function setPeopleVisibility(){
    const isYes = attending?.value === "yes";
    if (peopleWrap) peopleWrap.style.display = isYes ? "block" : "none";
  }
  if (attending) attending.addEventListener("change", setPeopleVisibility);
  setPeopleVisibility();

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
        people: (attending?.value === "yes") ? Number(people?.value || 1) : 0,
        overnight: (invite.type === "day") ? (overnight?.value || "") : "",
        notes: notes?.value || "",
        submittedAt: new Date().toISOString()
      };

      console.log("RSVP payload:", payload);

      await new Promise(r => setTimeout(r, 400));

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
