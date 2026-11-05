// Membuat elemen input dan tombol 
let inputTask = document.createElement("input"); 
inputTask.type = "text"; 
inputTask.placeholder = "Masukkan tugas baru..."; 
inputTask.id = "task-input"; 
let btnAdd = document.createElement("button"); 
btnAdd.textContent = "Tambah"; 
btnAdd.id = "add-task"; 
let taskList = document.createElement("ul"); 
taskList.id = "task-list"; 
// Menambahkan event listener 
btnAdd.onclick = function() { 
let taskText = inputTask.value.trim(); 
if (taskText !== "") { 
addTask(taskText); 
inputTask.value = ""; 
saveTasks(); 
} 
}; 
// Fungsi untuk menambahkan tugas 
function addTask(taskText) { 
let li = document.createElement("li"); 
let checkbox = document.createElement("input"); 
checkbox.type = "checkbox"; 
checkbox.addEventListener("change", function() { 
if (this.checked) { 
taskSpan.style.textDecoration = "line-through"; 
} else { 
taskSpan.style.textDecoration = "none"; 
} 
saveTasks(); 
}); 
let taskSpan = document.createElement("span"); 
taskSpan.textContent = taskText; 
let deleteBtn = document.createElement("button"); 
deleteBtn.textContent = "Hapus"; 
deleteBtn.addEventListener("click", function() { 
li.remove(); 
saveTasks(); 
}); 
li.appendChild(checkbox); 
li.appendChild(taskSpan); 
li.appendChild(deleteBtn); 
taskList.appendChild(li); 
} 
// Fungsi untuk menyimpan tugas ke localStorage 
function saveTasks() { 
let tasks = []; 
document.querySelectorAll("#task-list li").forEach(function(li) { 
let taskText = li.querySelector("span").textContent; 
let isCompleted = li.querySelector("input[type='checkbox']").checked; 
tasks.push({ text: taskText, completed: isCompleted }); 
}); 
localStorage.setItem("tasks", JSON.stringify(tasks)); 
} 
// Fungsi untuk memuat tugas dari localStorage 
function loadTasks() { 
let savedTasks = localStorage.getItem("tasks"); 
if (savedTasks) { 
let tasks = JSON.parse(savedTasks); 
tasks.forEach(function(task) { 
addTask(task.text); 
let lastAdded = taskList.lastChild; 
let checkbox = lastAdded.querySelector("input[type='checkbox']"); 
checkbox.checked = task.completed; 
if (task.completed) { 
lastAdded.querySelector("span").style.textDecoration = 
"line-through"; 
} 
}); 
} 
} 
// Menambahkan elemen ke output 
let outputDiv = document.getElementById("output5"); 
outputDiv.appendChild(inputTask); 
outputDiv.appendChild(btnAdd); 
outputDiv.appendChild(taskList); 
// Memuat tugas yang disimpan 
loadTasks();