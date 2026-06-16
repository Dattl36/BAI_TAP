import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

import { formatMoney } from "../../utils/money";

interface ServiceLine {
  name: string;
  price: number;
}

interface BookingSummaryProps {
  customerName?: string;
  services: ServiceLine[];
  staffName?: string;
  dateTime?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BookingSummary = ({
  customerName,
  services,
  staffName,
  dateTime,
  onConfirm,
  isLoading,
}: BookingSummaryProps) => {
  const total = services.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="rcpt-booking-summary">
      <div className="summary-title">Booking Summary</div>

      <div className="summary-row">
        <span className="row-label">Customer</span>
        <span className="row-value">{customerName || "—"}</span>
      </div>

      {services.length > 0 && (
        <>
          <div className="summary-row" style={{ fontWeight: 600, marginTop: 8 }}>
            <span className="row-label">Services</span>
          </div>
          {services.map((s, i) => (
            <div className="summary-row" key={i} style={{ paddingLeft: 8 }}>
              <span className="row-label" style={{ fontSize: 12 }}>• {s.name}</span>
              <span className="row-value" style={{ fontSize: 12 }}>{formatMoney(s.price)}</span>
            </div>
          ))}
        </>
      )}

      <div className="summary-row">
        <span className="row-label">Stylist</span>
        <span className="row-value">{staffName || "—"}</span>
      </div>

      <div className="summary-row">
        <span className="row-label">Date & Time</span>
        <span className="row-value">{dateTime || "—"}</span>
      </div>

      <hr className="summary-divider" />

      <div className="summary-total">
        <span>Estimated Total</span>
        <span>{formatMoney(total)}</span>
      </div>

      <Button
        type="primary"
        block
        size="large"
        className="rcpt-btn-gold"
        icon={<CheckCircleOutlined />}
        onClick={onConfirm}
        loading={isLoading}
        disabled={!customerName || services.length === 0}
        style={{ height: 48, marginTop: 8 }}
      >
        Confirm Booking
      </Button>
    </div>
  );
};
