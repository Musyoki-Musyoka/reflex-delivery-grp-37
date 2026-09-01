/* Reflex — API layer for the retailer screen.
 *
 * The team backend is Django. These are the two endpoints this page expects.
 * If the backend person used different paths, change ONLY the two constants
 * below; nothing else in this file or in retailer.js needs touching.
 *
 *   LIST_ENDPOINT   GET  -> JSON array of deliveries for this shop
 *   CREATE_ENDPOINT POST -> JSON body with the four form fields,
 *                           responds with the created delivery
 *
 * A delivery is expected to look like:
 *   { id, reference, customer_name, customer_phone, address,
 *     item_description, status, created_at }
 *
 * Status words understood (old and new spellings both):
 *   pending / requested, assigned, picked / picked_up, delivered, failed, cancelled
 *
 * If the backend is not reachable (for example when you open the page by
 * double-clicking it with no server running), this file falls back to local
 * demo data stored in the browser, and sets ReflexAPI.demoMode = true so the
 * page can show an honest "demo mode" banner. Never pretend demo data is live.
 */

var ReflexAPI = (function () {
  var API_BASE = "";                          // same origin; e.g. "" when Django serves these pages
  var LIST_ENDPOINT = "/api/deliveries?scope=shop";
  var CREATE_ENDPOINT = "/api/deliveries";

  var DEMO_KEY = "reflex_demo_deliveries";
  var demoMode = false;

  function seed() {
    return [
      {
        id: 2,
        reference: "RFX-000002",
        customer_name: "Grace Njeri",
        customer_phone: "+254733555666",
        address: "Thika, Section 9, Block C Flat 12",
        item_description: "Two boxes of Amoxil 500mg, pharmacy order",
        status: "pending",
        created_at: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        id: 1,
        reference: "RFX-000001",
        customer_name: "Peter Otieno",
        customer_phone: "+254722333444",
        address: "Ruai, Kangundo Road, House 45B",
        item_description: "Samsung 43 inch TV, one carton, sealed",
        status: "assigned",
        created_at: new Date(Date.now() - 90 * 60000).toISOString()
      }
    ];
  }

  function readDemo() {
    try {
      var raw = localStorage.getItem(DEMO_KEY);
      if (!raw) {
        localStorage.setItem(DEMO_KEY, JSON.stringify(seed()));
        return seed();
      }
      return JSON.parse(raw);
    } catch (e) {
      return seed();
    }
  }

  function writeDemo(list) {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
  }

  function nextRef(list) {
    var max = 0;
    for (var i = 0; i < list.length; i++) {
      var m = /(\d+)$/.exec(list[i].reference || "");
      if (m && parseInt(m[1], 10) > max) max = parseInt(m[1], 10);
    }
    var n = max + 1;
    return "RFX-" + ("000000" + n).slice(-6);
  }

  function liveList() {
    return fetch(API_BASE + LIST_ENDPOINT, { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("bad status " + r.status);
        return r.json();
      })
      .then(function (data) {
        demoMode = false;
        return Array.isArray(data) ? data : (data.results || data.deliveries || []);
      });
  }

  function liveCreate(fields) {
    return fetch(API_BASE + CREATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(fields)
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          throw new Error(j.message || j.error || ("bad status " + r.status));
        });
      }
      demoMode = false;
      return r.json();
    });
  }

  return {
    isDemo: function () { return demoMode; },

    listDeliveries: function () {
      return liveList().catch(function () {
        demoMode = true;
        return readDemo();
      });
    },

    createDelivery: function (fields) {
      return liveCreate(fields).catch(function () {
        demoMode = true;
        var list = readDemo();
        var row = {
          id: Date.now(),
          reference: nextRef(list),
          customer_name: fields.customer_name,
          customer_phone: fields.customer_phone,
          address: fields.address,
          item_description: fields.item_description,
          status: "pending",
          created_at: new Date().toISOString()
        };
        list.unshift(row);
        writeDemo(list);
        return row;
      });
    },

    statusLabel: function (s) {
      switch ((s || "").toLowerCase()) {
        case "pending":
        case "requested":   return "Pending";
        case "assigned":    return "Assigned";
        case "picked":
        case "picked_up":   return "Picked Up";
        case "delivered":   return "Delivered";
        case "failed":      return "Failed";
        case "cancelled":   return "Cancelled";
        default:            return s || "Pending";
      }
    },

    statusClass: function (s) {
      switch ((s || "").toLowerCase()) {
        case "pending":
        case "requested":   return "st-pending";
        case "assigned":    return "st-assigned";
        case "picked":
        case "picked_up":   return "st-picked";
        case "delivered":   return "st-delivered";
        case "failed":      return "st-failed";
        case "cancelled":   return "st-cancelled";
        default:            return "st-pending";
      }
    }
  };
})();
