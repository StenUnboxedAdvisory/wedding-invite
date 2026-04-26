// ====== CONFIG (jullie inputs) ======
const CONFIG = {
  weddingDateISO: "2027-05-21T13:00:00+02:00", // countdown naar dag-start
  rsvpDeadlineText: "31 december 2026",
  locationText: "Landgoed Rhederoord, De Steeg",

  // placeholder dresscode (kan later)
  dresscode:
    "Cocktail chic ✨ — feestelijk, verzorgd en comfortabel. Denk aan een nette jurk/pak of stijlvolle outfit. Laat je vooral mooi voelen.",

  day: {
    dateText: "Vrijdag 21 mei 2027",
    startTimeText: "13:00",
    scheduleText:
      "Dagprogramma start om 13:00. (Details volgen later — zet de datum alvast in je agenda.)",
    menuText:
      "Menu volgt. Heb je allergieën of dieetwensen? Zet dit dan bij je RSVP in de opmerkingen.",
    overnightHint:
      "Er is 1 overnachting mogelijk voor daggasten. Mogelijke kosten: €50 per persoon. We nemen contact op voor bevestiging & afstemming."
  },

  evening: {
    dateText: "Vrijdag 21 mei 2027",
    startTimeText: "21:00",
    scheduleText:
      "Avondprogramma start om 21:00. (Details volgen later — we kijken ernaar uit om samen te proosten!)"
  }
};

// ====== ELEMENTS ======
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

const dayOnlyMenu = document.getElementById("dayOnlyMenu");
const menuText = document.getElementById("menuText");

const overnightWrap = document.getElementById("overnightWrap");
const overnightHint = document.getElementById("overnightHint");

const inviteToken = document.getElementById("inviteToken");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpMsg = document.getElementById("rsvpMsg");
const attending = document.getElementById("attending");
const peopleWrap = document.getElementById("peopleWrap");
const people = document.getElementById("people");
const peopleHint = document.getElementById("peopleHint");
const overnight = document.getElementById("overnight");
const notes = document.getElementById("notes");

// Countdown fields
const dEl = document.getElementById("d");
const hEl = document.getElementById("h");
const mEl = document.getElementById("m");
const sEl = document.getElementById("s");

// ====== HELPERS ======
function normalize(v){
  return (v || "").trim().toUpperCase();
}

function getTokenFromUrl(){
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");
  return token ? normalize(token) : "";
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

    dEl.textContent = String(days);
    hEl.textContent = String(hours).padStart(2,"0");
    mEl.textContent = String(mins).padStart(2,"0");
    sEl.textContent = String(secs).padStart(2,"0");
  };
  tick();
  setInterval(tick, 1000);
}

function showInvite(token, invite){
  gate.classList.add("hidden");
  content.classList.remove("hidden");

  inviteToken.value = token;

  // General
  dresscodeText.textContent = CONFIG.dresscode;
  rsvpDeadline.textContent = CONFIG.rsvpDeadlineText;
  locationText.textContent = CONFIG.locationText;

  // Greeting
  helloText.textContent = invite?.label ? `Hallo ${invite.label} 👋` : "";

  // Per type
  const isDay = invite.type === "day";
  guestTypeText.textContent = isDay ? "Daggast" : "Avondgast";

  if(isDay){
    dateText.textContent = CONFIG.day.dateText;
    startTimeText.textContent = CONFIG.day.startTimeText;
    scheduleText.textContent = CONFIG.day.scheduleText;

    dayOnlyMenu.classList.remove("hidden");
    menuText.textContent = CONFIG.day.menuText;

    overnightWrap.classList.remove("hidden");
    overnightHint.textContent = CONFIG.day.overnightHint;
  } else {
    dateText.textContent = CONFIG.evening.dateText;
    startTimeText.textContent = CONFIG.evening.startTimeText;
    scheduleText.textContent = CONFIG.evening.scheduleText;

    dayOnlyMenu.classList.add("hidden");
    overnightWrap.classList.add("hidden");
    overnight.value = "";
  }

  // max people
  if(invite.maxPeople){
    people.max = String(invite.maxPeople);
    people.value = "1";
    peopleHint.textContent = `Maximaal ${invite.maxPeople} persoon/personen voor deze uitnodiging.`;
  } else {
    peopleHint.textContent = "";
  }

  startCountdown(CONFIG.weddingDateISO);
}

function tryOpen(token){
  const t = normalize(token);
  const invite = window.INVITES?.[t];
  if(invite){
    showInvite(t, invite);
    return true;
  }
  return false;
}

// ====== GATE LOGIC ======
const urlToken = getTokenFromUrl();
if(urlToken){
  const ok = tryOpen(urlToken);
  if(!ok){
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
  const isYes = attending.value === "yes";
  peopleWrap.style.display = isYes ? "block" : "none";
}
attending.addEventListener("change", setPeopleVisibility);
setPeopleVisibility();

// Placeholder submit (later koppelen aan Google Sheet / Tally / Formspree)
rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  rsvpMsg.textContent = "Bezig met versturen…";

  const token = inviteToken.value;
  const invite = window.INVITES?.[token];
  if(!invite){
    rsvpMsg.textContent = "Er ging iets mis: uitnodiging niet gevonden.";
    return;
  }

  const payload = {
    token,
    label: invite.label || "",
    type: invite.type,
    attending: attending.value,
    people: attending.value === "yes" ? Number(people.value || 1) : 0,
    overnight: invite.type === "day" ? (overnight.value || "") : "",
    notes: notes.value || "",
    submittedAt: new Date().toISOString()
  };

  console.log("RSVP payload:", payload);

  await new Promise(r => setTimeout(r, 500));
  rsvpMsg.textContent = "Dankjewel! We kijken ernaar uit om samen te vieren 💛";

  rsvpForm.querySelector("button[type=submit]").disabled = true;
});
