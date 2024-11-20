import { ROUTES_PATH } from '../constants/routes.js';
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  // Handler for the file input change event
  handleChangeFile = e => {
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0]; // Get the selected file
    const filePath = e.target.value.split(/\\/g); // Get the file path
    const fileName = filePath[filePath.length - 1]; // Extract the file name from the path

    // List of allowed file extensions
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = fileName.split(".").pop().toLowerCase(); // Extract and normalize file extension

    // Check if the file extension is not in the allowed list
    if (!allowedExtensions.includes(fileExtension)) {
      alert("Seuls les fichiers au format JPG, JPEG ou PNG sont acceptés."); // Show an alert
      fileInput.value = ""; // Reset the input field
      return; // Exit the function
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file); // Append the file to the form data
    formData.append('email', email); // Append the user's email to the form data

    // Upload the file to the server
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        this.billId = key; // Save the bill ID
        this.fileUrl = fileUrl; // Save the file URL
        this.fileName = fileName; // Save the file name
      })
      .catch(error => console.error(error));
  }

  // Handler for the form submission event
  handleSubmit = e => {
    e.preventDefault(); // Prevent the default form submission behavior
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Get the expense type
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value, // Get the expense name
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value), // Get the amount
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value, // Get the date
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // Get the VAT
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // Get the percentage or default to 20
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value, // Get the commentary
      fileUrl: this.fileUrl, // Get the uploaded file URL
      fileName: this.fileName, // Get the uploaded file name
      status: 'pending' // Set the status to pending
    };
    this.updateBill(bill); // Update the bill with the new data
    this.onNavigate(ROUTES_PATH['Bills']); // Navigate to the bills page
  }

  // Function to update a bill
  // Not covered by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId }) // Send the updated bill data
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']); // Navigate to the bills page
        })
        .catch(error => console.error(error));
    }
  }
}
