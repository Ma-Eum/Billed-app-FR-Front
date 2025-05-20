/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "employee@test.com" })
    );
    document.body.innerHTML = `<div id="root"></div>`;
    router();
  });

  describe("When I am on Bills Page", () => {
    test("Then clicking on an eye icon should display the modal", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = jest.fn();
      const billsInstance = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      expect(iconEye).toBeTruthy();

      const modal = document.createElement("div");
      modal.setAttribute("id", "modaleFile");
      document.body.append(modal);

      $.fn.modal = jest.fn(); // mock Bootstrap modal

      iconEye.addEventListener("click", () => billsInstance.handleClickIconEye(iconEye));
      fireEvent.click(iconEye);
      expect($.fn.modal).toHaveBeenCalled();
    });

    test("Then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/\d{4}[-/]\d{2}[-/]\d{2}/).map((a) => a.innerHTML);
      const sortedDates = [...dates].sort((a, b) => (a < b ? 1 : -1));
      expect(dates).toEqual(sortedDates);
    });

    test("Then clicking 'Nouvelle note de frais' should navigate to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = jest.fn();
      const billsInstance = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });

      const newBillBtn = screen.getByTestId("btn-new-bill");
      fireEvent.click(newBillBtn);
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    test("fetches bills from mock API GET", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      expect(screen.getAllByTestId("icon-eye").length).toBeGreaterThan(0);
    });

    test("Then it should display 404 error message from API", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 404")),
      }));
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      expect(screen.getByText("Erreur 404")).toBeTruthy();
    });

    test("Then it should display 500 error message from API", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 500")),
      }));
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      expect(screen.getByText("Erreur 500")).toBeTruthy();
    });
  });
});
test("Then getBills should return formatted bills", async () => {
  const onNavigate = jest.fn();
  const billsInstance = new Bills({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });

  const billsData = await billsInstance.getBills();
  expect(billsData.length).toBeGreaterThan(0);
  expect(billsData[0]).toHaveProperty("date");
});
test("Then clicking logout should clear localStorage and navigate to Login", () => {
  window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
  const onNavigate = jest.fn();
  document.body.innerHTML = BillsUI({ data: bills });

  const billsInstance = new Bills({
    document,
    onNavigate,
    store: null,
    localStorage: window.localStorage,
  });

  const logoutButton = screen.getByTestId("layout-disconnect");
  fireEvent.click(logoutButton);

  expect(window.localStorage.getItem("user")).toBe(null);
  expect(onNavigate).toHaveBeenCalledWith("#login");
});
test("Then if no user in localStorage, should redirect to Login", () => {
  window.localStorage.clear(); // simule utilisateur déconnecté
  const onNavigate = jest.fn();

  document.body.innerHTML = BillsUI({ data: [] });

  const billsInstance = new Bills({
    document,
    onNavigate,
    store: null,
    localStorage: window.localStorage,
  });

  expect(onNavigate).toHaveBeenCalledWith("#login");
});
test("Then getBills should return error if store fails", async () => {
  const failingStore = {
    bills() {
      return {
        list: () => Promise.reject(new Error("Erreur de récupération")),
      };
    },
  };

  const onNavigate = jest.fn();
  const billsInstance = new Bills({
    document,
    onNavigate,
    store: failingStore,
    localStorage: window.localStorage,
  });

  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  await billsInstance.getBills();
  expect(consoleSpy).toHaveBeenCalled();
});