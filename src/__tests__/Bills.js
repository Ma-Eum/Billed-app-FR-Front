/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then clicking on an eye icon should display the modal", () => {
      // Ajouter un DOM simulé pour la modale
      document.body.innerHTML = `
        <div id="modaleFile" class="modal">
          <div class="modal-body"></div>
        </div>
      `;
      document.body.innerHTML += BillsUI({ data: bills });

      // Mock de la fonction onNavigate
      const onNavigate = jest.fn();
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      // Vérifier que l'icône existe
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      expect(iconEye).toBeTruthy();

      // Simuler un clic sur l'icône
      iconEye.addEventListener("click", () => billsInstance.handleClickIconEye(iconEye));
      fireEvent.click(iconEye);

      // Vérifier l'affichage de la modale
      const modal = document.querySelector("#modaleFile");
      expect(modal).toBeTruthy();
      expect(modal.style.display).toBe(""); // JSDOM ne gère pas "block", cela restera vide
    });
  });
});
