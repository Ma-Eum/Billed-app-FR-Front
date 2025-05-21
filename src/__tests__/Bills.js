/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";

describe("Bills.js full test suite", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = '<div id="root"></div>';
  });

  test("should redirect to login if no user in localStorage", () => {
    window.localStorage.removeItem("user");
    const onNavigate = jest.fn();

    new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login);
  });

  test("should attach click listener to 'Nouvelle note de frais' button", () => {
    document.body.innerHTML = '<button data-testid="btn-new-bill">New</button>';
    const onNavigate = jest.fn();

    new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const newBillBtn = screen.getByTestId("btn-new-bill");
    fireEvent.click(newBillBtn);

    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
  });

  test("should insert image in modal and call jQuery modal", () => {
    const icon = document.createElement("div");
    icon.setAttribute("data-bill-url", "https://example.com/test.jpg");
    icon.setAttribute("data-testid", "icon-eye");

    const modal = document.createElement("div");
    modal.setAttribute("id", "modaleFile");
    modal.innerHTML = '<div class="modal-body"></div>';
    document.body.appendChild(modal);
    document.body.appendChild(icon);

    $.fn.modal = jest.fn();

    const instance = new Bills({
      document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: window.localStorage,
    });

    instance.handleClickIconEye(icon);

    const img = document.querySelector(".modal-body img");
    expect(img).toBeTruthy();
    expect(img.src).toBe("https://example.com/test.jpg");
    expect($.fn.modal).toHaveBeenCalled();
  });

  test("should clear localStorage and redirect on logout", () => {
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = '<div id="layout-disconnect"></div>';

    const onNavigate = jest.fn();

    new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const logoutBtn = document.getElementById("layout-disconnect");
    fireEvent.click(logoutBtn);

    expect(window.localStorage.getItem("user")).toBe(null);
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login);
  });
});
test("should return [] if no store is defined", async () => {
  const instance = new Bills({
    document,
    onNavigate: jest.fn(),
    store: null,
    localStorage: window.localStorage,
  });

  const data = await instance.getBills();
  expect(data).toEqual([]);
});
test("should not fail if 'btn-new-bill' button is missing", () => {
  document.body.innerHTML = `<div></div>`; // pas de bouton
  const onNavigate = jest.fn();

  expect(() => {
    new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
  }).not.toThrow();
});
test("should not fail if no eye icons are present", () => {
  document.body.innerHTML = `<div></div>`;
  const onNavigate = jest.fn();

  expect(() => {
    new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
  }).not.toThrow();
});
