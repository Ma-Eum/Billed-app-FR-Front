/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore);

describe("Bills Page – Extended Tests", () => {
  let onNavigate;
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

    document.body.innerHTML = '<div id="root"></div>';
    onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES_PATH[pathname];
    };
  });

  test("redirects to login if no user", () => {
    window.localStorage.clear();
    const onNavigate = jest.fn();
    new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login);
  });

  test("clicking new bill button navigates correctly", () => {
    document.body.innerHTML = BillsUI({ data: [] });
    const navigate = jest.fn();
    new Bills({ document, onNavigate: navigate, store: null, localStorage: window.localStorage });
    fireEvent.click(screen.getByTestId("btn-new-bill"));
    expect(navigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
  });

  test("clicking eye icon opens modal", () => {
    document.body.innerHTML = BillsUI({ data: [] });
    const icon = document.createElement("div");
    icon.setAttribute("data-bill-url", "https://url.com");
    icon.setAttribute("data-testid", "icon-eye");

    const modal = document.createElement("div");
    modal.setAttribute("id", "modaleFile");
    modal.innerHTML = '<div class="modal-body"></div>';
    document.body.appendChild(modal);
    document.body.appendChild(icon);

    $.fn.modal = jest.fn();
    const instance = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
    instance.handleClickIconEye(icon);
    const img = document.querySelector(".modal-body img");
    expect(img).toBeTruthy();
    expect(img.src).toBe("https://url.com/");
    expect($.fn.modal).toHaveBeenCalled();
  });

  test("logout clears storage and redirects", () => {
    document.body.innerHTML = BillsUI({ data: [] }) + '<div id="layout-disconnect"></div>';
    const nav = jest.fn();
    new Bills({ document, onNavigate: nav, store: null, localStorage: window.localStorage });
    fireEvent.click(document.getElementById("layout-disconnect"));
    expect(localStorage.getItem("user")).toBe(null);
    expect(nav).toHaveBeenCalledWith(ROUTES_PATH.Login);
  });

  test("getBills fetches and formats bills correctly", async () => {
    const instance = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
    const bills = await instance.getBills();
    expect(bills.length).toBeGreaterThan(0);
    expect(bills[0].date).toBeDefined();
  });

  test("displays error 404 from API", async () => {
    document.body.innerHTML = BillsUI({ error: "Erreur 404" });
    expect(screen.getByTestId("error-message").textContent).toMatch("Erreur 404");
  });

  test("displays error 500 from API", async () => {
    document.body.innerHTML = BillsUI({ error: "Erreur 500" });
    expect(screen.getByTestId("error-message").textContent).toMatch("Erreur 500");
  });

  test("returns empty array if store is null", async () => {
    const instance = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
    const bills = await instance.getBills();
    expect(bills).toEqual([]);
  });

  test("does not fail if new bill button missing", () => {
    document.body.innerHTML = '<div></div>';
    expect(() => new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })).not.toThrow();
  });

  test("does not fail without eye icons", () => {
    document.body.innerHTML = '<div></div>';
    expect(() => new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })).not.toThrow();
  });

test("bills should be ordered from latest to earliest", () => {
  const billsData = [
    { date: "2004-04-04" },
    { date: "2003-03-03" },
    { date: "2002-02-02" },
    { date: "2001-01-01" }
  ];

  document.body.innerHTML = BillsUI({ data: billsData });

  const tbody = screen.getByTestId("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const datesOnScreen = rows.map(row => row.children[2].textContent.trim());

  const sortedDates = [...datesOnScreen].sort((a, b) => new Date(b) - new Date(a));

  expect(datesOnScreen).toEqual(sortedDates);
});


  test("integration GET: should fetch and display bills", async () => {
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

    window.onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES_PATH[pathname];
    };

    const instance = new Bills({
      document,
      onNavigate: window.onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const bills = await instance.getBills();

    expect(bills.length).toBeGreaterThan(0);
    expect(bills[0]).toHaveProperty("id");
    expect(bills[0]).toHaveProperty("date");
  });
});