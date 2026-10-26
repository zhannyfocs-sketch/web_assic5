const TOTAL_POINTS = 20;
const MAX_ELEMENTAL = 14;
const takenNames = ["Lumine", "Aether", "Paimon", "Venti", "Zhongli", "Klee", "Diluc", "Hu Tao", "Raiden"];

const form = document.getElementById("charForm");
const nameInput = document.getElementById("charName");
const weaponSelect = document.getElementById("charWeapon");
const visionSelect = document.getElementById("charVision");
const regionSelect = document.getElementById("charRegion");
const skillAttack = document.getElementById("skillAttack");
const skillElemental = document.getElementById("skillElemental");
const skillBurst = document.getElementById("skillBurst");
const skillDefense = document.getElementById("skillDefense");
const skillInputs = [skillAttack, skillElemental, skillBurst, skillDefense];
const fields = [nameInput, weaponSelect, visionSelect, regionSelect].concat(skillInputs);

const pointsLeft = document.getElementById("pointsLeft");
const pointsError = document.getElementById("pointsError");
const summary = document.getElementById("summary");
const resultBox = document.getElementById("resultBox");
const previewCard = document.getElementById("previewCard");
const previewInitial = document.getElementById("previewInitial");
const previewName = document.getElementById("previewName");
const previewMeta = document.getElementById("previewMeta");

let touched = {};
let pointsTouched = false;

form.noValidate = true;

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTotal() {
  let total = 0;
  for (let i = 0; i < skillInputs.length; i++) {
    total += Number(skillInputs[i].value);
  }
  return total;
}

function getMessage(field) {
  let value = field.value.trim();

  if (field.validity.badInput) {
    return "Please enter a whole number.";
  }
  if (value === "") {
    return field.tagName === "SELECT" ? "Please choose an option." : "This field cannot be empty.";
  }

  if (field === nameInput) {
    if (value.length < field.minLength) { return "Name needs at least " + field.minLength + " letters."; }
    if (field.validity.patternMismatch) { return "Use English letters and spaces only."; }
    for (let i = 0; i < takenNames.length; i++) {
      if (takenNames[i].toLowerCase() === value.toLowerCase()) {
        return "The name " + value + " is already taken.";
      }
    }
  }

  if (field === weaponSelect) {
    let weapon = weaponSelect.value;
    let need = "";
    if (weapon === "Sword" && Number(skillAttack.value) < 5) { need = "Normal Attack 5"; }
    else if (weapon === "Claymore" && Number(skillDefense.value) < 5) { need = "Defense 5"; }
    else if (weapon === "Polearm" && Number(skillBurst.value) < 5) { need = "Elemental Burst 5"; }
    else if (weapon === "Bow" && Number(skillAttack.value) < 6) { need = "Normal Attack 6"; }
    else if (weapon === "Catalyst" && Number(skillElemental.value) < 5) { need = "Elemental Skill 5"; }
    if (need !== "") { return weapon + " users need at least " + need + "."; }
  }

  if (skillInputs.includes(field)) {
    if (field.validity.rangeUnderflow) { return "Minimum is " + field.min + "."; }
    if (field.validity.rangeOverflow) { return "Maximum is " + field.max + "."; }
    if (field.validity.stepMismatch) { return "Whole numbers only."; }
  }

  if (field === skillBurst) {
    let sum = Number(skillElemental.value) + Number(skillBurst.value);
    if (sum > MAX_ELEMENTAL) {
      return "Elemental Skill + Burst cannot be more than " + MAX_ELEMENTAL + " (now " + sum + ").";
    }
  }
  return "";
}

function getPointsMessage() {
  let left = TOTAL_POINTS - getTotal();
  if (left > 0) { return "Spend " + left + " more point(s): you need exactly " + TOTAL_POINTS + "."; }
  if (left < 0) { return "Remove " + (-left) + " point(s): you need exactly " + TOTAL_POINTS + "."; }
  return "";
}

function showError(field, message) {
  document.getElementById(field.id + "Error").textContent = message;
  field.classList.toggle("invalid", message !== "");
  field.setAttribute("aria-invalid", message !== "");
}

function checkField(field) {
  let message = getMessage(field);
  showError(field, message);
  return message === "";
}

