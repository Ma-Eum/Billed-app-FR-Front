import store from "../__mocks__/store.js";
import Login from "../containers/Login.js";
import Bills from "../containers/Bills.js";
import NewBill from "../containers/NewBill.js";
import Dashboard from "../containers/Dashboard.js";

import BillsUI from "../views/BillsUI.js";
import DashboardUI from "../views/DashboardUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

export default () => {
  const updateActiveIcon = (pathname) => {
    const icon1 = document.getElementById("layout-icon1");
    const icon2 = document.getElementById("layout-icon2");

    if (icon1) icon1.classList.remove("active-icon");
    if (icon2) icon2.classList.remove("active-icon");

    if (pathname === ROUTES_PATH.Bills && icon1) {
      icon1.classList.add("active-icon");
      console.log("✅ icon1 devient active");
    }

    if (pathname === ROUTES_PATH.NewBill && icon2) {
      icon2.classList.add("active-icon");
      console.log("✅ icon2 devient active");
    }
  };

  const attachSidebarEvents = (onNavigate) => {
    const iconWindow = document.getElementById("layout-icon1");
    const iconMail = document.getElementById("layout-icon2");

    if (iconWindow) {
      iconWindow.onclick = () => {
        console.log("🏠 Icône Window cliquée");
        onNavigate(ROUTES_PATH.Bills);
      };
    }

    if (iconMail) {
      iconMail.onclick = () => {
        console.log("✉️ Icône Mail cliquée");
        onNavigate(ROUTES_PATH.NewBill);
      };
    }
  };

  window.onload = () => {
    const rootDiv = document.getElementById("root");

    const onNavigate = (pathname) => {
      window.history.pushState({}, pathname, window.location.origin + pathname);
      window.location.hash = pathname;

      if (pathname === ROUTES_PATH.Login) {
        rootDiv.innerHTML = ROUTES({ pathname });
        document.body.style.backgroundColor = "#0E5AE5";
        new Login({ document, localStorage, onNavigate, store });
        updateActiveIcon(pathname);
      }

      else if (pathname === ROUTES_PATH.Bills) {
        rootDiv.innerHTML = ROUTES({ pathname, loading: true });
        const bills = new Bills({ document, onNavigate, store, localStorage });
        bills.getBills().then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          new Bills({ document, onNavigate, store, localStorage });
          attachSidebarEvents(onNavigate);
          updateActiveIcon(pathname);
        }).catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
      }

      else if (pathname === ROUTES_PATH.NewBill) {
        console.log("🔁 REDIRECTION VERS NEW BILL");
        rootDiv.innerHTML = ROUTES({ pathname, loading: true });
        new NewBill({ document, onNavigate, store, localStorage });
        attachSidebarEvents(onNavigate);
        updateActiveIcon(pathname);
      }

      else if (pathname === ROUTES_PATH.Dashboard) {
        rootDiv.innerHTML = ROUTES({ pathname, loading: true });
        const dashboard = new Dashboard({ document, onNavigate, store, bills: [], localStorage });
        dashboard.getBillsAllUsers().then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
          attachSidebarEvents(onNavigate);
          updateActiveIcon(pathname);
        }).catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
      }
    };

    window.onNavigate = onNavigate;

    // Redirection initiale
    const hash = window.location.hash;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || hash === "") {
      onNavigate(ROUTES_PATH.Login);
    } else if (hash === ROUTES_PATH.Bills) {
      onNavigate(ROUTES_PATH.Bills);
    } else if (hash === ROUTES_PATH.NewBill) {
      onNavigate(ROUTES_PATH.NewBill);
    } else if (hash === ROUTES_PATH.Dashboard) {
      onNavigate(ROUTES_PATH.Dashboard);
    } else {
      onNavigate(ROUTES_PATH.Login);
    }
  };

  return null;
};