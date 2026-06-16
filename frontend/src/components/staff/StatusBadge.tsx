import React from "react";
import type { AppointmentStatus } from "../../types/appointment";

interface StatusBadgeProps {
  status: AppointmentStatus | string;
}

export const statusTranslations: Record<string, string> = {
  requested: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  arrived: "Khách đã đến (Sẵn sàng)",
  in_service: "Đang phục vụ",
  completed: "Hoàn thành (Chờ t.toán)",
  invoiced: "Đã tạo hóa đơn",
  closed: "Đã thanh toán (Hoàn tất)",
  cancelled: "Đã hủy",
  no_show: "Vắng mặt",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const label = statusTranslations[status] || status;
  return (
    <span className={`stylist-status-badge status-${status}`}>
      <span className="status-dot" style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: 6,
        backgroundColor: "currentColor"
      }} />
      {label}
    </span>
  );
};
