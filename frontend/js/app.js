// ===============================
// REFLEX RIDER FRONTEND
// ===============================

const API_BASE_URL = "http://127.0.0.1:8000/api";

let riders = [];
let selectedRider = null;
let deliveries = [];

const riderList = document.getElementById("rider-list");
const message = document.getElementById("message");


// ===============================
// LOAD RIDERS FROM BACKEND
// ===============================

async function loadRiders() {
    try {
        const response = await fetch(`${API_BASE_URL}/riders/`);

        if (!response.ok) {
            throw new Error(`Failed to load riders: ${response.status}`);
        }

        const data = await response.json();

        console.log("Riders received:", data);

        // Handle either a direct array or Django REST Framework pagination
        const data = await response.json();

console.log("Riders received:", data);

const backendRiders = Array.isArray(data) ? data : (data.results || []);

riders = backendRiders.map(rider => ({
    id: rider.rider_id,
    name: rider.rider_name,
    phone: rider.rider_phone
}));

displayRiders();

    } catch (error) {
        console.error("Error loading riders:", error);

        riderList.innerHTML = "";

        message.innerHTML = `
            <p class="error-message">
                Could not connect to the backend.
                Make sure Django is running.
            </p>
        `;
    }
}


// ===============================
// DISPLAY RIDERS
// ===============================

function displayRiders() {
    riderList.innerHTML = "";

    if (riders.length === 0) {
        riderList.innerHTML = "<p>No riders found.</p>";
        return;
    }

    riders.forEach(rider => {
        const button = document.createElement("button");

        button.textContent = rider.name;
        button.classList.add("rider-button");

        button.addEventListener("click", () => {
            selectedRider = rider;
            loadRiderDeliveries(rider);
        });

        riderList.appendChild(button);
    });
}


// ===============================
// LOAD RIDER'S ASSIGNED DELIVERIES
// ===============================

