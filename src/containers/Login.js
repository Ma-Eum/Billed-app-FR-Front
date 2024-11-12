import { ROUTES_PATH } from '../constants/routes.js';
export let PREVIOUS_LOCATION = '';

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.store = store

    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`);
    // Attach event listener only if formEmployee exists to avoid null reference errors
    if (formEmployee) formEmployee.addEventListener("submit", this.handleSubmitEmployee);

    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`);
    // Attach event listener only if formAdmin exists to avoid null reference errors
    if (formAdmin) formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }

  handleSubmitEmployee = (e) => {
    e.preventDefault();
    // Retrieve email and password input fields specific to employee form
    const emailInput = e.target.querySelector(`input[data-testid="employee-email-input"]`);
    const passwordInput = e.target.querySelector(`input[data-testid="employee-password-input"]`);

    // Check that email and password inputs are not null before accessing their values
    if (emailInput && passwordInput) {
      const user = {
        type: "Employee",
        email: emailInput.value,
        password: passwordInput.value,
        status: "connected"
      };

      this.localStorage.setItem("user", JSON.stringify(user));

      this.login(user)
        .catch((err) => this.createUser(user))
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
          this.PREVIOUS_LOCATION = ROUTES_PATH['Bills'];
          PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
          this.document.body.style.backgroundColor = "#fff";
        });
    } else {
      console.error("Employee fields are not properly initialized."); // Log error if fields are not found
    }
  };

  handleSubmitAdmin = (e) => {
    e.preventDefault();
    // Retrieve email and password input fields specific to admin form
    const emailInput = e.target.querySelector(`input[data-testid="admin-email-input"]`);
    const passwordInput = e.target.querySelector(`input[data-testid="admin-password-input"]`);

    // Check that email and password inputs are not null before accessing their values
    if (emailInput && passwordInput) {
      const user = {
        type: "Admin",
        email: emailInput.value,
        password: passwordInput.value,
        status: "connected"
      };

      this.localStorage.setItem("user", JSON.stringify(user));

      this.login(user)
        .catch((err) => this.createUser(user))
        .then(() => {
          this.onNavigate(ROUTES_PATH['Dashboard']);
          this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard'];
          PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
          document.body.style.backgroundColor = "#fff";
        });
    } else {
      console.error("Admin fields are not properly initialized."); // Log error if fields are not found
    }
  };

  // not need to cover this function by tests
  login = (user) => {
    if (this.store) {
      return this.store
        .login(JSON.stringify({
          email: user.email,
          password: user.password,
        }))
        .then(({ jwt }) => {
          localStorage.setItem('jwt', jwt); // Store JWT for session security
        });
    } else {
      return Promise.reject("Store is undefined"); // Return an error if store is not defined
    }
  };

  // not need to cover this function by tests
  createUser = (user) => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split('@')[0], // Use the part before "@" as the user's name
            email: user.email,
            password: user.password,
          })
        })
        .then(() => {
          console.log(`User with ${user.email} created`);
          return this.login(user); // Attempt to log in after creating the user
        });
    } else {
      return Promise.reject("Store is undefined"); // Return an error if store is not defined
    }
  };
}
