import { ROUTES_PATH } from '../constants/routes.js';

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.localStorage = localStorage;

    const logoutButton = this.document.querySelector('#layout-disconnect');
    if (logoutButton) {
      logoutButton.addEventListener('click', this.handleClick);
    } else {
      console.warn('❗ Bouton de déconnexion non trouvé (#layout-disconnect)');
    }
  }

  handleClick = (e) => {
    e.preventDefault();
    console.log("🔓 Déconnexion...");
    this.localStorage.clear();
    this.onNavigate(ROUTES_PATH.Login);
    location.reload(); // 🔁 recharge la page pour forcer le retour à la page Login
  };
}