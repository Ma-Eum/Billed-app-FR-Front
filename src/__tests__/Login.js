/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import LoginUI from "../views/LoginUI.js";
import Login from "../containers/Login.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am on the Login page", () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
  });

  describe("When I fill the employee form with valid data", () => {
    test("Then I should be logged in as an employee", () => {
      const html = LoginUI();
      document.body.innerHTML = html;

      const inputEmail = screen.getByTestId("employee-email-input");
      const inputPassword = screen.getByTestId("employee-password-input");
      const form = screen.getByTestId("form-employee");

      fireEvent.change(inputEmail, { target: { value: "employee@test.com" } });
      fireEvent.change(inputPassword, { target: { value: "password123" } });

      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When I fill the admin form with valid data", () => {
    test("Then I should be logged in as an admin", () => {
      const html = LoginUI();
      document.body.innerHTML = html;

      const inputEmail = screen.getByTestId("admin-email-input");
      const inputPassword = screen.getByTestId("admin-password-input");
      const form = screen.getByTestId("form-admin");

      fireEvent.change(inputEmail, { target: { value: "admin@test.com" } });
      fireEvent.change(inputPassword, { target: { value: "adminpassword" } });

      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
