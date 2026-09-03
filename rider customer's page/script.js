// ==========================================
// CHECK LOGIN & DISPLAY RIDER NAME
// ==========================================

// Get the logged-in user
const savedUser = localStorage.getItem("user");

// Check whether a rider is logged in
if (!savedUser) {
    alert("Please log in first.");
    window.location.href = "index.html";
}

// Convert saved user information from JSON
const user = JSON.parse(savedUser);

// Display rider name dynamically
const riderNameElement = document.getElementById("riderName");
if (riderNameElement && user.name) {
    riderNameElement.textContent = "Rider: " + user.name;
} else if (riderNameElement) {
    riderNameElement.textContent = "Rider: Unknown";
}


// ==========================================
// GET DELIVERY ID & DATA
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const deliveryId = urlParams.get("id");

// Mock delivery data (replace with API call or database fetch in production)
let delivery = {
    id: deliveryId || "1",
    customerName: "John Kamau",
    customerPhone: "0712345678",
    address: "Eldoret, Uasin Gishu",
    item: "Samsung TV",
    status: "Assigned"
};


// ==========================================
// DISPLAY CUSTOMER INFORMATION
// ==========================================

function displayDelivery() {
    const customerName = document.getElementById("customerName");
    const customerPhone = document.getElementById("customerPhone");
    const customerAddress = document.getElementById("customerAddress");
    const customerItem = document.getElementById("customerItem");

    if (customerName) customerName.textContent = delivery.customerName;
    
    if (customerPhone) {
        customerPhone.textContent = delivery.customerPhone;
        customerPhone.href = "tel:" + delivery.customerPhone;
    }
    
    if (customerAddress) customerAddress.textContent = delivery.address;
    if (customerItem) customerItem.textContent = delivery.item;

    updateStatus();
}


// ==========================================
// UPDATE STATUS & BUTTON STATES
// ==========================================

function updateStatus() {
    const statusElement = document.getElementById("deliveryStatus");
    const pickupButton = document.getElementById("pickupButton");
    const confirmButton = document.getElementById("confirmButton");

    if (!statusElement) return;

    // Show current status
    statusElement.textContent = delivery.status;

    if (delivery.status === "Assigned") {
        statusElement.className = "status assigned";
        if (pickupButton) pickupButton.disabled = false;
        if (confirmButton) confirmButton.disabled = true;
    } 
    else if (delivery.status === "Picked Up") {
        statusElement.className = "status picked-up";
        if (pickupButton) pickupButton.disabled = true;
        if (confirmButton) confirmButton.disabled = false;
    } 
    else if (delivery.status === "Delivered") {
        statusElement.className = "status delivered";
        if (pickupButton) pickupButton.disabled = true;
        if (confirmButton) confirmButton.disabled = true;
    }
}


// ==========================================
// ACTIONS: PICK UP & CONFIRM DELIVERY
// ==========================================

function pickUpDelivery() {
    if (delivery.status !== "Assigned") {
        alert("Invalid action. This delivery has already been picked up.");
        return;
    }

    delivery.status = "Picked Up";
    updateStatus();
    alert("Delivery picked up successfully.");
}

function confirmDelivery() {
    if (delivery.status !== "Picked Up") {
        alert("Invalid action. The delivery must be picked up before it can be delivered.");
        return;
    }

    delivery.status = "Delivered";
    updateStatus();
    alert("Delivery confirmed successfully.");
}


// ==========================================
// NAVIGATION & INITIALIZATION
// ==========================================

function goBack() {
    window.location.href = "rider.html";
}

// Load page data when script runs
displayDelivery();