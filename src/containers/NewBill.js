import { ROUTES_PATH } from "../constants/routes.js";
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

  // Gestion du changement de fichier
  handleChangeFile = (e) => {
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0]; // Récupère le fichier sélectionné

    if (!file) {
      console.error("Aucun fichier sélectionné.");
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const allowedMimeTypes = ["image/jpeg", "image/png"];

    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileType = file.type;

    console.log("Nom du fichier :", fileName);
    console.log("Extension :", fileExtension);
    console.log("Type MIME :", fileType);

    // Validation stricte des fichiers
    if (!allowedExtensions.includes(fileExtension) || !allowedMimeTypes.includes(fileType)) {
      alert("Seuls les fichiers au format JPG, JPEG ou PNG sont acceptés.");
      fileInput.value = ""; // Réinitialise l'entrée du fichier
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    // Téléchargement du fichier
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log("Fichier téléchargé avec succès :", fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi du fichier :", error);
        alert("Une erreur est survenue lors du téléchargement du fichier.");
      });
  };

  // Gestion de la soumission du formulaire
  handleSubmit = (e) => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;

    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Récupère le type de dépense
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value, // Récupère le nom de la dépense
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value), // Récupère le montant
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value, // Récupère la date
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // Récupère la TVA
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // Récupère le pourcentage ou valeur par défaut
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value, // Récupère le commentaire
      fileUrl: this.fileUrl, // URL du fichier téléchargé
      fileName: this.fileName, // Nom du fichier téléchargé
      status: "pending", // Statut de la note de frais
    };

    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]); // Redirection vers la page des notes de frais
  };

  // Mise à jour de la note de frais
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({
          data: JSON.stringify(bill),
          selector: this.billId,
        })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error("Erreur lors de la mise à jour :", error));
    }
  };
}
