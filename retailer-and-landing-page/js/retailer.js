/* Reflex — retailer screen behaviour.
 *
 * Three jobs:
 *  1. render the list of this shop's delivery requests, refreshing every 5s
 *  2. submit the new-request form and show the success message
 *  3. show the honest demo-mode banner whenever the backend is not reachable
 */

(function () {
  var listEl = document.getElementById("request-list");
  var banner = document.getElementById("demo-banner");
  var form = document.getElementById("request-form");
  var successBox = document.getElementById("success-box");
  var errorEl = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");

  function esc(value) {
    var d = document.createElement("div");
    d.textContent = value == null ? "" : String(value);
    return d.innerHTML;
  }

  function when(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function render(items) {
    banner.hidden = !ReflexAPI.isDemo();

    if (!items || items.length === 0) {
      listEl.innerHTML = '<div class="empty">No delivery requests yet. Submit the first one on the left.</div>';
      return;
    }

    var rows = items.map(function (d) {
      return (
        '<div class="request-item">' +
          '<div class="request-top">' +
            '<span class="request-ref">' + esc(d.reference || ("#" + d.id)) + "</span>" +
            '<span class="badge ' + ReflexAPI.statusClass(d.status) + '">' + esc(ReflexAPI.statusLabel(d.status)) + "</span>" +
          "</div>" +
          '<div class="request-who">' + esc(d.customer_name) + " &middot; " + esc(d.address) + "</div>" +
          '<div class="request-item-desc">' + esc(d.item_description) + "</div>" +
          '<div class="request-when">Logged ' + esc(when(d.created_at)) + "</div>" +
        "</div>"
      );
    });
    listEl.innerHTML = rows.join("");
  }

  function refresh() {
    ReflexAPI.listDeliveries().then(render).catch(function () {
      listEl.innerHTML = '<div class="empty">Could not load deliveries.</div>';
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    successBox.hidden = true;

    var fields = {
      customer_name: form.customer_name.value.trim(),
      customer_phone: form.customer_phone.value.trim(),
      address: form.address.value.trim(),
      item_description: form.item_description.value.trim()
    };

    var missing = [];
    if (!fields.customer_name) missing.push("customer name");
    if (!fields.customer_phone) missing.push("customer contact");
    if (!fields.address) missing.push("location");
    if (!fields.item_description) missing.push("item description");
    if (missing.length) {
      errorEl.textContent = "Please fill in: " + missing.join(", ") + ".";
      errorEl.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    ReflexAPI.createDelivery(fields).then(function (row) {
      form.reset();
      successBox.textContent =
        "Request " + (row.reference || "") + " submitted. Status: " +
        ReflexAPI.statusLabel(row.status) + ". The dispatcher will assign a rider.";
      successBox.hidden = false;
      setTimeout(function () { successBox.hidden = true; }, 8000);
      refresh();
    }).catch(function (err) {
      errorEl.textContent = "Could not submit: " + (err.message || err) ;
      errorEl.hidden = false;
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit request";
    });
  });

  refresh();
  setInterval(refresh, 5000);
})();
