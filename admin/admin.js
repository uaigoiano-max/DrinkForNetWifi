(function () {
    "use strict";
    var token = sessionStorage.getItem("drinkfornet-admin-token") || "";
    var $ = function (id) { return document.getElementById(id); };
    var error = $("error");

    function showError(message) { error.textContent = message || ""; }
    function api(action, data) {
        data = data || {};
        data.action = action;
        var body = Object.keys(data).map(function (key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
        }).join("&");
        var endpoint = "/cgi-bin/drinkfornet.lua" +
            (action === "status" || action === "vouchers" ? "?action=" + encodeURIComponent(action) : "");
        return fetch(endpoint, {
            method: action === "status" || action === "vouchers" ? "GET" : "POST",
            headers: { "X-DrinkForNet-Admin": token, "Content-Type": "application/x-www-form-urlencoded" },
            body: action === "status" || action === "vouchers" ? undefined : body
        }).then(function (response) {
            return response.json().then(function (json) {
                if (!response.ok || json.ok === false) throw new Error(json.error || "Request failed");
                return json;
            });
        });
    }
    function renderStatus(data) {
        $("status").innerHTML = [
            ["Duration", data.duration + " seconds (25 minutes)"],
            ["Total", data.total], ["Available", data.available],
            ["Active", data.active], ["Expired", data.expired], ["Revoked", data.revoked]
        ].map(function (item) { return "<dt>" + item[0] + "</dt><dd>" + item[1] + "</dd>"; }).join("");
    }
    function loadStatus() { api("status").then(renderStatus).catch(function (e) { showError(e.message); }); }
    function loadVouchers() {
        api("vouchers").then(function (data) {
            $("vouchers").innerHTML = data.vouchers.map(function (voucher) {
                var action = voucher.state === "AVAILABLE" || voucher.state === "ACTIVE"
                    ? '<button data-id="' + voucher.id + '" type="button">Revoke</button>' : "";
                return "<tr><td>" + voucher.id + "</td><td>" + voucher.state + "</td><td>" +
                    (voucher.expires || "—") + "</td><td>" + action + "</td></tr>";
            }).join("");
            Array.prototype.forEach.call($("vouchers").querySelectorAll("button"), function (button) {
                button.addEventListener("click", function () {
                    if (!window.confirm("Revoke " + button.dataset.id + "?")) return;
                    api("revoke", { id: button.dataset.id }).then(loadVouchers).then(loadStatus)
                        .catch(function (e) { showError(e.message); });
                });
            });
        }).catch(function (e) { showError(e.message); });
    }
    $("saveToken").addEventListener("click", function () {
        token = $("adminToken").value.trim();
        sessionStorage.setItem("drinkfornet-admin-token", token);
        $("authState").textContent = "Token saved for this browser session.";
        loadStatus(); loadVouchers();
    });
    $("adminToken").value = token;
    $("refresh").addEventListener("click", loadStatus);
    $("loadVouchers").addEventListener("click", loadVouchers);
    $("generate").addEventListener("click", function () {
        showError("");
        api("generate", { count: $("count").value }).then(function (data) {
            $("generated").textContent = data.vouchers.map(function (voucher) {
                return voucher.id + "  " + voucher.voucher;
            }).join("\n");
            loadStatus(); loadVouchers();
        }).catch(function (e) { showError(e.message); });
    });
    if (token) { loadStatus(); loadVouchers(); }
}());
