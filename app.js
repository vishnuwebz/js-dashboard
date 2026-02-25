
// Topics covered here: First Program, Comments, Variables & Data Types,
// Arithmetic / Assignment / Comparison / Logical Operators, If–Else, Switch,
// Loops, Functions, Arrays, Strings, Math object, DOM & Selectors,
// Create/Remove Elements, Events, OOP, Inheritance, localStorage.

// ===================== 1. FIRST PROGRAM + COMMENTS ======================
// (First Program, Comments) – Simple log to show script is running.
console.log("Task & Notes Dashboard loaded successfully.");

// ===================== 2. GLOBAL CONSTANTS & DOM SELECTORS ===============
// (Variables & Data Types, DOM Selectors)
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const filterSelect = document.getElementById("filterSelect");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const statTotal = document.getElementById("statTotal");
const statCompleted = document.getElementById("statCompleted");
const statPending = document.getElementById("statPending");

const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const notesStatus = document.getElementById("notesStatus");

// (Variables & Data Types) – primitive types and arrays.
let currentFilter = "all"; // string
let lastSavedNoteTime = null; // null initially

// ===================== 3. UTILITY FUNCTIONS =============================
// (Functions, Strings, Math object)

// Generate a semi-random ID using Math (Math object)
function generateId() {
  // (Math object, Arithmetic operators)
  const randomPart = Math.floor(Math.random() * 1000000);
  const timestampPart = Date.now();
  return `${timestampPart}-${randomPart}`;
}

// Get a human readable time difference string for notes status
function formatTimeAgo(date) {
  if (!date) {
    return "Not saved yet.";
  }
  const now = new Date();
  const diffMs = now - date; // (Arithmetic)
  const diffMinutes = Math.floor(diffMs / (1000 * 60)); // (Arithmetic)
  // (If–Else)
  if (diffMinutes < 1) {
    return "Saved just now.";
  } else if (diffMinutes === 1) {
    return "Saved 1 minute ago.";
  } else if (diffMinutes < 60) {
    return `Saved ${diffMinutes} minutes ago.`;
  } else {
    const diffHours = Math.floor(diffMinutes / 60);
    return `Saved about ${diffHours} hour(s) ago.`;
  }
}

// ===================== 4. OOP DESIGN – BASE CLASSES ======================
// (OOP, Inheritance, Functions, Arrays)

// BaseApp class to handle localStorage operations (Inheritance parent)
class BaseApp {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  // Save data to localStorage
  saveToStorage(data) {
    // (localStorage, JSON, Functions)
    const json = JSON.stringify(data);
    localStorage.setItem(this.storageKey, json);
  }

  // Load data from localStorage
  loadFromStorage(defaultValue) {
    const json = localStorage.getItem(this.storageKey);
    // (If–Else, Comparison Operators)
    if (json === null || json === undefined) {
      return defaultValue;
    }
    try {
      return JSON.parse(json);
    } catch (e) {
      console.warn("Failed to parse storage data", e);
      return defaultValue;
    }
  }
}

// Task model – represents a single todo item
class Task {
  // (OOP, Constructor, this)
  constructor(id, description, completed = false, createdAt = new Date()) {
    this.id = id; // string
    this.description = description; // string
    this.completed = completed; // boolean
    this.createdAt = createdAt; // date
  }
}

// TodoApp extends BaseApp – demonstration of inheritance
class TodoApp extends BaseApp {
  constructor(storageKey) {
    super(storageKey); // (Inheritance, super call)
    this.tasks = this.loadTasks();
  }

  loadTasks() {
    const raw = this.loadFromStorage([]);
    // Convert plain objects back into Task instances if needed
    // (Loops, Arrays)
    const tasks = [];
    for (let i = 0; i < raw.length; i++) {
      const t = raw[i];
      tasks.push(
        new Task(
          t.id,
          t.description,
          Boolean(t.completed),
          t.createdAt ? new Date(t.createdAt) : new Date()
        )
      );
    }
    return tasks;
  }

  persist() {
    this.saveToStorage(this.tasks);
  }

  // Add task using string trimming etc. (Strings, Functions)
  addTask(description) {
    const trimmed = description.trim(); // (Strings)
    // (If–Else)
    if (trimmed.length === 0) {
      return false;
    }
    const newTask = new Task(generateId(), trimmed, false, new Date());
    this.tasks.push(newTask); // (Arrays)
    this.persist();
    return true;
  }

  toggleTaskCompletion(taskId) {
    // (Loops, Comparison Operators, Logical Operators)
    for (let i = 0; i < this.tasks.length; i++) {
      const t = this.tasks[i];
      if (t.id === taskId) {
        t.completed = !t.completed; // (Logical NOT, Assignment)
        this.persist();
        break;
      }
    }
  }

  deleteTask(taskId) {
    // (Arrays, Loops, Comparison)
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.persist();
  }

  editTask(taskId, newDescription) {
    const trimmed = newDescription.trim();
    if (trimmed.length === 0) {
      return false;
    }
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        this.tasks[i].description = trimmed;
        this.persist();
        return true;
      }
    }
    return false;
  }

  clearCompleted() {
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.persist();
  }

  // Calculate stats (Arithmetic, Loops)
  getStats() {
    let total = this.tasks.length;
    let completed = 0;
    // (Loops, If–Else)
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].completed === true) {
        completed++;
      }
    }
    const pending = total - completed; // (Arithmetic)
    return { total, completed, pending };
  }

  // Filter tasks based on currentFilter (Switch Statement)
  getTasksForFilter(filter) {
    switch (filter) {
      case "completed":
        return this.tasks.filter((t) => t.completed === true);
      case "pending":
        return this.tasks.filter((t) => t.completed === false);
      case "all":
      default:
        return this.tasks;
    }
  }
}

