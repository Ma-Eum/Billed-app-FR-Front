/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI.js";
import Login from "../containers/Login.js";
import { fireEvent, screen } from "@testing-library/dom";

describe("Given I am on the login page", () => {
  let onNavigate;

  beforeEach(() => {
    // Simule une navigation
    onNavigate = jest.fn();
    document.body.innerHTML = LoginUI();

    // Instancie Login après injection DOM
    new Login({ document, localStorage: window.localStorage, onNavigate });
  });

  describe("When I submit the employee login form with valid credentials", () => {
    test("Then I should be redirected to the Bills page", () => {
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");
      const form = screen.getByTestId("form-employee");

      fireEvent.change(emailInput, { target: { value: "employee@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "employee123" } });

      fireEvent.submit(form);

      const user = JSON.parse(window.localStorage.getItem("user"));
      expect(user.type).toBe("Employee");
      expect(onNavigate).toHaveBeenCalledWith("#employee/bills");
    });
  });

  describe("When I submit the admin login form with valid credentials", () => {
    test("Then I should be redirected to the Dashboard page", () => {
      const emailInput = screen.getByTestId("admin-email-input");
      const passwordInput = screen.getByTestId("admin-password-input");
      const form = screen.getByTestId("form-admin");

      fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "admin123" } });

      fireEvent.submit(form);

      const user = JSON.parse(window.localStorage.getItem("user"));
      expect(user.type).toBe("Admin");
      expect(onNavigate).toHaveBeenCalledWith("#admin/dashboard");
    });
  });

  describe("When I submit forms with empty inputs", () => {
    test("Then it should not set localStorage or navigate", () => {
      const form = screen.getByTestId("form-employee");
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");

      fireEvent.change(emailInput, { target: { value: "" } });
      fireEvent.change(passwordInput, { target: { value: "" } });

      fireEvent.submit(form);

      expect(window.localStorage.getItem("user")).toBe(null);
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });
});