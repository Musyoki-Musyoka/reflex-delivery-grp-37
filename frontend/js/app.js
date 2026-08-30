const riders = [
    {
        id: "rider001",
        name: "Peter"
    },
    {
        id: "rider002",
        name: "James"
    },
    {
        id: "rider003",
        name: "Mary"
    }
];

const deliveries = [
    {
        id: "delivery001",
        riderId: "rider001",
        customerName: "John Kamau",
        phone: "0712345678",
        address: "Nakuru Town",
        item: "Samsung TV",
        confirmationCode: "REFLEX-DELIVERY-001",
        status: "Assigned",
        statusHistory: [
        {
            status: "Assigned",
            time: new Date()
        }
    ]
    },
    {
        id: "delivery002",
        riderId: "rider001",
        customerName: "Jane Wanjiku",
        phone: "0723456789",
        address: "Pipeline, Nakuru",
        item: "Laptop",
        confirmationCode: "REFLEX-DELIVERY-002",
        status: "Assigned",
        statusHistory: [
        {
            status: "Assigned",
            time: new Date()
        }
    ]
    },
    {
        id: "delivery003",
        riderId: "rider002",
        customerName: "David Otieno",
        phone: "0734567890",
        address: "Lanet, Nakuru",
        item: "Printer",
        confirmationCode: "REFLEX-DELIVERY-003",
        status: "Assigned",
        statusHistory: [
        {
            status: "Assigned",
            time: new Date()
        }
    ]
    },
    {
        id: "delivery004",
        riderId: "rider003",
        customerName: "Mary Achieng",
        phone: "0745678901",
        address: "Kiamunyi, Nakuru",
        item: "Phone",
        confirmationCode: "REFLEX-DELIVERY-004",
        status: "Assigned",
        statusHistory: [
        {
            status: "Assigned",
            time: new Date()
        }
    ]
    },
];

const riderList = document.getElementById("rider-list");
const message = document.getElementById("message");

riders.forEach(rider => {
    const button = document.createElement("button");

    button.textContent = rider.name;
    button.classList.add("rider-button");

    button.addEventListener("click", () => {
        showRiderDeliveries(rider);
    });

    riderList.appendChild(button);
});


function showRiderDeliveries(rider) {

    message.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = `Welcome, ${rider.name}`;

    message.appendChild(heading);

    const riderDeliveries = deliveries.filter(
        delivery => delivery.riderId === rider.id
    );

    const deliveryHeading = document.createElement("h3");
    deliveryHeading.textContent = "My Deliveries";

    message.appendChild(deliveryHeading);

    riderDeliveries.forEach(delivery => {

        const deliveryCard = document.createElement("div");

        deliveryCard.classList.add("delivery-card");

        deliveryCard.innerHTML = `
            <h3>${delivery.customerName}</h3>

            <p>
                <strong>Phone:</strong>
                <a href="tel:${delivery.phone}">
                    ${delivery.phone}
                </a>
            </p>

            <p>
                <strong>Address:</strong>
                ${delivery.address}
            </p>

            <p>
                <strong>Item:</strong>
                ${delivery.item}
            </p>

            <p>
                <strong>Status:</strong>
                ${delivery.status}
            </p>
            <div class="qr-code" id="qr-${delivery.id}"></div>

<p class="confirmation-code">
    ${delivery.confirmationCode}
</p>

            ${
                delivery.status === "Assigned"
                    ? `<button class="pickup-button"
                        onclick="pickUpDelivery('${delivery.id}')">
                        Pick Up
                       </button>`
                    : ""
            }
        `;

        message.appendChild(deliveryCard);
        new QRCode(
    document.getElementById(`qr-${delivery.id}`),
    {
        text: delivery.confirmationCode,
        width: 150,
        height: 150
    }
);
    });
}


function pickUpDelivery(deliveryId) {

    const delivery = deliveries.find(
        delivery => delivery.id === deliveryId
    );

    if (!delivery) {
        return;
    }

    // Only Assigned deliveries can be picked up
    if (delivery.status !== "Assigned") {
        alert("This delivery has already been picked up or cannot be picked up.");
        return;
    }

    // Change the current status
    delivery.status = "Picked Up";

    // Add ONE record to the status history
    delivery.statusHistory.push({
        status: "Picked Up",
        time: new Date()
    });

    alert("Delivery picked up successfully.");

    const rider = riders.find(
        rider => rider.id === delivery.riderId
    );

    showRiderDeliveries(rider);
}