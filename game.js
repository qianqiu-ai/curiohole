const capacity = 4;
const colors = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15",
  purple: "#a855f7",
  orange: "#f97316"
};

const levels = [
  [["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"], [], []],
  [["red", "blue", "green", "yellow"], ["yellow", "green", "blue", "red"], ["green", "yellow", "red", "blue"], ["blue", "red", "yellow", "green"], [], []],
  [["red", "green", "blue", "purple"], ["purple", "yellow", "red", "green"], ["blue", "purple", "yellow", "red"], ["green", "blue", "purple", "yellow"], ["yellow", "red", "green", "blue"], [], []],
  [["purple", "purple", "purple", "purple"], ["blue", "blue", "blue", "blue"], ["green", "green", "green", "green"], ["yellow", "yellow", "yellow", "yellow"], [], ["red"], ["red", "red", "red"]],
  [["red", "blue", "green", "yellow"], ["purple", "orange", "red", "blue"], ["green", "yellow", "purple", "orange"], ["blue", "green", "yellow", "red"], ["orange", "purple", "blue", "green"], ["yellow", "red", "orange", "purple"], [], []]
];

const beginnerHints = [
  "Tap Tube 1, then tap Tube 3. This moves the top blue ball into an empty tube.",
  "Tap Tube 2, then tap Tube 4. Move the top red ball into the other empty tube.",
  "Tap Tube 1, then tap Tube 4. Red can go on top of red.",
  "Tap Tube 2, then tap Tube 3. Blue can go on top of blue.",
  "Keep moving blue balls into Tube 3 and red balls into Tube 4."
];

let levelIndex = 0;
let tubes = [];
let selectedTube = null;
let moves = 0;
let history = [];
let startedAt = null;
let timer = null;

const board = document.getElementById("gameBoard");
const levelLabel = document.getElementById("levelLabel");
const movesLabel = document.getElementById("movesLabel");
const timeLabel = document.getElementById("timeLabel");
const message = document.getElementById("gameMessage");
const restartBtn = document.getElementById("restartBtn");
const undoBtn = document.getElementById("undoBtn");
const newGameBtn = document.getElementById("newGameBtn");
const hintText = document.getElementById("hintText");
const hintBtn = document.getElementById("hintBtn");
const winDialog = document.getElementById("winDialog");
const winText = document.getElementById("winText");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const dialogRestartBtn = document.getElementById("dialogRestartBtn");

function cloneTubes(value) {
  return value.map((tube) => [...tube]);
}

function startTimer() {
  if (timer) return;
  startedAt = Date.now();
  timer = window.setInterval(updateTime, 1000);
  updateTime();
}

function resetTimer() {
  window.clearInterval(timer);
  timer = null;
  startedAt = null;
  timeLabel.textContent = "00:00";
}

function updateTime() {
  if (!startedAt) return;
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  timeLabel.textContent = `${mins}:${secs}`;
}

function loadLevel(index) {
  levelIndex = (index + levels.length) % levels.length;
  tubes = cloneTubes(levels[levelIndex]);
  selectedTube = null;
  moves = 0;
  history = [];
  resetTimer();
  winDialog.hidden = true;
  message.textContent = "Goal: put all balls of the same color into one tube. Tap a tube to start.";
  updateHint();
  render();
}

function render() {
  board.innerHTML = "";
  levelLabel.textContent = String(levelIndex + 1);
  movesLabel.textContent = String(moves);
  undoBtn.disabled = history.length === 0;

  tubes.forEach((tube, index) => {
    const tubeWrap = document.createElement("div");
    tubeWrap.className = "tube-wrap";

    const tubeEl = document.createElement("button");
    tubeEl.className = `tube${selectedTube === index ? " selected" : ""}`;
    tubeEl.type = "button";
    tubeEl.setAttribute("aria-label", `Tube ${index + 1}`);
    tubeEl.addEventListener("click", () => handleTubeClick(index));

    tube.forEach((color) => {
      const ball = document.createElement("span");
      ball.className = "ball";
      ball.style.background = colors[color];
      tubeEl.appendChild(ball);
    });

    const label = document.createElement("span");
    label.className = "tube-label";
    label.textContent = `Tube ${index + 1}`;

    tubeWrap.appendChild(tubeEl);
    tubeWrap.appendChild(label);
    board.appendChild(tubeWrap);
  });
}

function updateHint() {
  if (!hintText || !hintBtn) return;

  if (levelIndex === 0) {
    hintText.textContent = beginnerHints[Math.min(moves, beginnerHints.length - 1)];
    hintBtn.hidden = false;
    return;
  }

  hintText.textContent = "Use empty tubes as temporary space. Move a ball only onto the same color or into an empty tube.";
  hintBtn.hidden = true;
}

function handleTubeClick(index) {
  startTimer();
  if (selectedTube === null) {
    if (tubes[index].length === 0) {
      message.textContent = "Pick a tube with balls first. Empty tubes are used as spare space.";
      return;
    }
    selectedTube = index;
    message.textContent = `Tube ${index + 1} selected. Now tap an empty tube or a tube with the same top color.`;
    render();
    return;
  }

  if (selectedTube === index) {
    selectedTube = null;
    message.textContent = "Selection cleared.";
    render();
    return;
  }

  if (moveBall(selectedTube, index)) {
    selectedTube = null;
    moves += 1;
    message.textContent = "Nice move.";
    updateHint();
    render();
    if (isSolved()) {
      window.clearInterval(timer);
      timer = null;
      winText.textContent = `You solved level ${levelIndex + 1} in ${moves} moves.`;
      winDialog.hidden = false;
    }
    return;
  }

  selectedTube = null;
  message.textContent = "That move is not allowed. Match colors or use an empty tube.";
  render();
}

function moveBall(from, to) {
  const source = tubes[from];
  const target = tubes[to];
  if (!source.length || target.length >= capacity) return false;

  const ball = source[source.length - 1];
  const targetTop = target[target.length - 1];
  if (targetTop && targetTop !== ball) return false;

  history.push(cloneTubes(tubes));
  target.push(source.pop());
  return true;
}

function isSolved() {
  return tubes.every((tube) => {
    if (tube.length === 0) return true;
    if (tube.length !== capacity) return false;
    return tube.every((ball) => ball === tube[0]);
  });
}

restartBtn.addEventListener("click", () => loadLevel(levelIndex));
dialogRestartBtn.addEventListener("click", () => loadLevel(levelIndex));
newGameBtn.addEventListener("click", () => loadLevel(0));
nextLevelBtn.addEventListener("click", () => loadLevel(levelIndex + 1));

undoBtn.addEventListener("click", () => {
  if (!history.length) return;
  tubes = history.pop();
  moves = Math.max(0, moves - 1);
  selectedTube = null;
  message.textContent = "Move undone.";
  updateHint();
  render();
});

hintBtn.addEventListener("click", () => {
  message.textContent = hintText.textContent;
});

loadLevel(0);
