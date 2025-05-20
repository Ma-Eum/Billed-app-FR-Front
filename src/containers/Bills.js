import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class Bills {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.localStorage = localStorage;

    // Redirige si l'utilisateur n'est pas connecté
    const user = JSON.parse(this.localStorage.getItem("user"));
    if (!user) {
      this.onNavigate(ROUTES_PATH.Login);
      return;
    }

    const buttonNewBill = this.document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) {
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    }

    const iconEye = this.document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye.length > 0) {
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    }

    // Déconnexion
    const logoutButton = this.document.querySelector("#layout-disconnect");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        this.localStorage.clear();
        this.onNavigate(ROUTES_PATH.Login);
      });
    }
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH.NewBill);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor(document.querySelector("#modaleFile").offsetWidth * 0.5);

    const modalBody = document.querySelector("#modaleFile .modal-body");
    if (modalBody) {
      modalBody.innerHTML = `
        <div style='text-align: center;' class="bill-proof-container">
          <img width=${imgWidth} src=${billUrl} alt="Bill" />
        </div>`;
    }

    $("#modaleFile").modal("show");
  };

  getBills = async () => {
    if (this.store) {
      const snapshot = await this.store.bills().list();
      return snapshot
        .map((bill) => ({
          ...bill,
          date: formatDate(bill.date),
          status: formatStatus(bill.status),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return [];
  };
}