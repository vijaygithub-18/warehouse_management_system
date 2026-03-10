import { render, screen } from "@testing-library/react";
import PurchaseOrders from "../pages/PurchaseOrders";

describe("PurchaseOrders", () => {
  it("renders the purchase orders page", () => {
    render(<PurchaseOrders />);
    const heading = screen.getByText(/Purchase Orders/i);
    expect(heading).toBeInTheDocument();
  });
});
