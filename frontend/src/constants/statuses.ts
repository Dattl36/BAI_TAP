export const STATUS_COLORS: Record<string, string> = {
  active: "green",
  inactive: "default",
  archived: "red",
  requested: "blue",
  confirmed: "green",
  arrived: "cyan",
  in_service: "purple",
  completed: "gold",
  invoiced: "gold",
  closed: "default",
  cancelled: "red",
  no_show: "volcano",
  draft: "default",
  issued: "blue",
  partially_paid: "orange",
  paid: "green",
  adjusted: "purple",
  attempted: "default",
  pending: "orange",
  successful: "green",
  failed: "red",
  refunded: "orange",
  received: "blue",
  responded: "green",
  assigned: "cyan",
  in_review: "purple",
  escalated: "volcano",
  resolved: "green",
  read: "default",
  delivered: "green",
  created: "blue",
};

export const STATUS_LABELS: Record<string, string> = {
<<<<<<< HEAD
  // Appointment & General Statuses
  pending: "Chờ xác nhận",
  requested: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  arrived: "Đã đến",
  in_service: "Đang làm",
  completed: "Đã hoàn thành",
  invoiced: "Đã xuất hóa đơn",
  closed: "Đã đóng",
  cancelled: "Đã hủy",
  no_show: "Không đến",
  
  // Voucher Statuses
  active: "Hoạt động",
  inactive: "Ngưng hoạt động",
  archived: "Lưu trữ",
  expired: "Đã hết hạn",
  redeemed: "Đã đổi",
  
  // Invoice & Payment Statuses
=======
  active: "Hoạt động",
  inactive: "Ngưng hoạt động",
  archived: "Đã lưu trữ",
  requested: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  arrived: "Đã đến",
  in_service: "Đang làm dịch vụ",
  completed: "Hoàn thành",
  invoiced: "Đã xuất hóa đơn",
  closed: "Đã đóng",
  cancelled: "Đã hủy",
  no_show: "Vắng mặt",
>>>>>>> 27f04a9d6e7a8b6ed1ebe698fcfce256d759d88a
  draft: "Bản nháp",
  issued: "Đã phát hành",
  partially_paid: "Thanh toán một phần",
  paid: "Đã thanh toán",
  adjusted: "Đã điều chỉnh",
<<<<<<< HEAD
  attempted: "Đang xử lý",
  successful: "Thành công",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
  
  // Complaint & Feedback Statuses
  received: "Đã nhận",
  responded: "Đã phản hồi",
  assigned: "Đã phân công",
  in_review: "Đang xem xét",
  escalated: "Đã leo thang",
  resolved: "Đã giải quyết",
  rejected: "Đã từ chối",
  
  // Notification Statuses
  read: "Đã đọc",
  delivered: "Đã gửi",
  created: "Đã tạo"
=======
  attempted: "Đã thử",
  pending: "Chờ xử lý",
  successful: "Thành công",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
  received: "Đã nhận",
  responded: "Đã phản hồi",
  assigned: "Đã phân công",
  in_review: "Đang đánh giá",
  escalated: "Đã leo thang",
  resolved: "Đã giải quyết",
  read: "Đã đọc",
  delivered: "Đã gửi",
  created: "Đã tạo",
>>>>>>> 27f04a9d6e7a8b6ed1ebe698fcfce256d759d88a
};

export const formatStatusLabel = (status?: string) => {
  if (!status) return "Không xác định";
<<<<<<< HEAD
  const s = status.toLowerCase();
  return STATUS_LABELS[s] || status.replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
=======
  const lower = status.toLowerCase();
  return STATUS_LABELS[lower] ?? lower.replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
>>>>>>> 27f04a9d6e7a8b6ed1ebe698fcfce256d759d88a
};
