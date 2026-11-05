// Membuat form 
let form = document.createElement("form"); 
// Input nama 
let labelNama = document.createElement("label"); 
labelNama.textContent = "Nama: "; 
let inputNama = document.createElement("input"); 
inputNama.type = "text"; 
inputNama.id = "nama"; 
// Input email 
let labelEmail = document.createElement("label"); 
labelEmail.textContent = "Email: "; 
let inputEmail = document.createElement("input"); 
inputEmail.type = "email"; 
inputEmail.id = "email"; 
// Tombol submit 
let btnSubmit = document.createElement("button"); 
btnSubmit.type = "button"; 
btnSubmit.textContent = "Submit"; 
// Area pesan error 
let errorDiv = document.createElement("div"); 
errorDiv.id = "error-message"; 
errorDiv.style.color = "red"; 
// Menambahkan event listener 
btnSubmit.onclick = function() { 
let nama = inputNama.value; 
let email = inputEmail.value; 
let errorMessage = ""; 
if (nama === "") { 
errorMessage += "Nama tidak boleh kosong. "; 
} 
if (email.indexOf("@") === -1) { 
errorMessage += "Email harus mengandung @. "; 
} 
if (errorMessage !== "") { 
errorDiv.textContent = errorMessage; 
} else { 
errorDiv.textContent = "Form valid! Data berhasil dikirim."; 
errorDiv.style.color = "green"; 
} 
}; 
// Menambahkan elemen ke form 
form.appendChild(labelNama); 
form.appendChild(inputNama); 
form.appendChild(document.createElement("br")); 
form.appendChild(labelEmail); 
form.appendChild(inputEmail); 
form.appendChild(document.createElement("br")); 
form.appendChild(btnSubmit); 
form.appendChild(errorDiv); 
// Menambahkan form ke output 
let outputDiv = document.getElementById("output4"); 
outputDiv.appendChild(form); 