async function loadRiderDeliveries(rider) {
    try {
        message.innerHTML = "<p>Loading deliveries...</p>";

        const response = await fetch(
            `${API_BASE_URL}/rider/assigned/`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load deliveries: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Assigned deliveries received:", data);

        // Handle either a direct array or Django REST Framework pagination
        const assignedDeliveries =
            Array.isArray(data) ? data : (data.results || []);

        /*
         * The backend endpoint is expected to return the deliveries
         * assigned to the current rider.
         *
         * If the endpoint returns deliveries for all riders, we filter
         * them using rider_id/riderId.
         */
        deliveries = assignedDeliveries.filter(delivery => {

            const deliveryRiderId =
                delivery.rider_id ??
                delivery.riderId ??
                delivery.rider?.id;

            return String(deliveryRiderId) === String(rider.id);
        });

        /*
         * If the endpoint already returns only the selected rider's
         * deliveries but doesn't include a rider ID, use everything
         * returned by the endpoint.
         */
        if (
            assignedDeliveries.length > 0 &&
            deliveries.length === 0
        ) {
            const hasRiderInformation = assignedDeliveries.some(
                delivery =>
                    delivery.rider_id !== undefined ||
                    delivery.riderId !== undefined ||
                    delivery.rider !== undefined
            );

            if (!hasRiderInformation) {
                deliveries = assignedDeliveries;
            }
        }

        showRiderDeliveries(rider);

    } catch (error) {
        console.error("Error loading deliveries:", error);

        message.innerHTML = `
            <h2>Welcome, ${rider.name}</h2>
            <p class="error-message">
                Could not load your assigned deliveries.
            </p>
        `;
    }
}


// ===============================
// DISPLAY RIDER'S DELIVERIES
// ===============================

function showRiderDeliveries(rider) {

    message.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = `Welcome, ${rider.name}`;

    message.appendChild(heading);

    const deliveryHeading = document.createElement("h3");
    deliveryHeading.textContent = "My Deliveries";

    message.appendChild(deliveryHeading);

    if (deliveries.length === 0) {
        const noDeliveries = document.createElement("p");
        noDeliveries.textContent = "No deliveries assigned.";
        message.appendChild(noDeliveries);
        return;
    }

    deliveries.forEach(delivery => {

        const deliveryCard = document.createElement("div");

        deliveryCard.classList.add("delivery-card");

        // Support common backend field names
        const customerName =
            delivery.customer_name ??
            delivery.customerName ??
            delivery.customer?.name ??
            "Customer";

        const phone =
            delivery.phone ??
            delivery.customer_phone ??
            delivery.customer?.phone ??
            "";

        const address =
    delivery.customer_address ??
    delivery.address ??
    delivery.delivery_address ??
    "";

const item =
    delivery.item_description ??
    delivery.item ??
    delivery.item_name ??
    "";

const status =
    delivery.delivery_status ??
    delivery.status ??
    "ASSIGNED";
    const displayStatus =
    status === "ASSIGNED"
        ? "Assigned"
        : status === "PICKED"
        ? "Picked Up"
        : status;

        const confirmationCode =
            delivery.confirmation_code ??
            delivery.confirmationCode ??
            "";

        const deliveryId =
            delivery.id ??
            delivery.request_id;

        deliveryCard.innerHTML = `
            <h3>${customerName}</h3>

            <p>
                <strong>Phone:</strong>
                <a href="tel:${phone}">
                    ${phone}
                </a>
            </p>

            <p>
                <strong>Address:</strong>
                ${address}
            </p>

            <p>
                <strong>Item:</strong>
                ${item}
            </p>

            <p>
                <strong>Status:</strong>
                ${displayStatus}
            </p>

            ${
                confirmationCode
                    ? `
                        <div class="qr-code" id="qr-${deliveryId}"></div>

                        <p class="confirmation-code">
                            ${confirmationCode}
                        </p>
                    `
                    : ""
            }

            ${
    status.toUpperCase() === "ASSIGNED"
        ? `
            <button
                class="pickup-button"
                onclick="pickUpDelivery('${deliveryId}')">
                Pick Up
            </button>
        `
        : ""
}

        `;

        message.appendChild(deliveryCard);

        // Generate QR code only when a confirmation code exists
        if (confirmationCode) {
            const qrElement =
                document.getElementById(`qr-${deliveryId}`);

            if (qrElement && typeof QRCode !== "undefined") {
                new QRCode(qrElement, {
                    text: confirmationCode,
                    width: 150,
                    height: 150
                });
            }
        }
    });
}


// ===============================
// PICK UP DELIVERY
// ===============================

async function pickUpDelivery(deliveryId) {

    const delivery = deliveries.find(
        delivery =>
            String(delivery.id ?? delivery.request_id) ===
            String(deliveryId)
    );

    if (!delivery) {
        alert("Delivery not found.");
        return;
    }

    const currentStatus =
    delivery.delivery_status ??
    delivery.status ??
    "ASSIGNED";
    // Only Assigned deliveries can be picked up
    if (currentStatus.toUpperCase() !== "ASSIGNED") {
        alert(
            "This delivery has already been picked up or cannot be picked up."
        );
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/requests/${deliveryId}/picked/`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Pick up failed: ${response.status}`
            );
        }

        alert("Delivery picked up successfully.");

        // Refresh deliveries from backend
        await loadRiderDeliveries(selectedRider);

    } catch (error) {

        console.error("Error picking up delivery:", error);

        alert(
            "Could not pick up the delivery. Please try again."
        );
    }
}


// ===============================
// DELIVER DELIVERY
// ===============================

async function deliverDelivery(deliveryId) {

    const delivery = deliveries.find(
        delivery =>
            String(delivery.id ?? delivery.request_id) ===
            String(deliveryId)
    );

    if (!delivery) {
        alert("Delivery not found.");
        return;
    }

    const currentStatus =
        delivery.status ?? "";

    // Only Picked Up deliveries can be delivered
    if (
        currentStatus.toLowerCase() !== "picked up" &&
        currentStatus.toLowerCase() !== "picked_up"
    ) {
        alert(
            "This delivery cannot be marked as delivered yet."
        );
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/requests/${deliveryId}/delivered/`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Delivery update failed: ${response.status}`
            );
        }

        alert("Delivery marked as delivered successfully.");

        // Refresh deliveries from backend
        await loadRiderDeliveries(selectedRider);

    } catch (error) {

        console.error("Error delivering delivery:", error);

        alert(
            "Could not mark the delivery as delivered. Please try again."
        );
    }
}


// ===============================
// START APPLICATION
// ===============================

loadRiders();