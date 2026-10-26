const MAX_IN_PROGRESS = 3;
const STATUSES = ["todo", "inprogress", "done"];
const PRIORITY_NAMES = ["", "Low", "Medium", "High"];

let tasks = [
  { id: 1,  title: "Review multiplication table and arithmetic", status: "done",       priority: 1, hours: 1, urgent: false, tags: ["Algebra"] },
  { id: 2,  title: "Solve modular arithmetic proofs",           status: "done",       priority: 3, hours: 2, urgent: true,  tags: ["Discrete Math", "Proofs"] },
  { id: 3,  title: "Study Chinese Remainder Theorem examples",  status: "inprogress", priority: 3, hours: 2, urgent: true,  tags: ["Discrete Math"] },
  { id: 4,  title: "Practice mathematical induction",           status: "inprogress", priority: 2, hours: 2, urgent: false, tags: ["Discrete Math", "Proofs"] },
  { id: 5,  title: "Solve set theory and binary relations",     status: "todo",       priority: 2, hours: 3, urgent: false, tags: ["Discrete Math"] },
  { id: 6,  title: "Review logic and truth tables",             status: "todo",       priority: 1, hours: 1, urgent: false, tags: ["Discrete Math"] },
  { id: 7,  title: "Prepare for matrix determinants quiz",      status: "todo",       priority: 3, hours: 2, urgent: true,  tags: ["Algebra", "Quiz"] },
  { id: 8,  title: "Complete calculus limit exercises",         status: "done",       priority: 2, hours: 2, urgent: false, tags: ["Calculus"] },
  { id: 9,  title: "Practice combinatorics and permutations",   status: "todo",       priority: 2, hours: 2, urgent: false, tags: ["Algebra"] },
  { id: 10, title: "Revise graph theory tree traversal",        status: "todo",       priority: 1, hours: 3, urgent: false, tags: ["Discrete Math"] },
  { id: 11, title: "Practice derivative rules",                 status: "todo",       priority: 2, hours: 2, urgent: false, tags: ["Calculus"] },
  { id: 12, title: "Read vector spaces notes",                  status: "todo",       priority: 1, hours: 1, urgent: false, tags: ["Algebra"] }
];

let searchText = "";
let selectedTag = "all";
let sortMode = "none";
let message = "";

const board = document.getElementById("board");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");
const sortSelect = document.getElementById("sortSelect");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const messageBox = document.getElementById("message");
const emptyMessage = document.getElementById("emptyMessage");
const lists = {
  todo: document.getElementById("todoList"),
  inprogress: document.getElementById("inprogressList"),
  done: document.getElementById("doneList")
};
const counters = {
  todo: document.getElementById("todoCount"),
  inprogress: document.getElementById("inprogressCount"),
  done: document.getElementById("doneCount")
};

function countByStatus(status) {
  let n = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === status) {
      n++;
    }
  }
  return n;
}

function getVisibleTasks() {
  let result = [];
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    let matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
    let matchesTag = selectedTag === "all" || task.tags.includes(selectedTag);
    if (matchesSearch && matchesTag) {
      result.push(task);
    }
  }
  if (sortMode === "high") {
    result.sort(function (a, b) { return b.priority - a.priority; });
  }
  if (sortMode === "low") {
    result.sort(function (a, b) { return a.priority - b.priority; });
  }
  return result;
}

function createButton(text, action, id, label) {
  let button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.id = id;
  button.setAttribute("aria-label", label);
  return button;
}

function createCard(task) {
  let card = document.createElement("div");
  card.className = "card prio-" + task.priority;

  let title = document.createElement("h3");
  title.textContent = task.title;

  let meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = PRIORITY_NAMES[task.priority] + " priority · " + task.hours + " h";

  let tagBox = document.createElement("div");
  for (let i = 0; i < task.tags.length; i++) {
    let tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = task.tags[i];
    tagBox.appendChild(tag);
  }
  if (task.urgent === true) {
    let urgent = document.createElement("span");
    urgent.className = "tag urgent";
    urgent.textContent = "Urgent";
    tagBox.appendChild(urgent);
  }

  let buttons = document.createElement("div");
  buttons.className = "card-buttons";
  if (task.status !== "todo") {
    buttons.appendChild(createButton("←", "left", task.id, "Move back: " + task.title));
  }
  if (task.status !== "done") {
    buttons.appendChild(createButton("→", "right", task.id, "Move forward: " + task.title));
  }

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(tagBox);
  card.appendChild(buttons);
  return card;
}

function render() {
  let visible = getVisibleTasks();
  let counts = { todo: 0, inprogress: 0, done: 0 };

  for (let i = 0; i < STATUSES.length; i++) {
    lists[STATUSES[i]].textContent = "";
  }

  for (let i = 0; i < visible.length; i++) {
    counts[visible[i].status]++;
    lists[visible[i].status].appendChild(createCard(visible[i]));
  }

  for (let i = 0; i < STATUSES.length; i++) {
    let status = STATUSES[i];
    counters[status].textContent = counts[status];
    if (counts[status] === 0) {
      let empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Nothing here";
      lists[status].appendChild(empty);
    }
  }

  emptyMessage.classList.toggle("hidden", visible.length > 0);
  messageBox.textContent = message;
  messageBox.classList.toggle("error", message !== "");

  let doneCount = 0;
  let hoursLeft = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === "done") {
      doneCount++;
    } else {
      hoursLeft += tasks[i].hours;
    }
  }
  let percent = Math.round((doneCount / tasks.length) * 100);
  progressBar.value = percent;
  progressText.textContent = percent + "% (" + hoursLeft + " h left)";
}

function findTask(id) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      return tasks[i];
    }
  }
  return null;
}

function moveTask(id, direction) {
  let task = findTask(id);
  if (task === null) { return; }

  let index = STATUSES.indexOf(task.status);
  if (direction === "right") { index++; } else { index--; }
  let newStatus = STATUSES[index];
  if (newStatus === undefined) { return; }

  if (newStatus === "inprogress" && countByStatus("inprogress") >= MAX_IN_PROGRESS) {
    message = "Blocked: 'In progress' can hold only " + MAX_IN_PROGRESS + " cards. Finish one first.";
    render();
    return;
  }

  task.status = newStatus;
  message = "";
  render();
}

function buildTagFilter() {
  let allTags = [];
  for (let i = 0; i < tasks.length; i++) {
    for (let j = 0; j < tasks[i].tags.length; j++) {
      if (allTags.indexOf(tasks[i].tags[j]) === -1) {
        allTags.push(tasks[i].tags[j]);
      }
    }
  }
  allTags.sort();
  allTags.unshift("all");

  for (let i = 0; i < allTags.length; i++) {
    let option = document.createElement("option");
    option.value = allTags[i];
    option.textContent = allTags[i] === "all" ? "All subjects" : allTags[i];
    tagFilter.appendChild(option);
  }
}
board.addEventListener("click", function (event) {
  let button = event.target.closest("button");
  if (button === null || button.dataset.action === undefined) { return; }
  moveTask(Number(button.dataset.id), button.dataset.action);
});

searchInput.addEventListener("input", function () {
  searchText = searchInput.value;
  render();
});
tagFilter.addEventListener("change", function () {
  selectedTag = tagFilter.value;
  render();
});
sortSelect.addEventListener("change", function () {
  sortMode = sortSelect.value;
  render();
});

buildTagFilter();
render();