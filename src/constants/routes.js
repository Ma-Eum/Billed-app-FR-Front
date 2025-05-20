import LoginUI from "../views/LoginUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import DashboardUI from "../views/DashboardUI.js"

export const ROUTES_PATH = {
  Login: '/',
  Bills: '#employee/bills',
  NewBill: '#employee/bill/new',
  Dashboard: '#admin/dashboard'
}

export const ROUTES = ({ pathname, data, error, loading }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Vérifie l'authentification
  const isAuthenticated = user && user.email;

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une autre page que Login
  if (!isAuthenticated && pathname !== ROUTES_PATH.Login) {
    return LoginUI({ data, error, loading });
  }

  switch (pathname) {
    case ROUTES_PATH.Login:
      return LoginUI({ data, error, loading });
    case ROUTES_PATH.Bills:
      return BillsUI({ data, error, loading });
    case ROUTES_PATH.NewBill:
      return NewBillUI();
    case ROUTES_PATH.Dashboard:
      return DashboardUI({ data, error, loading });
    default:
      return LoginUI({ data, error, loading });
  }
}