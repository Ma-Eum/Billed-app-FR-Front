/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI.js";
import Login from "../containers/Login.js";
import { fireEvent, screen } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";

describe("Given I am on the login page", () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = jest.fn();
    document.body.innerHTML = LoginUI();

    new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
    });
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
      expect(user.email).toBe("employee@test.com");
      expect(user.password).toBe("employee123");
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
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
      expect(user.email).toBe("admin@test.com");
      expect(user.password).toBe("admin123");
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Dashboard);
    });
  });

  describe("When I submit forms with empty inputs", () => {
    test("Then localStorage should store empty strings (not null)", () => {
      const form = screen.getByTestId("form-employee");
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");

      fireEvent.change(emailInput, { target: { value: "" } });
      fireEvent.change(passwordInput, { target: { value: "" } });

      fireEvent.submit(form);

      const user = JSON.parse(window.localStorage.getItem("user"));
      expect(user).toEqual({
        type: "Employee",
        email: "",
        password: ""
      });
    });
  });
});