function updatePoints() {
  let left = TOTAL_POINTS - getTotal();
  pointsLeft.textContent = left;
  pointsLeft.classList.toggle("ok", left === 0);
  pointsLeft.classList.toggle("bad", left < 0);

  let message = pointsTouched ? getPointsMessage() : "";
  pointsError.textContent = message;
  if (pointsTouched) {
    for (let i = 0; i < skillInputs.length; i++) {
      let own = document.getElementById(skillInputs[i].id + "Error").textContent;
      let bad = own !== "" || message !== "";
      skillInputs[i].classList.toggle("invalid", bad);
      skillInputs[i].setAttribute("aria-invalid", bad);
    }
  }
}

function updatePreview() {
  let name = nameInput.value.trim();
  previewName.textContent = name === "" ? "Unnamed Traveler" : name;
  previewInitial.textContent = name === "" ? "?" : name.charAt(0).toUpperCase();

  let weapon = weaponSelect.value === "" ? "No weapon" : weaponSelect.value;
  let vision = visionSelect.value === "" ? "No Vision" : visionSelect.value;
  let region = regionSelect.value === "" ? "No region" : regionSelect.value;
  previewMeta.textContent = weapon + " · " + vision + " · " + region;

  previewCard.className = "char-card";
  if (visionSelect.value !== "") {
    previewCard.classList.add("vision-" + visionSelect.value.toLowerCase());
  }

  for (let i = 0; i < skillInputs.length; i++) {
    let number = Number(skillInputs[i].value);
    if (isNaN(number) || number < 0) { number = 0; }
    document.getElementById("bar-" + skillInputs[i].id).value = number;
    document.getElementById("val-" + skillInputs[i].id).textContent = number;
  }
}

function makeElement(tag, className, text) {
  let element = document.createElement(tag);
  if (className) { element.className = className; }
  if (text !== undefined) { element.textContent = text; }
  return element;
}

function showResult() {
  let name = nameInput.value.trim();
  let card = makeElement("div", "char-card vision-" + visionSelect.value.toLowerCase());
  card.appendChild(makeElement("div", "initial", name.charAt(0).toUpperCase()));
  card.appendChild(makeElement("h3", "", name));
  card.appendChild(makeElement("p", "card-meta", weaponSelect.value + " · " + visionSelect.value + " · " + regionSelect.value));

  for (let i = 0; i < skillInputs.length; i++) {
    let row = makeElement("div", "skill-row");
    let bar = makeElement("progress");
    bar.max = 10;
    bar.value = Number(skillInputs[i].value);
    row.appendChild(makeElement("span", "", skillInputs[i].dataset.name));
    row.appendChild(bar);
    row.appendChild(makeElement("strong", "", skillInputs[i].value));
    card.appendChild(row);
  }

  resultBox.textContent = "";
  resultBox.appendChild(makeElement("h2", "", "Welcome to Teyvat, " + name + "!"));
  resultBox.appendChild(makeElement("p", "code", "Adventurer ID: UID-" + getRandom(100000000, 999999999)));
  resultBox.appendChild(card);
  resultBox.classList.remove("hidden");
  resultBox.focus();
}

function onBlur(event) {
  touched[event.target.id] = true;
  checkField(event.target);
  if (skillInputs.includes(event.target)) {
    pointsTouched = true;
    updatePoints();
  }
}

function onInput() {
  updatePreview();
  for (let i = 0; i < fields.length; i++) {
    if (touched[fields[i].id] === true) {
      checkField(fields[i]);
    }
  }
  updatePoints();
}

for (let i = 0; i < fields.length; i++) {
  fields[i].addEventListener("blur", onBlur);
  fields[i].addEventListener("input", onInput);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  let errors = 0;
  let firstBad = null;
  for (let i = 0; i < fields.length; i++) {
    touched[fields[i].id] = true;
    if (checkField(fields[i]) === false) {
      errors++;
      if (firstBad === null) { firstBad = fields[i]; }
    }
  }
  pointsTouched = true;
  updatePoints();
  if (getPointsMessage() !== "") {
    errors++;
    if (firstBad === null) { firstBad = skillAttack; }
  }

  if (errors > 0) {
    summary.textContent = "Please fix " + errors + " error(s) before creating the character.";
    summary.classList.remove("hidden");
    firstBad.focus();
    return;
  }

  summary.classList.add("hidden");
  showResult();
  takenNames.push(nameInput.value.trim());

  form.reset();
  touched = {};
  pointsTouched = false;
  for (let i = 0; i < fields.length; i++) {
    showError(fields[i], "");
    fields[i].removeAttribute("aria-invalid");
  }
  updatePreview();
  updatePoints();
});

updatePreview();
updatePoints();