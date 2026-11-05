function hitungLuas(r) {
  return Math.PI * r * r;
}

let luas1 = hitungLuas(5);
let luas2 = hitungLuas(8);
let luas3 = hitungLuas(10);
let luas4 = hitungLuas(3);

console.log("Luas lingkaran r=5: " + luas1.toFixed(2));
console.log("Luas lingkaran r=8: " + luas2.toFixed(2));
console.log("Luas lingkaran r=10: " + luas3.toFixed(2));
console.log("Luas lingkaran r=3: " + luas4.toFixed(2));

document.getElementById("output").innerHTML = `
  <p>Luas (r=5): <b>${luas1.toFixed(2)}</b></p>
  <p>Luas (r=8): <b>${luas2.toFixed(2)}</b></p>
  <p>Luas (r=10): <b>${luas3.toFixed(2)}</b></p>
  <p>Luas (r=3): <b>${luas4.toFixed(2)}</b></p>
`;