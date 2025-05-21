/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import DashboardUI from "../views/DashboardUI.js";

// ✅ Mock jQuery
global.$ = () => ({ modal: jest.fn() });

// ✅ Mock filteredBills
jest.mock("../containers/Dashboard.js", () => ({
  filteredBills: (bills, status) => bills.filter(b => b.status === status),
}));

describe("DashboardUI", () => {
  const bills = [
    { status: "pending" },
    { status: "pending" },
    { status: "accepted" },
    { status: "refused" },
    { status: "refused" },
    { status: "refused" },
  ];

  test("should render counts correctly for each status", () => {
    document.body.innerHTML = DashboardUI({ data: { bills }, loading: false, error: null });

    const pendingHeader = screen.getByTestId("arrow-icon1").previousElementSibling.textContent.trim();
    const acceptedHeader = screen.getByTestId("arrow-icon2").previousElementSibling.textContent.trim();
    const refusedHeader = screen.getByTestId("arrow-icon3").previousElementSibling.textContent.trim();

    expect(pendingHeader).toMatch(/En attente \(2\)/i);
    expect(acceptedHeader).toMatch(/Validé \(1\)/i);
    expect(refusedHeader).toMatch(/Refusé \(3\)/i);
  });

  test("should render loading page when loading is true", () => {
    const html = DashboardUI({ loading: true });
    document.body.innerHTML = html;
    expect(document.body.innerHTML).toContain("Loading...");
  });

  test("should render error page when error is true", () => {
    const html = DashboardUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    expect(screen.getByTestId("error-message").textContent).toMatch(/Erreur 500/);
  });
});