document.addEventListener("DOMContentLoaded", () => {
  let items = {};
  const allItemInputs = {};
  const loadingMsg = document.getElementById('loadingMsg');
  const errorMsg = document.getElementById('errorMsg');
  const itemSections = document.getElementById('item-sections');

// fetch item data from the server
fetch("https://tsa-backend-id2a.onrender.com/item-prices")
  .then((res) => {
    if (!res.ok) throw new Error("Fetch failed with status " + res.status);
    return res.json();
  })
  .then((data) => {
    items = data;
    renderCategorizedItems(data);
    loadingMsg.style.display = "none";
  })
  .catch((err) => {
    console.error("Error fetching item data:", err);
    loadingMsg.style.display = "none";
    errorMsg.style.display = "block";
  });

// load categorized items
function renderCategorizedItems(categorizedItems) {
  for (const [category, categoryItems] of Object.entries(categorizedItems)) {
    const section = document.createElement("section");
    const header = document.createElement("h3");
    header.textContent = category;
    section.appendChild(header);

    categoryItems.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item-entry");
      const inputId = item.id;

      itemDiv.innerHTML = `
        <label>
          ${item.title} ($${item.price}):
          <input type="number" min="0" value="0" id="${inputId}">
        </label>
      `;

      allItemInputs[inputId] = item;
      section.appendChild(itemDiv);
    });

    itemSections.appendChild(section);
  }
}

function calculateTotal() {
  let total = 0;
  let breakdownHTML = "<h3>Order Breakdown:</h3><ul>";
  const discount = document.getElementById("discountType").value;

  for (const [itemId, item] of Object.entries(allItemInputs)) {
    const quantity = parseInt(document.getElementById(itemId).value) || 0;

    if (quantity > 0) {
      let unitPrice = item.price;

      if (item.type === "Merch") {
        if (discount === "easycard") {
          unitPrice = item.price * 0.9; // 10% off for EasyCard/board members
        } else if (discount === "board" && item.cost !== undefined) {
          unitPrice = item.cost; // Board members with EasyCard pay item cost
        }
      }

      const itemTotal = unitPrice * quantity;
      total += itemTotal;
      breakdownHTML += `<li>${quantity} x ${item.title} - $${itemTotal.toFixed(2)}</li>`;
    }
  }

  total = Math.round(total * 100) / 100;
  document.getElementById("totalDisplay").innerText = `Total: $${total}`;
  document.getElementById("breakdown").innerHTML = breakdownHTML + "</ul>";
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

