import { useEffect, useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import BASE_URL from "../config";
import styles from "../styles/pages/Shipments.module.css";

function Shipments() {
  const toast = useToast();
  const [shipments, setShipments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingType, setTrackingType] = useState("AWB");
  const [shipmentStatus, setShipmentStatus] = useState("Pending");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/outward/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error("Failed to load shipments");
    }
  };

  const openUpdateModal = (shipment) => {
    setSelectedShipment(shipment);
    setCourierName(shipment.courier_name || "");
    setTrackingNumber(shipment.tracking_number || "");
    setTrackingType(shipment.tracking_type || "AWB");
    setShipmentStatus(shipment.shipment_status || "Pending");
    setEstimatedDelivery(shipment.estimated_delivery || "");
    setNotes(shipment.notes || "");
    setShowModal(true);
  };

  const updateShipment = async () => {
    if (!selectedShipment) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/outward/update-shipment/${selectedShipment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courier_name: courierName,
            tracking_number: trackingNumber,
            tracking_type: trackingType,
            shipment_status: shipmentStatus,
            estimated_delivery: estimatedDelivery,
            notes: notes,
          }),
        },
      );

      if (response.ok) {
        toast.success("Shipment updated successfully!");
        setShowModal(false);
        loadShipments();
      } else {
        toast.error("Failed to update shipment");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update shipment");
    }
  };

  const getTrackingUrl = (courier, trackingNum, trackingType) => {
    if (!trackingNum) return null;

    // Delhivery uses different URLs for AWB vs LRN
    if (courier === "Delhivery") {
      if (trackingType === "LRN") {
        return `https://www.delhivery.com/track/lr/${trackingNum}`;
      } else {
        return `https://www.delhivery.com/track/package/${trackingNum}`;
      }
    }

    // Other couriers - only support AWB
    if (trackingType === "LRN") return null;

    const urls = {
      BlueDart: `https://www.bluedart.com/tracking/${trackingNum}`,
      DTDC: `https://www.dtdc.in/tracking.asp?strCnno=${trackingNum}`,
      FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNum}`,
      DHL: `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${trackingNum}`,
      "India Post": `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentno=${trackingNum}`,
    };

    return urls[courier] || null;
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: "#9ca3af",
      Processing: "#fbbf24",
      Shipped: "#3b82f6",
      "In Transit": "#8b5cf6",
      "Out for Delivery": "#f59e0b",
      Delivered: "#10b981",
      Failed: "#ef4444",
      RTO: "#dc2626",
    };

    return (
      <span
        style={{
          background: colors[status] || "#6b7280",
          color: "white",
          padding: "0.25rem 0.75rem",
          borderRadius: "6px",
          fontWeight: "600",
          fontSize: "0.875rem",
        }}
      >
        {status}
      </span>
    );
  };

  const filteredShipments = shipments.filter(
    (s) => !filterStatus || s.shipment_status === filterStatus,
  );

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.shipments}>
      <div className={styles.header}>
        <h1 className={styles.title}>🚚 Shipment Tracking</h1>
        <p className={styles.subtitle}>
          Track all outward shipments and delivery status
        </p>
      </div>

      <div className={styles.filterCard}>
        <select
          className={styles.select}
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="In Transit">In Transit</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Failed">Failed</option>
          <option value="RTO">RTO</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>
            Shipments ({filteredShipments.length})
          </h3>
        </div>

        {filteredShipments.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Courier/Transport</th>
                  <th>Tracking Number</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      <strong>{shipment.invoice}</strong>
                    </td>
                    <td>{shipment.product_name}</td>
                    <td>{shipment.customer}</td>
                    <td>
                      <span
                        style={{
                          background:
                            shipment.tracking_type === "LRN"
                              ? "#8b5cf6"
                              : "#3b82f6",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {shipment.tracking_type || "AWB"}
                      </span>
                    </td>
                    <td>{shipment.courier_name || "—"}</td>
                    <td>
                      {shipment.tracking_number ? (
                        getTrackingUrl(
                          shipment.courier_name,
                          shipment.tracking_number,
                          shipment.tracking_type,
                        ) ? (
                          <a
                            href={getTrackingUrl(
                              shipment.courier_name,
                              shipment.tracking_number,
                              shipment.tracking_type,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.trackingLink}
                          >
                            {shipment.tracking_number} 🔗
                          </a>
                        ) : (
                          <strong>{shipment.tracking_number}</strong>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {getStatusBadge(shipment.shipment_status || "Pending")}
                    </td>
                    <td>{shipment.date}</td>
                    <td>
                      <button
                        className={styles.updateButton}
                        onClick={() => openUpdateModal(shipment)}
                      >
                        ✏️ Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredShipments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚚</div>
            <p className={styles.emptyText}>No shipments found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Update Shipment</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tracking Type *</label>
              <select
                className={styles.select}
                value={trackingType}
                onChange={(e) => setTrackingType(e.target.value)}
              >
                <option value="AWB">AWB (Air Waybill)</option>
                <option value="LRN">LRN (Lorry Receipt)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                {trackingType === "AWB" ? "Courier Name" : "Transport Name"} *
              </label>
              <select
                className={styles.select}
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              >
                <option value="">
                  Select {trackingType === "AWB" ? "Courier" : "Transport"}
                </option>
                {trackingType === "AWB" ? (
                  <>
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="FedEx">FedEx</option>
                    <option value="DHL">DHL</option>
                    <option value="India Post">India Post</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Delhivery">Delhivery</option>
                    <option value="VRL Logistics">VRL Logistics</option>
                    <option value="TCI Freight">TCI Freight</option>
                    <option value="Gati">Gati</option>
                    <option value="Safexpress">Safexpress</option>
                    <option value="Agarwal Packers">Agarwal Packers</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                {trackingType === "AWB" ? "AWB Number" : "LRN Number"} *
              </label>
              <input
                className={styles.input}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={`Enter ${trackingType === "AWB" ? "AWB/Tracking" : "LRN"} number`}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Shipment Status *</label>
              <select
                className={styles.select}
                value={shipmentStatus}
                onChange={(e) => setShipmentStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
                <option value="RTO">RTO</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Estimated Delivery</label>
              <input
                className={styles.input}
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <textarea
                className={styles.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveButton} onClick={updateShipment}>
                Update Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shipments;
