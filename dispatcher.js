// sample data

const deliveries = [
    {
        id: "REF-001",
        customer: "James Mwangi",
        phone: "0712 345 678",
        address: "Westlands, Nairobi",
        item: "Samsung 43-inch Smart TV",
        status: "Open",
        rider: null
    },

    {
        id: "REF-002",
        customer: "Grace Wanjiku",
        phone: "0723 890 456",
        address: "Kilimani, Nairobi",
        item: "Prescription medicine",
        status: "Open",
        rider: null
    },

    {
        id: "REF-003",
        customer: "Peter Otieno",
        phone: "0701 222 333",
        address: "South B, Nairobi",
        item: "2 bags of cement",
        status: "Open",
        rider: null
    },

    {
        id: "REF-004",
        customer: "Amina Hassan",
        phone: "0798 500 125",
        address: "Parklands, Nairobi",
        item: "Bluetooth headphones",
        status: "Assigned",
        rider: "Brian Kamau"
    }
];


const riders = [
    {
        id: 1,
        name: "Brian Kamau",
        phone: "0711 234 890",
        available: true
    },

    {
        id: 2,
        name: "Kevin Omondi",
        phone: "0722 678 123",
        available: true
    },

    {
        id: 3,
        name: "Mary Njeri",
        phone: "0790 432 765",
        available: true
    }
];


// Elements

const deliveryList = document.getElementById("deliveryList");
const requestCount = document.getElementById("requestCount");

const assignmentModal = document.getElementById("assignmentModal");
const deliveryDetails = document.getElementById("deliveryDetails");

const riderList = document.getElementById("riderList");
const assignButton = document.getElementById("assignButton");

const closeModal = document.getElementById("closeModal");

const successMessage = document.getElementById("successMessage");
const successText = document.getElementById("successText");


let selectedDelivery = null;
let selectedRider = null;


// Display deliveries

function displayDeliveries() {

    deliveryList.innerHTML = "";

    deliveries.forEach(delivery => {

        const card = document.createElement("div");

        card.classList.add("delivery-card");

        card.innerHTML = `
            <div class="delivery-info">

                <h3>${delivery.customer}</h3>

                <p>
                    <strong>📍 Address:</strong>
                    ${delivery.address}
                </p>

                <p>
                    <strong>📦 Item:</strong>
                    ${delivery.item}
                </p>

                ${
                    delivery.rider
                    ? `<p><strong>🏍 Rider:</strong> ${delivery.rider}</p>`
                    : ""
                }

            </div>

            <div class="delivery-meta">

                <div class="delivery-id">
                    ${delivery.id}
                </div>

                <span class="badge ${delivery.status.toLowerCase()}">
                    ${delivery.status}
                </span>

                ${
                    delivery.status === "Open"
                    ? `
                    <br>
                    <button 
                        class="view-button"
                        onclick="openDelivery('${delivery.id}')"
                    >
                        View & Assign
                    </button>
                    `
                    : ""
                }

            </div>
        `;

        deliveryList.appendChild(card);
    });


    const openRequests = deliveries.filter(
        delivery => delivery.status === "Open"
    ).length;

    requestCount.textContent =
        `${openRequests} open request${openRequests !== 1 ? "s" : ""}`;
}


// Open delivery

function openDelivery(deliveryId) {

    selectedDelivery = deliveries.find(
        delivery => delivery.id === deliveryId
    );

    selectedRider = null;

    assignButton.disabled = true;

    deliveryDetails.innerHTML = `
        <p>
            <strong>Request:</strong>
            ${selectedDelivery.id}
        </p>

        <p>
            <strong>Customer:</strong>
            ${selectedDelivery.customer}
        </p>

        <p>
            <strong>Phone:</strong>
            ${selectedDelivery.phone}
        </p>

        <p>
            <strong>Address:</strong>
            ${selectedDelivery.address}
        </p>

        <p>
            <strong>Item:</strong>
            ${selectedDelivery.item}
        </p>
    `;

    displayRiders();

    assignmentModal.classList.remove("hidden");
}

// display riders

function displayRiders() {

    riderList.innerHTML = "";

    const availableRiders = riders.filter(
        rider => rider.available
    );

    availableRiders.forEach(rider => {

        const riderCard = document.createElement("div");

        riderCard.classList.add("rider-card");

        riderCard.innerHTML = `
            <div>
                <div class="rider-name">
                    ${rider.name}
                </div>

                <div class="rider-phone">
                    ${rider.phone}
                </div>
            </div>

            <span class="rider-status">
                Available
            </span>
        `;

        riderCard.addEventListener("click", () => {

            document
                .querySelectorAll(".rider-card")
                .forEach(card => {
                    card.classList.remove("selected");
                });

            riderCard.classList.add("selected");

            selectedRider = rider;

            assignButton.disabled = false;
        });

        riderList.appendChild(riderCard);
    });
}


// Assigning deliveries

assignButton.addEventListener("click", () => {

    if (!selectedDelivery || !selectedRider) {
        return;
    }

    selectedDelivery.status = "Assigned";
    selectedDelivery.rider = selectedRider.name;

    // Close modal
    assignmentModal.classList.add("hidden");

    // Refresh dashboard
    displayDeliveries();

    // Success message
    successText.textContent =
        `${selectedDelivery.id} has been assigned to ${selectedRider.name}.`;

    successMessage.classList.remove("hidden");

    setTimeout(() => {
        successMessage.classList.add("hidden");
    }, 4000);

    selectedDelivery = null;
    selectedRider = null;
});


// Close modal

closeModal.addEventListener("click", () => {
    assignmentModal.classList.add("hidden");
});


assignmentModal.addEventListener("click", event => {

    if (event.target === assignmentModal) {
        assignmentModal.classList.add("hidden");
    }

});

// Initial load

displayDeliveries();