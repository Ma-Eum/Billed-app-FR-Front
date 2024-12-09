import { ROUTES_PATH } from "../constants/routes.js";

export default class Login {
  constructor({ document, localStorage, onNavigate, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.store = store;

    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`);
    if (formEmployee) formEmployee.addEventListener("submit", this.handleSubmitEmployee);

    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`);
    if (formAdmin) formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }

  handleSubmitEmployee = (e) => {
    e.preventDefault();
    const email = e.target.querySelector(`input[data-testid="employee-email-input"]`).value;
    const password = e.target.querySelector(`input[data-testid="employee-password-input"]`).value;

    const user = {
      type: "Employee",
      email,
      password,
    };

    this.localStorage.setItem("user", JSON.stringify(user));

    this.onNavigate(ROUTES_PATH.Bills);
  };

  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const email = e.target.querySelector(`input[data-testid="admin-email-input"]`).value;
    const password = e.target.querySelector(`input[data-testid="admin-password-input"]`).value;

    const user = {
      type: "Admin",
      email,
      password,
    };

    this.localStorage.setItem("user", JSON.stringify(user));

    this.onNavigate(ROUTES_PATH.Dashboard);
  };
}
