const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const completedCount = document.getElementById("completed-count");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

// Load saved tasks from the browser
let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("myTodoTasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(
            task =>
                task &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

// Save tasks in browser storage
function saveTasks() {
    try {
        localStorage.setItem("myTodoTasks", JSON.stringify(tasks));
    } catch (error) {
        message.textContent = "Unable to save tasks in this browser.";
    }
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        message.textContent = "Please enter a task first!";
        taskInput.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();

    taskInput.value = "";
    message.textContent = "";
    taskInput.focus();

    renderTasks();
});

// Show tasks on the page
function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.text + " as completed"
        );

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.text);

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, taskText, deleteButton);
        taskList.appendChild(item);
    });

    const pending = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;

    taskCount.textContent = pending + (pending === 1 ? " task left" : " tasks left");
    completedCount.textContent = completed + " completed";

    emptyState.hidden = filteredTasks.length > 0;

    if (filteredTasks.length === 0) {
        if (tasks.length === 0) {
            emptyState.querySelector("h3").textContent = "No tasks yet";
            emptyState.querySelector("p").textContent =
                "Add a task above to get started!";
        } else {
            emptyState.querySelector("h3").textContent = "No tasks found";
            emptyState.querySelector("p").textContent =
                "Try another filter or add a new task.";
        }
    }
}

// Filter: All, Pending, Completed
filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            const isActive = btn === button;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });

        renderTasks();
    });
});

// Remove all completed tasks
clearCompletedBtn.addEventListener("click", function () {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// Display saved tasks when the page opens
renderTasks();