/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import DashboardUI from "../views/DashboardUI.js";
import Dashboard, { filteredBills, card, cards, getStatus } from "../containers/Dashboard.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES_PATH } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore);


describe("Dashboard – Extended Coverage", () => {
  let dashboard;
  let bills;

  beforeEach(async () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "admin@test.com" }));

    document.body.innerHTML = DashboardUI({ data: [] });

    bills = await mockStore.bills().list();
    dashboard = new Dashboard({
      document,
      onNavigate: (pathname) => (window.location.hash = pathname),
      store: mockStore,
      bills,
      localStorage: window.localStorage,
    });
  });

  test("getStatus should return correct values", () => {
    expect(getStatus(1)).toBe("pending");
    expect(getStatus(2)).toBe("accepted");
    expect(getStatus(3)).toBe("refused");
    expect(getStatus(0)).toBe("");
  });

  test("cards and card should render HTML correctly", () => {
    const oneCard = card(bills[0]);
    expect(oneCard).toContain("bill-card");
    const allCards = cards(bills);
    expect(allCards).toContain("bill-card");
  });

  test("handleAcceptSubmit updates bill and navigates", async () => {
    const spy = jest.spyOn(dashboard, "updateBill");
    const bill = { ...bills[0], id: "123" };
    document.body.innerHTML += '<textarea id="commentary2">Validé</textarea>';
    await dashboard.handleAcceptSubmit({ preventDefault: () => {} }, bill);
    expect(spy).toHaveBeenCalled();
    expect(window.location.hash).toBe(ROUTES_PATH.Dashboard);
  });

  test("handleRefuseSubmit updates bill and navigates", async () => {
    const spy = jest.spyOn(dashboard, "updateBill");
    const bill = { ...bills[0], id: "456" };
    document.body.innerHTML += '<textarea id="commentary2">Refusé</textarea>';
    await dashboard.handleRefuseSubmit({ preventDefault: () => {} }, bill);
    expect(spy).toHaveBeenCalled();
    expect(window.location.hash).toBe(ROUTES_PATH.Dashboard);
  });

  test("filteredBills should return empty if no user in localStorage", () => {
    window.localStorage.clear();
    const result = filteredBills(bills, "pending");
    expect(result).toEqual([]);
  });

  test("getBillsAllUsers should handle API error", async () => {
    const brokenStore = {
      bills: () => ({
        list: () => Promise.reject(new Error("Erreur API")),
      }),
    };
    const d = new Dashboard({
      document,
      onNavigate: () => {},
      store: brokenStore,
      bills: [],
      localStorage: window.localStorage,
    });

    await expect(d.getBillsAllUsers()).rejects.toThrow("Erreur API");
  });

  test("updateBill should handle update errors gracefully", async () => {
    const failingStore = {
      bills: () => ({
        update: () => Promise.reject(new Error("Erreur update")),
      }),
    };
    const d = new Dashboard({
      document,
      onNavigate: () => {},
      store: failingStore,
      bills: [],
      localStorage: window.localStorage,
    });
    console.error = jest.fn();
    await d.updateBill({ id: "err" });
    expect(console.error).toHaveBeenCalled();
  });

  test("handleShowTickets should toggle bill list and styles", () => {
  const mockBill = {
    id: "123",
    email: "employee@test.com",
    name: "Facture test",
    amount: 100,
    date: "2021-05-01",
    status: "pending",
    type: "Transports"
  };

  // Setup DOM attendu par handleShowTickets
  document.body.innerHTML = `
    <div id="arrow-icon1"></div>
    <div id="status-bills-container1"></div>
    <div id="open-bill123" class="bill-card"></div>
    <div class="dashboard-right-container"><div></div></div>
    <div class="vertical-navbar"></div>
  `;

  const bills = [mockBill];
  dashboard.counter[1] = 0;

  // Premier appel -> afficher
  dashboard.handleShowTickets({}, bills, 1);
  const container = document.getElementById("status-bills-container1");
  expect(container.innerHTML).toContain("bill-card");

  // Deuxième appel -> masquer
  dashboard.handleShowTickets({}, bills, 1);
  expect(container.innerHTML).toBe("");
});


  test("handleEditTicket toggles form and reset", () => {
    const bill = { ...bills[0], id: "toggle" };
    const div = document.createElement("div");
    div.setAttribute("id", "open-billtoggle");
    document.body.appendChild(div);

    const container = document.createElement("div");
    container.className = "dashboard-right-container";
    container.innerHTML = "<div></div>";
    document.body.appendChild(container);

    const navbar = document.createElement("div");
    navbar.className = "vertical-navbar";
    document.body.appendChild(navbar);

    dashboard.handleEditTicket({}, bill, bills);
    expect(document.querySelector(".dashboard-right-container").innerHTML).toContain("form");

    dashboard.handleEditTicket({}, bill, bills);
    expect(document.querySelector("#big-billed-icon")).toBeTruthy();
  });

  test("handleClickIconEye displays modal with image", () => {
    const modal = document.createElement("div");
    modal.setAttribute("id", "modaleFileAdmin1");
    modal.innerHTML = '<div class="modal-body"></div>';
    document.body.appendChild(modal);
    modal.style.width = "800px";

    const icon = document.createElement("div");
    icon.setAttribute("id", "icon-eye-d");
    icon.setAttribute("data-bill-url", "http://test.img");
    document.body.appendChild(icon);

    $.fn.modal = jest.fn();

    dashboard.handleClickIconEye();
    expect(modal.querySelector("img").src).toBe("http://test.img/");
    expect($.fn.modal).toHaveBeenCalled();
  });
});