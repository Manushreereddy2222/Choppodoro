// request notification permission on page load

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// alarm sound
const alarmSound = document.getElementById("alarmSound");

// ── LEAVES ──────────────────────────────────────────────────────
const container = document.getElementById('leaves-container');
const leafColors = ['#D53E0F', '#E86B3A', '#F0A070', '#9B0F06', '#E8956D'];
 
function createLeaf() {
  const leaf = document.createElement('div');
  leaf.classList.add('leaf');
  leaf.style.left = (Math.random() * 95 + 2.5) + 'vw';
  const size = Math.random() * 14 + 8 + 'px';
  leaf.style.width = size;
  leaf.style.height = size;
  const duration = Math.random() * 4 + 4 + 's';
  leaf.style.animationDuration = duration;
  leaf.style.animationDelay = Math.random() * 5 + 's';
  const color = leafColors[Math.floor(Math.random() * leafColors.length)];
  leaf.style.background = color;
  leaf.style.borderRadius = '80% 0 80% 0';
  container.appendChild(leaf);
  setTimeout(() => { leaf.remove(); }, 10000);
}
 
setInterval(createLeaf, 400);
 
 
// ── VARIABLES ────────────────────────────────────────────────────
let totalSeconds = 25 * 60;
let isRunning = false;
let timerInterval = null;
let isBreak = false;
let session = 1;
 
 
// ── FIND ELEMENTS ────────────────────────────────────────────────
const focusInput = document.getElementById("work-duration");
const breakInput = document.getElementById("break-duration");
const timeDisplay = document.getElementById("time");
const message = document.getElementById("message");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const hats = document.querySelectorAll("#progress img");
const chopperTop = document.getElementById("choppertop");
const chopperBottom = document.getElementById("chopperBottom");
 
 
// ── FORMAT TIME ──────────────────────────────────────────────────
function formatTime(secs) {
  if (secs < 0) secs = 0;
  let mins = Math.floor(secs / 60);
  let seconds = secs % 60;
  let secStr = seconds < 10 ? "0" + seconds : seconds;
  return mins + ":" + secStr;
}
 
 
// ── UPDATE DISPLAY ───────────────────────────────────────────────
function updateDisplay() {
  timeDisplay.innerHTML = formatTime(totalSeconds);
}
 
 
// ── CHOPPER SWITCHER ─────────────────────────────────────────────
function updateChopper(state) {
 
  // reset both to visible with no animation first
  chopperTop.style.display = "block";
  chopperBottom.style.display = "block";
  chopperBottom.style.transition = "all 0.5s ease";
 
  if (state === "idle") {
    // top bounces slowly, bottom sways left and right
    chopperTop.style.animation = "bounce 1.5s ease-in-out infinite";
    chopperBottom.style.animation = "sway 2s ease-in-out infinite";
 
  } else if (state === "focus") {
    // top sits still and serious, bottom hides
    chopperTop.style.animation = "none";
    chopperBottom.style.display = "none";
 
  } else if (state === "break") {
    // top bounces happily, bottom sways — break time!
    chopperTop.style.animation = "bounce 1s ease-in-out infinite";
    chopperBottom.style.animation = "sway 1.5s ease-in-out infinite";
 
  } else if (state === "waiting") {
    // top bounces fast impatiently, bottom sways fast too
    chopperTop.style.animation = "bounce 0.6s ease-in-out infinite";
    chopperBottom.style.animation = "sway 0.8s ease-in-out infinite";
 
  } else if (state === "done") {
    // both bounce happily — all done!
    chopperTop.style.animation = "bounce 0.8s ease-in-out infinite";
    chopperBottom.style.animation = "sway 0.8s ease-in-out infinite";
  }
}
 
 
// ── TICK ─────────────────────────────────────────────────────────
function tick() {
  if (totalSeconds <= 0) {
    clearInterval(timerInterval);
    isRunning = false;
    handleSessionEnd();
    return;
  }
  totalSeconds--;
  updateDisplay();
  if (totalSeconds === 0) {
    clearInterval(timerInterval);
    isRunning = false;
    handleSessionEnd();
  }
}
 
 
// ── HANDLE SESSION END ───────────────────────────────────────────
function handleSessionEnd() {
  if (!isBreak) {
    // focus ended — start break
    isBreak = true;
    alarmSound.play();
    showNotification("Focus Session Complete! Time for a break! ;)");
    totalSeconds = breakInput.value * 60;
    message.innerHTML = "<h2>Take a Break! ☕</h2>";
    updateDisplay();
    updateChopper("break");
    isRunning = true;
    timerInterval = setInterval(tick, 1000);
 
  } else {
    // break ended — back to focus
    isBreak = false;
      alarmSound.loop=true;
      alarmSound.play();
    showNotification("Break's Over! Come Back and Press Start!! 💪");
    // light up completed session hat
    if (session <= 4) {
      hats[session - 1].style.opacity = "1";
      hats[session - 1].style.filter = "none";
    }
 
    session++;
 
    // all 4 sessions done!
    if (session > 4) {
      message.innerHTML = "<h2>All done! You're amazing! 🎉🍂</h2>";
      updateChopper("done");
      // reset for next round
      setTimeout(() => {
        session = 1;
        isBreak = false;
        totalSeconds = Math.round(focusInput.value * 60);
        updateDisplay();
        updateChopper("idle");
        hats.forEach(hat => {
          hat.style.opacity = "0.4";
          hat.style.filter = "grayscale(100%)";
        });
      }, 3000); // wait 3 seconds so user can see the done message
      return;
    }
 
    // load focus time and wait for user to click start
    totalSeconds = Math.round(focusInput.value * 60);
    updateDisplay();
    message.innerHTML = "<h2>Ready for session " + session + "? 🍂</h2>";
    updateChopper("waiting");
  }
}
 
 
// ── START BUTTON ─────────────────────────────────────────────────
startBtn.onclick = function() {
  if (isRunning) return;
  isRunning = true;
  message.innerHTML = "<h2>Time to Focus! 📚</h2>";
  updateChopper("focus");
  alarmSound.pause();
  alarmSound.currentTime = 0;
  alarmSound.loop=false;
  timerInterval = setInterval(tick, 1000);
}
 
 
// ── PAUSE BUTTON ─────────────────────────────────────────────────
pauseBtn.onclick = function() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
  message.innerHTML = "<h2>Paused ⏸</h2>";
  updateChopper("idle");
}
 
 
// ── RESET BUTTON ─────────────────────────────────────────────────
resetBtn.onclick = function() {
  clearInterval(timerInterval);
  isRunning = false;
  isBreak = false;
  session = 1;
  totalSeconds = focusInput.value * 60;
  updateDisplay();
  message.innerHTML = "<h2>Time to Focus! 🍂</h2>";
  updateChopper("idle");
  hats.forEach(hat => {
    hat.style.opacity = "0.4";
    hat.style.filter = "grayscale(100%)";
  });
}
 
 
// ── INPUT LISTENERS ──────────────────────────────────────────────
focusInput.addEventListener("input", function() {
  if (!isRunning && !isBreak) {
    totalSeconds = Math.round(focusInput.value * 60);
    updateDisplay();
  }
});
 
