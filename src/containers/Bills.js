import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class Bills {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    const buttonNewBill = this.document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener("click", this.handleClickNewBill);

    const iconEye = this.document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) {
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    }

    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
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
    $("#modaleFile").modal("show"); // Cette ligne fonctionnera avec le mock dans setup-jest.js
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
