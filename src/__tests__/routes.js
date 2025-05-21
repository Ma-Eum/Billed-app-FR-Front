/**
 * @jest-environment jsdom
 */

import { ROUTES, ROUTES_PATH } from "../constants/routes";
import LoginUI from "../views/LoginUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import DashboardUI from "../views/DashboardUI.js";
import { screen } from "@testing-library/dom";

describe("ROUTES function", () => {
  beforeEach(() => {
    // Simule un utilisateur employé connecté
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "employee@test.com" })
    );
  });

  test("should return LoginUI when pathname is '/'", () => {
    const html = ROUTES({ pathname: ROUTES_PATH.Login });
    expect(html).toEqual(LoginUI({}));
  });

  test("should return BillsUI when pathname is '#employee/bills'", () => {
    const html = ROUTES({ pathname: ROUTES_PATH.Bills });
    expect(html).toEqual(BillsUI({}));
  });

  test("should return NewBillUI when pathname is '#employee/bill/new'", () => {
    const html = ROUTES({ pathname: ROUTES_PATH.NewBill });
    expect(html).toEqual(NewBillUI());
  });

  test("should return DashboardUI when pathname is '#admin/dashboard'", () => {
    window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }));
    const html = ROUTES({ pathname: ROUTES_PATH.Dashboard });
    document.body.innerHTML = html;
    expect(screen.getByTestId("form-admin")).toBeTruthy();
  });

  test("should return LoginUI when not authenticated", () => {
    window.localStorage.clear();
    const html = ROUTES({ pathname: ROUTES_PATH.Bills });
    expect(html).toEqual(LoginUI({}));
  });

  test("should return LoginUI on unknown path", () => {
    const html = ROUTES({ pathname: "#unknown/path" });
    expect(html).toEqual(LoginUI({}));
  });
});