breakInput.addEventListener("input", function() {
  if (!isRunning && isBreak) {
    totalSeconds = Math.round(breakInput.value * 60);
    updateDisplay();
  }
});
 
 
// ── INITIAL SETUP ────────────────────────────────────────────────
hats.forEach(hat => {
  hat.style.opacity = "0.4";
  hat.style.filter = "grayscale(100%)";
});
 
updateDisplay();
updateChopper("idle");

const taskList = document.getElementById("task-list");

taskList.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const inputs = document.querySelectorAll(".task-input");
    const lastInput = inputs[inputs.length - 1];
    if (document.activeElement === lastInput) {
      createNewTask();
    }
  }
});

taskList.addEventListener("keydown", function(e) {
  if (e.key === "Backspace") {
    const inputs = document.querySelectorAll(".task-input");
    if (inputs.length <= 3) return;
    if (e.target.value === "") {
      const currentRow = e.target.parentElement;
      const previousRow = currentRow.previousElementSibling;
      currentRow.remove();
      saveTasks();
      if (previousRow) {
        previousRow.querySelector(".task-input").focus();
      }
    }
  }
});

taskList.addEventListener("input", saveTasks);

function createNewTask() {

  const row = document.createElement("div");
  row.className = "task-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-input";

  row.appendChild(checkbox);
  row.appendChild(input);

  taskList.appendChild(row);

  input.focus();

  saveTasks();

}

function saveTasks() {

  const rows = document.querySelectorAll(".task-row");

  const tasks = [];

  rows.forEach(row => {

    const checkbox = row.querySelector("input[type='checkbox']");
    const input = row.querySelector(".task-input");

    tasks.push({
      text: input.value,
      checked: checkbox.checked
    });

  });

  localStorage.setItem("tasks", JSON.stringify(tasks));

}

function loadTasks() {

  const saved = JSON.parse(localStorage.getItem("tasks"));

  if (!saved) return;

  taskList.innerHTML = "";

  saved.forEach(task => {

    const row = document.createElement("div");
    row.className = "task-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.checked;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-input";
    input.value = task.text;

    row.appendChild(checkbox);
    row.appendChild(input);

    taskList.appendChild(row);

  });

  ensureMinimumTasks();

}

function ensureMinimumTasks() {

  const rows = document.querySelectorAll(".task-row");

  const missing = 3 - rows.length;

  for (let i = 0; i < missing; i++) {

    createNewTask();

  }

}

loadTasks();

function showNotification(message) {

    if (Notification.permission === "granted") {

        new Notification("Choppodoro", {
            body: message,
            icon: "hat.png"
        });

    }

}



