/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBill from "../containers/NewBill";
import NewBillUI from "../views/NewBillUI";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "employee@test.com" })
    );
    document.body.innerHTML = NewBillUI();
  });

  describe("When I upload a file", () => {
    test("Then it should accept valid file types (jpg, jpeg, png)", () => {
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["content"], "image.jpg", { type: "image/jpeg" });

      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(alertSpy).not.toHaveBeenCalled();
      expect(fileInput.files[0]).toEqual(validFile);
    });

    test("Then it should reject invalid file types (e.g., pdf)", () => {
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
      const fileInput = screen.getByTestId("file");
      const invalidFile = new File(["content"], "file.pdf", { type: "application/pdf" });

      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(alertSpy).toHaveBeenCalledWith("Seuls les fichiers .jpg, .jpeg ou .png sont autorisés.");
      expect(fileInput.value).toBe("");
    });

    test("should handle no file selected without error", () => {
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
      const fileInput = screen.getByTestId("file");

      Object.defineProperty(fileInput, "files", {
        value: [],
        writable: true,
      });

      const changeEvent = new Event("change");
      expect(() => fireEvent(fileInput, changeEvent)).not.toThrow();
    });
  });

  describe("When I submit the form", () => {
    test("Then it should call updateBill with correct data", () => {
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Test expense" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-11-01" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });

      const mockUpdateBill = jest.spyOn(newBill, "updateBill");
      fireEvent.submit(screen.getByTestId("form-new-bill"));

      expect(mockUpdateBill).toHaveBeenCalled();
      expect(mockUpdateBill).toHaveBeenCalledWith(expect.objectContaining({ name: "Test expense", date: "2023-11-01", amount: 100 }));
    });

    test("Then I should be redirected to Bills page", () => {
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith("#employee/bills");
    });

    test("Then it should call store.bills().update once", async () => {
  const onNavigate = jest.fn();
  const updateMock = jest.fn(() => Promise.resolve({}));

  const store = {
    bills: () => ({
      update: updateMock
    })
  };

  const newBill = new NewBill({
    document,
    onNavigate,
    store,
    localStorage: window.localStorage
  });

  newBill.fileUrl = "url";
  newBill.fileName = "facture.png";

  fireEvent.submit(screen.getByTestId("form-new-bill"));

  await new Promise(process.nextTick);

  expect(updateMock).toHaveBeenCalledTimes(1);
});


    test("Then it should display console.error on 500 error", async () => {
      const error = new Error("Erreur 500");
      mockStore.bills().update = jest.fn(() => Promise.reject(error));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      newBill.fileUrl = "url";
      newBill.fileName = "file.png";
      fireEvent.submit(screen.getByTestId("form-new-bill"));

      await new Promise(process.nextTick);
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    test("should not crash if store is null", () => {
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: null, localStorage: window.localStorage });
      newBill.fileUrl = "url";
      newBill.fileName = "file.jpg";
      expect(() => fireEvent.submit(screen.getByTestId("form-new-bill"))).not.toThrow();
    });

    test("should display error in console if update throws a network error", async () => {
      const error = new Error("Network Error");
      mockStore.bills().update = jest.fn(() => Promise.reject(error));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      newBill.fileUrl = "url";
      newBill.fileName = "file.png";
      fireEvent.submit(screen.getByTestId("form-new-bill"));

      await new Promise(process.nextTick);
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });
  });
});