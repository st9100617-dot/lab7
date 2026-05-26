const BASE_URL = "https://todo-e33b2-default-rtdb.firebaseio.com/todos.json";

let todos = [];

function showLoading(isLoading) {
  const spinner = document.getElementById("loading-spinner");
  spinner.style.display = isLoading ? "block" : "none";
}

function showError(message) {
  const errorBox = document.getElementById("error-message");
  errorBox.innerText = message;
  errorBox.style.display = "block";
  setTimeout(() => {
    errorBox.style.display = "none";
  }, 3000);
}

function fetchTodos() {
  showLoading(true);
  fetch(BASE_URL)
    .then(response => {
      if (!response.ok) throw new Error("Не вдалося завантажити дані");
      return response.json();
    })
    .then(data => {
      showLoading(false);
      if (!data) {
        todos = [];
      } else {
        todos = Object.keys(data).map(key => ({
          id: key,
          text: data[key].text,
          completed: data[key].completed
        }));
      }
      renderTodos();
    })
    .catch(error => {
      showLoading(false);
      showError("Помилка з'єднання з базою даних!");
      console.error(error);
    });
}

function addTodo(todoText) {
  showLoading(true);
  const newTodo = {
    text: todoText,
    completed: false
  };

  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(newTodo),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
    showLoading(false);
    todos.push({ id: data.name, ...newTodo });
    renderTodos();
  })
  .catch(error => {
    showLoading(false);
    showError("Не вдалося зберегти справу!");
  });
}

function handleAddTodo() {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;

  addTodo(text);
  input.value = "";
}

function toggleTodoStatus(id, currentStatus) {
  showLoading(true);
  
  const itemUrl = BASE_URL.replace(".json", `/${id}.json`);

  fetch(itemUrl, {
    method: "PATCH",
    body: JSON.stringify({ completed: !currentStatus }),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
    showLoading(false);
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = data.completed;
      renderTodos();
    }
  })
  .catch(error => {
    showLoading(false);
    showError("Не вдалося оновити статус.");
  });
}

function deleteTodo(id) {
  showLoading(true);

  const itemUrl = BASE_URL.replace(".json", `/${id}.json`);

  fetch(itemUrl, {
    method: "DELETE"
  })
  .then(response => {
    showLoading(false);
    if (response.ok) {
      todos = todos.filter(todo => todo.id !== id);
      renderTodos();
    }
  })
  .catch(error => {
    showLoading(false);
    showError("Не вдалося видалити справу.");
  });
}

function renderTodos() {
  const listElement = document.getElementById("todo-list");
  listElement.innerHTML = "";

  todos.forEach(todo => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.className = `todo-text ${todo.completed ? "completed" : ""}`;
    span.textContent = todo.text;
    span.onclick = () => toggleTodoStatus(todo.id, todo.completed);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Видалити";
    deleteBtn.onclick = () => deleteTodo(todo.id);

    li.appendChild(span);
    li.appendChild(deleteBtn);
    listElement.appendChild(li);
  });
}

window.addEventListener("DOMContentLoaded", fetchTodos);