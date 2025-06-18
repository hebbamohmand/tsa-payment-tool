let items = {};

const form = document.getElementById('paymentForm');
const loadingMsg = document.getElementById('loadingMsg');
const errorMsg = document.getElementById('errorMsg');

// fetch item data from the server
fetch("https://tsa-backend-6ycb.onrender.com/item-prices")
  .then((res) => {
    if (!res.ok) throw new Error("Fetch failed with status " + res.status);
    return res.json();
  })
  .then((data) => {
    items = data;
    generateItemInputs();
    loadingMsg.style.display = "none";
  })
  .catch((err) => {
    console.error("Error fetching item data:", err);
    loadingMsg.style.display = "none";
    errorMsg.style.display = "block";
  });

function generateItemInputs() {
  for (let key in items) {
    const item = items[key];
    const label = document.createElement("label");
    label.className = "form-section";
    label.innerHTML = `${item.title} ($${item.price}): <input type="number" min="0" id="${key}" value="0">`;
    form.appendChild(label);
  }
  const calculateButton = document.createElement("button");
  calculateButton.textContent = "Calculate Total";
  calculateButton.type = "button";
  calculateButton.className = "form-section";
  calculateButton.onclick = calculateTotal;
  form.appendChild(calculateButton);
}

function calculateTotal() {
  let total = 0;
  let breakdownHTML = "<h3>Order Breakdown:</h3><ul>";
  const discount = document.getElementById("discountType").value;

  for (let key in items) {
    const item = items[key];
    const quantity = parseInt(document.getElementById(key).value) || 0;

    if (quantity > 0) {
      let unitPrice = item.price;

      if (item.type === "Merch") {
        if (discount === "easycard") {
          unitPrice = item.price * 0.9; // 10% discount
        } else if (discount === "board" && item.cost !== undefined) {
          unitPrice = item.cost; // wholesale price
        }
      }

      const itemTotal = unitPrice * quantity;
      total += itemTotal;
      breakdownHTML += `${quantity} × ${item.title} — $${itemTotal.toFixed(2)}<br>`;
    }
  }

  total = Math.round(total * 100) / 100;
  document.getElementById("totalDisplay").innerText = `Total: $${total}`;
  document.getElementById("breakdown").innerHTML = breakdownHTML;
  document.getElementById("qrbutton").style.display = total > 0 ? "inline" : "none";
}

function generateQR() {
  const total = parseFloat(document.getElementById("totalDisplay").innerText.split("$")[1]);
  const venmoUsername = "tsaatuva";
  const venmoURL = `https://venmo.com/${venmoUsername}?txn=pay&amount=${total}&note=TSA Purchase`;

  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("qrcode").style.display = "block";
  new QRCode(document.getElementById("qrcode"), venmoURL);
}
