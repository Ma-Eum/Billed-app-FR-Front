import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);

    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);

    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;

    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();

    const file = e.target.files[0]; // Get the uploaded file
    const fileName = file.name.toLowerCase(); // Convert filename to lowercase for consistency
    const allowedExtensions = ["jpg", "jpeg", "png"]; // Allowed extensions
    const fileExtension = fileName.split(".").pop(); // Extract the file extension

    // Validate the file extension
    if (!allowedExtensions.includes(fileExtension)) {
      alert("Seuls les fichiers au format JPG, JPEG ou PNG sont acceptés."); // Show alert if the file is invalid
      e.target.value = ""; // Reset the input value
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;

    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key; // Save the unique key of the uploaded file
        this.fileUrl = fileUrl; // Save the URL of the uploaded file
        this.fileName = fileName; // Save the filename
      })
      .catch((error) => console.error(error));
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Type of expense
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value, // Name of expense
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ), // Expense amount
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value, // Date of expense
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // VAT value
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20, // Percentage (default to 20 if not provided)
      commentary: e.target.querySelector(
        `textarea[data-testid="commentary"]`
      ).value, // Commentary
      fileUrl: this.fileUrl, // URL of the uploaded file
      fileName: this.fileName, // Name of the uploaded file
      status: "pending", // Set the status to pending
    };

    this.updateBill(bill); // Update the bill
    this.onNavigate(ROUTES_PATH["Bills"]); // Navigate to the Bills page
  };

  // Method to update a bill (not covered by tests)
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
