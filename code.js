let currentPurchase = [];
let menuData = [];
let soldOutItems = {};

async function initialize() {
    console.log("initializing");
    await fetchSoldOutItems();
    const response = await fetch("menu.json");
    menuData = await response.json();
    console.log(menuData);
    displayOrderForm();
    displayEmployeeMenu();
}

async function fetchSoldOutItems() {
    const gas_endpoint = "https://script.google.com/macros/s/AKfycbxJRt15UzYPrZNc-Md_btlJ0v5IloyeR4T4gyyvskeSz5XNP-BrhXzRx8F1fOx3txXJ3w/exec";
    try {
        const response = await fetch(gas_endpoint);
        soldOutItems = await response.json();
        console.log("Sold-out items loaded:", soldOutItems);
    } catch (error) {
        console.error("Error fetching sold-out items:", error);
        soldOutItems = {};
    }
}

async function updateSoldOutItems() {
    const gas_endpoint = "https://script.google.com/macros/s/AKfycbxJRt15UzYPrZNc-Md_btlJ0v5IloyeR4T4gyyvskeSz5XNP-BrhXzRx8F1fOx3txXJ3w/exec";
    const options = {
        method: "POST",
        body: JSON.stringify({ soldOutItems }),
    };
    try {
        const response = await fetch(gas_endpoint, options);
        console.log(await response.text());
    } catch (error) {
        console.error("Error updating sold-out items:", error);
    }
}

// ... (displayOrderForm, addCell, qtyList, tag, getParentRow, changeQty, orderLine, money, toggleDetails remain unchanged) ...

function showMessage(message) {
    const paymentDiv = tag("payment");
    let messageDiv = tag("payment-message");
    if (messageDiv) messageDiv.remove();

    messageDiv = document.createElement("div");
    messageDiv.id = "payment-message";
    messageDiv.textContent = message;
    messageDiv.className = "payment-message";
    paymentDiv.appendChild(messageDiv);

    // Reset historical figure and remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv) messageDiv.remove();
        const founderSelect = tag("founderName");
        founderSelect.value = "none"; // Reset to blank
        showPmt(); // Update UI (hide payment, show instructions)
    }, 5000); // Changed to 5 seconds as per your tweak
}

function pay(method) {
    if (!currentPurchase.length) {
        showMessage("Please order something before attempting to pay.");
        return;
    }
    tag("founder").style.display = "none";
    resetPmt();
    tag("reset").style.display = "block";

    for (const qtyCell of document.querySelectorAll(".qty")) {
        const value = qtyCell.firstElementChild.value;
        qtyCell.textContent = value == 0 ? "" : value;
    }

    const orderText = currentPurchase.join("\n");
    const orderTotal = parseFloat(tag("total").textContent.replace("$", ""));

    if (method === 'venmo') {
        window.open(`https://venmo.com/spafv?txn=pay&amount=${orderTotal}¬e=${encodeURIComponent(orderText)}`);
    }
    const payload = {
        customer: tag("founderName").value,
        order: orderText,
        total: orderTotal
    };
    console.log(payload);
    submitOrder(payload);
}

function resetPmt() {
    tag("pay-cash").style.display = "none";
    tag("pay-venmo").style.display = "none";
    tag("payment").style.display = "none";
    currentPurchase = [];
}

async function submitOrder(payload) {
    const gas_endpoint = "https://script.google.com/macros/s/AKfycbxJRt15UzYPrZNc-Md_btlJ0v5IloyeR4T4gyyvskeSz5XNP-BrhXzRx8F1fOx3txXJ3w/exec";
    const options = {
        method: "POST",
        body: JSON.stringify(payload),
    };
    const response = await fetch(gas_endpoint, options);
    console.log(await response.text());
}

function showPmt() {
    const founder = tag("founderName");
    const paymentDiv = tag("payment");
    const instructionsDiv = tag("instructions");
    if (founder.value === 'none') {
        paymentDiv.style.display = 'none';
        instructionsDiv.style.display = 'block';
    } else {
        paymentDiv.style.display = 'block';
        instructionsDiv.style.display = 'none';
    }
}

function displayEmployeeMenu() {
    const employeeDiv = tag("employee-menu");
    if (!employeeDiv) {
        console.error("Employee menu element not found!");
        return;
    }
    employeeDiv.innerHTML = '';
    for (const category of menuData) {
        employeeDiv.innerHTML += `<h1 class="category-name">${category.category}</h1>`;
        for (const item of category.items) {
            if (item.display > 0) {
                const isSoldOut = soldOutItems[item.id] || item.display === 2;
                employeeDiv.innerHTML += `
                    <div>
                        <h3>${item.name}</h3>
                        <button onclick="toggleSoldOut(${item.id})">
                            ${isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                        </button>
                    </div>
                `;
            }
        }
    }
}

async function toggleSoldOut(itemId) {
    soldOutItems[itemId] = !soldOutItems[itemId];
    if (!soldOutItems[itemId]) delete soldOutItems[itemId];
    await updateSoldOutItems();
    displayOrderForm();
    displayEmployeeMenu();
}

function showEmployeeSection() {
    const password = prompt("Enter employee password:");
    if (password === "bakehouse2025") {
        tag("employee-section").style.display = "block";
        displayEmployeeMenu();
    } else {
        alert("Incorrect password!");
    }
}