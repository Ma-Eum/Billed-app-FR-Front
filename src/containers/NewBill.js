import { ROUTES_PATH } from "../constants/routes.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.localStorage = localStorage;

    const user = JSON.parse(this.localStorage.getItem("user"));
    if (!user) {
      this.onNavigate(ROUTES_PATH.Login);
      return;
    }

    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);

    const logoutButton = this.document.querySelector("#layout-disconnect");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        this.localStorage.clear();
        this.onNavigate(ROUTES_PATH.Login);
      });
    }

    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isValid = ["jpg", "jpeg", "png"].includes(fileExtension);
    if (!isValid) {
      alert("Seuls les fichiers .jpg, .jpeg ou .png sont autorisés.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(this.localStorage.getItem("user")).email;
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
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = file.name;
      })
      .catch((error) => console.error("Erreur fichier :", error));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const email = JSON.parse(this.localStorage.getItem("user")).email;

    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };

    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH.Bills);
  };

  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({
          data: JSON.stringify(bill),
          selector: this.billId,
        })
        .then(() => {
          this.onNavigate(ROUTES_PATH.Bills);
        })
        .catch(console.error);
    }
  };
}