const MAX_HP = 100;
const HERO_MIN_ATTACK = 8;
const HERO_MAX_ATTACK = 15;
const ENEMY_MIN_ATTACK = 5;
const ENEMY_MAX_ATTACK = 14;
const HEAL_AMOUNT = 20;
const MAX_HEALS = 3;
const ROLL_MAX = 100;
const CRIT_PERCENT = 10;
const CRIT_MULTIPLIER = 2;
const DEFEND_DIVIDER = 2;
const LOG_SIZE = 5;
const LOW_HP = 30;

const heroBar = document.getElementById("heroBar");
const enemyBar = document.getElementById("enemyBar");
const heroHpText = document.getElementById("heroHp");
const enemyHpText = document.getElementById("enemyHp");
const healCount = document.getElementById("healCount");
const attackBtn = document.getElementById("attackBtn");
const defendBtn = document.getElementById("defendBtn");
const healBtn = document.getElementById("healBtn");
const restartBtn = document.getElementById("restartBtn");
const messageBox = document.getElementById("message");
const banner = document.getElementById("banner");
const logBox = document.getElementById("log");

let heroHp, enemyHp, healsLeft, defending, gameOver, logList;

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isCritical() {
  return getRandom(1, ROLL_MAX) <= CRIT_PERCENT;
}

function showMessage(text, isError) {
  messageBox.textContent = text;
  messageBox.classList.toggle("error", isError);
}

function addLog(text) {
  logList.unshift(text);
  if (logList.length > LOG_SIZE) {
    logList.pop();
  }
}

function render() {
  heroHpText.textContent = heroHp;
  enemyHpText.textContent = enemyHp;
  heroBar.value = heroHp;
  enemyBar.value = enemyHp;
  heroBar.classList.toggle("low", heroHp <= LOW_HP);
  healCount.textContent = healsLeft;

  attackBtn.disabled = gameOver;
  defendBtn.disabled = gameOver;
  healBtn.disabled = gameOver || healsLeft === 0;
  restartBtn.classList.toggle("hidden", !gameOver);

  logBox.textContent = "";
  for (let i = 0; i < logList.length; i++) {
    let li = document.createElement("li");
    li.textContent = logList[i];
    logBox.appendChild(li);
  }
}

function enemyTurn() {
  let damage = getRandom(ENEMY_MIN_ATTACK, ENEMY_MAX_ATTACK);
  let text = "Slime hits Lumine for ";

  if (isCritical()) {
    damage = damage * CRIT_MULTIPLIER;
    text = "CRITICAL! Slime smashes Lumine for ";
  }
  if (defending === true) {
    damage = Math.floor(damage / DEFEND_DIVIDER);
    defending = false;
    text = "Guard works! Slime hits only for ";
  }

  heroHp = Math.max(0, heroHp - damage);
  addLog(text + damage + ".");
}

function checkEnd() {
  if (enemyHp === 0 && heroHp > 0) {
    gameOver = true;
    banner.textContent = "Victory! The Slime is defeated.";
    banner.className = "banner win";
    addLog("Victory!");
  } else if (heroHp === 0 && enemyHp > 0) {
    gameOver = true;
    banner.textContent = "Defeat... Lumine has fallen.";
    banner.className = "banner lose";
    addLog("Defeat.");
  } else if (heroHp <= LOW_HP && healsLeft > 0) {
    showMessage("Low HP! Maybe it is time to heal.", false);
  }
}

function endMove() {
  checkEnd();
  render();
}

function attack() {
  if (gameOver === true) { return; }
  showMessage("", false);

  let damage = getRandom(HERO_MIN_ATTACK, HERO_MAX_ATTACK);
  let text = "Lumine hits the Slime for ";
  if (isCritical()) {
    damage = damage * CRIT_MULTIPLIER;
    text = "CRITICAL! Lumine strikes the Slime for ";
  }
  enemyHp = Math.max(0, enemyHp - damage);
  addLog(text + damage + ".");

  if (enemyHp > 0) {
    enemyTurn();
  }
  endMove();
}

function defend() {
  if (gameOver === true) { return; }
  showMessage("", false);

  defending = true;
  addLog("Lumine raises a shield.");
  enemyTurn();
  endMove();
}

function heal() {
  if (gameOver === true) { return; }
  showMessage("", false);

  if (healsLeft === 0 || heroHp === MAX_HP) {
    if (healsLeft === 0) {
      showMessage("No heals left!", true);
    } else {
      showMessage("HP is already full. No need to heal.", true);
    }
    return;
  }

  heroHp = Math.min(MAX_HP, heroHp + HEAL_AMOUNT);
  healsLeft--;
  addLog("Lumine heals " + HEAL_AMOUNT + " HP.");
  enemyTurn();
  endMove();
}

function startGame() {
  heroHp = MAX_HP;
  enemyHp = MAX_HP;
  healsLeft = MAX_HEALS;
  defending = false;
  gameOver = false;
  logList = [];
  heroBar.max = MAX_HP;
  enemyBar.max = MAX_HP;
  banner.className = "banner hidden";
  showMessage("", false);
  addLog("The battle begins!");
  render();
}

attackBtn.addEventListener("click", attack);
defendBtn.addEventListener("click", defend);
healBtn.addEventListener("click", heal);
restartBtn.addEventListener("click", startGame);

startGame();