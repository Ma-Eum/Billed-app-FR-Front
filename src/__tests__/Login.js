/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI.js";
import Login from "../containers/Login.js";
import { fireEvent, screen } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am on the login page", () => {
  let onNavigate;

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.clear();
    document.body.innerHTML = LoginUI();

    onNavigate = jest.fn();

    new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
    });
  });

  describe("When I fill fields in correct format and click on employee login", () => {
    test("Then I should be identified as an employee in app", () => {
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");
      const form = screen.getByTestId("form-employee");

      fireEvent.change(emailInput, { target: { value: "employee@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "employee123" } });

      fireEvent.submit(form);

      const user = JSON.parse(window.localStorage.getItem("user"));

      expect(user).toEqual({
        type: "Employee",
        email: "employee@test.com",
        password: "employee123",
      });

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });

  describe("When I fill fields in correct format and click on admin login", () => {
    test("Then I should be identified as an admin in app", () => {
      const emailInput = screen.getByTestId("admin-email-input");
      const passwordInput = screen.getByTestId("admin-password-input");
      const form = screen.getByTestId("form-admin");

      fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "admin123" } });

      fireEvent.submit(form);

      const user = JSON.parse(window.localStorage.getItem("user"));

      expect(user).toEqual({
        type: "Admin",
        email: "admin@test.com",
        password: "admin123",
      });

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Dashboard);
    });
  });

  describe("When I submit the form with empty fields", () => {
    test("Then user data should still be stored as empty strings", () => {
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");
      const form = screen.getByTestId("form-employee");

      fireEvent.change(emailInput, { target: { value: "" } });
      fireEvent.change(passwordInput, { target: { value: "" } });
      fireEvent.submit(form);

      const user = JSON.parse(window.localStorage.getItem("user"));

      expect(user).toEqual({
        type: "Employee",
        email: "",
        password: "",
      });

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });
});