// NotesApp – separate class, also extends BaseApp to show inheritance reuse
class NotesApp extends BaseApp {
  constructor(storageKey) {
    super(storageKey);
  }

  saveNotes(content) {
    // (Strings, Functions)
    const data = {
      content,
      savedAt: new Date().toISOString(),
    };
    this.saveToStorage(data);
  }

  loadNotes() {
    const data = this.loadFromStorage({ content: "", savedAt: null });
    return data;
  }
}

// ===================== 5. APP INSTANCES =================================
const todoApp = new TodoApp("js_dashboard_tasks");
const notesApp = new NotesApp("js_dashboard_notes");

// ===================== 6. RENDERING FUNCTIONS (DOM, CREATE/REMOVE) =======

// Render tasks in the DOM (DOM Manipulation, Loops, Create/Remove Elements)
function renderTasks() {
  const tasksToShow = todoApp.getTasksForFilter(currentFilter);
  taskList.innerHTML = ""; // Clear list first

  if (tasksToShow.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  // (Loops)
  for (let i = 0; i < tasksToShow.length; i++) {
    const task = tasksToShow[i];

    // Create list item
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) {
      li.classList.add("completed");
    }
    li.dataset.id = task.id;

    // Check / complete button
    const checkBtn = document.createElement("button");
    checkBtn.className = "task-check";
    checkBtn.textContent = task.completed ? "✓" : "";
    checkBtn.title = "Toggle complete";

    // Task content
    const contentDiv = document.createElement("div");
    contentDiv.className = "task-content";

    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.description;

    const metaSpan = document.createElement("span");
    metaSpan.className = "task-meta";
    const createdDate = new Date(task.createdAt);
    metaSpan.textContent = `Created: ${createdDate.toLocaleString()}`;

    contentDiv.appendChild(titleSpan);
    contentDiv.appendChild(metaSpan);

    // Actions
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn delete";
    deleteBtn.textContent = "Delete";

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(checkBtn);
    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);

    taskList.appendChild(li);
  }

  // Update stats
  const stats = todoApp.getStats();
  statTotal.textContent = stats.total;
  statCompleted.textContent = stats.completed;
  statPending.textContent = stats.pending;
}

// Load notes into UI
function renderNotes() {
  const data = notesApp.loadNotes();
  notesArea.value = data.content || "";
  if (data.savedAt) {
    lastSavedNoteTime = new Date(data.savedAt);
  }
  notesStatus.textContent = formatTimeAgo(lastSavedNoteTime);
}

// ===================== 7. EVENT HANDLERS (EVENTS, IF–ELSE, LOGICAL) =====

// Add task handler
function handleAddTask() {
  const value = taskInput.value;
  const success = todoApp.addTask(value);
  // (If–Else, Logical Operators)
  if (!success) {
    alert("Please enter a non-empty task.");
    return;
  }
  taskInput.value = "";
  renderTasks();
}

// Click on list (event delegation)
function handleTaskListClick(event) {
  const target = event.target;
  const li = target.closest(".task-item");
  if (!li) return;
  const taskId = li.dataset.id;

  // (If–Else, Logical Operators, Strings)
  if (target.classList.contains("task-check")) {
    todoApp.toggleTaskCompletion(taskId);
    renderTasks();
  } else if (target.classList.contains("delete")) {
    const confirmDelete = confirm("Delete this task?");
    if (confirmDelete) {
      todoApp.deleteTask(taskId);
      renderTasks();
    }
  } else if (target.classList.contains("edit")) {
    const existingText = li.querySelector(".task-title").textContent;
    const newText = prompt("Edit task:", existingText);
    if (newText !== null) {
      const updated = todoApp.editTask(taskId, newText);
      if (!updated) {
        alert("Task cannot be empty.");
      }
      renderTasks();
    }
  }
}

// Filter change handler (Switch already used inside getTasksForFilter)
function handleFilterChange() {
  currentFilter = filterSelect.value;
  renderTasks();
}

// Clear completed handler
function handleClearCompleted() {
  todoApp.clearCompleted();
  renderTasks();
}

// Save notes handler
function handleSaveNotes() {
  const content = notesArea.value;
  notesApp.saveNotes(content);
  lastSavedNoteTime = new Date();
  notesStatus.textContent = formatTimeAgo(lastSavedNoteTime);
}

// ===================== 8. EVENT LISTENERS REGISTRATION ===================
// (Events, DOM selectors)
addTaskBtn.addEventListener("click", handleAddTask);
taskInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    handleAddTask();
  }
});

taskList.addEventListener("click", handleTaskListClick);
filterSelect.addEventListener("change", handleFilterChange);
clearCompletedBtn.addEventListener("click", handleClearCompleted);

saveNotesBtn.addEventListener("click", handleSaveNotes);

// ===================== 9. INITIAL RENDER ON PAGE LOAD ===================
renderTasks();
renderNotes();
