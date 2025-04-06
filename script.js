let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

document.getElementById("search").addEventListener("input", () => renderTasks(currentFilter));

new Sortable(document.getElementById("taskList"), {
  animation: 150,
  onEnd: () => {
    if (currentFilter === "all") {
      const newOrder = [...document.getElementById("taskList").children];
      tasks = newOrder.map(li => tasks[li.dataset.index]);
      saveTasks();
    }
  }
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateStats();
}

function filterTasks(type) {
  currentFilter = type;
  renderTasks(currentFilter);
}

function getCategoryColors(category) {
  const colors = {
    Work: "#ff9800",
    Home: "#4caf50",
    Personal: "#2196f3"
  };
  return colors[category] || "#607d8b";
}

function sortTasks(taskList) {
  const option = document.getElementById("sortOption").value;
  if (option === "dueDate") {
    return [...taskList].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  }
  return taskList;
}
function renderTasks(filter = "all") {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const categoryFilter = document.getElementById("categoryFilter").value;
  const searchQuery = document.getElementById("search").value.toLowerCase();

  let filtered = tasks.filter((task) => {
    const matchesFilter =
      (filter === "all" && !task.deleted) ||
      (filter === "completed" && task.completed && !task.deleted) ||
      (filter === "deleted" && task.deleted);

    const matchesCategory = !categoryFilter || task.category === categoryFilter;
    const matchesSearch = task.name.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const sorted = sortTasks(filtered);

  sorted.forEach((task) => {
    const index = tasks.indexOf(task);
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.dataset.index = index;

    const categoryColor = task.color || getCategoryColors(task.category);

    li.innerHTML = `
      <label class="task-label">
        <input type="checkbox" onchange="toggleComplete(${index})" ${task.completed ? "checked" : ""}>
        <span contenteditable="true" onblur="editTask(${index}, this.textContent.trim())">
          ${task.favorite ? "⭐ " : ""}${task.name}
        </span>
        ${task.dueDate ? `<small class="due-date">📅 ${task.dueDate}</small>` : ""}
        ${task.category ? `<span class="category" style="background-color: ${categoryColor};">${task.category}</span>` : ""}
        ${task.priority ? `<span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>` : ""}
      </label>
      ${!task.deleted ? `
        <button onclick="toggleFavorite(${index})">${task.favorite ? "💔" : "⭐"}</button>
        <button class="delete" onclick="deleteTask(${index})">✗</button>` : ""}
    `;
    taskList.appendChild(li);
  });

  populateCategoryFilter();
  updateStats();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks(currentFilter);
}

function editTask(index, newName) {
  if (newName) {
    tasks[index].name = newName;
    saveTasks();
  }
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks[index].deleted = true;
    saveTasks();
    renderTasks(currentFilter);
  }
}

function toggleFavorite(index) {
  tasks[index].favorite = !tasks[index].favorite;
  saveTasks();
  renderTasks(currentFilter);
}

function handleAddTask() {
  const name = document.getElementById("newTaskInput").value.trim();
  const dueDate = document.getElementById("taskDueDate").value;
  const category = document.getElementById("taskCategory").value.trim();
  const color = document.getElementById("categoryColor").value;
  const priority = document.getElementById("taskPriority").value;

  if (name) {
    tasks.push({
      name,
      completed: false,
      deleted: false,
      dueDate,
      category,
      color,
      priority,
      favorite: false,
    });
    document.getElementById("newTaskInput").value = "";
    document.getElementById("taskDueDate").value = "";
    document.getElementById("taskCategory").value = "";
    renderTasks(currentFilter);
    saveTasks();
  }
}

function populateCategoryFilter() {
  const dropdown = document.getElementById("categoryFilter");
  const selected = dropdown.value;
  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];

  dropdown.innerHTML = `<option value="">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selected) option.selected = true;
    dropdown.appendChild(option);
  });
}

function updateStats() {
  const total = tasks.filter(t => !t.deleted).length;
  const completed = tasks.filter(t => t.completed && !t.deleted).length;
  const pending = total - completed;
  document.getElementById("stats").innerText = `📊 Total: ${total} | ✅ Completed: ${completed} | ⏳ Pending: ${pending}`;
}

renderTasks(currentFilter);
