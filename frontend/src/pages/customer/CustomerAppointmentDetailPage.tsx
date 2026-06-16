import { Card, Descriptions, Typography, Button, Space, Modal, message } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, TrophyOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { appointmentsApi } from "../../api/appointments.api";
import { StatusTag } from "../../components/common/StatusTag";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";

export const CustomerAppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: appointment, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["appointments", "detail", id],
    queryFn: () => appointmentsApi.detail(Number(id)),
    enabled: Boolean(id),
  });

  const formatAppointmentDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Chưa xác định";
    const weekdays = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy"
    ];
    const weekday = weekdays[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${weekday}, ${day}/${month}/${year}`;
  };

  const formatShortTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => appointmentsApi.cancel(Number(id), reason),
    onSuccess: () => {
      void message.success("Đơn đặt lịch của bạn đã được hủy thành công.");
      void refetch();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Hủy đặt lịch thất bại.";
      void message.error(errMsg);
    },
  });

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!appointment) {
    return <ErrorState message="Không tìm thấy lịch hẹn." onRetry={refetch} />;
  }

  const handleCancelClick = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: "Hành động này không thể hoàn tác. Bạn sẽ mất khung giờ hẹn đã chọn.",
      okText: "Có, Hủy đặt lịch",
      okType: "danger",
      cancelText: "Không, Giữ lại lịch hẹn",
      onOk: () => {
        return cancelMutation.mutateAsync("Khách hàng tự hủy qua cổng thông tin");
      },
    });
  };

  const serviceName = appointment.service_details?.name || "Phục hồi tóc tổng quát";
  const basePrice = appointment.appointment_services?.[0]
    ? `${Number(appointment.appointment_services[0].price_at_booking).toLocaleString("vi-VN")} VNĐ`
    : "Chờ xác định";

  // Calculate points gained (e.g. 1 point for every 10,000 VND)
  const basePriceNum = appointment.appointment_services?.[0]
    ? Number(appointment.appointment_services[0].price_at_booking)
    : 0;
  const loyaltyGain = `${Math.round(basePriceNum / 10000)} Điểm`;

  const isCancellable = ["requested", "confirmed"].includes(appointment.status);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/customer/appointments" style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Quay lại danh sách lịch hẹn
        </Link>
      </div>

      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--app-border)", paddingBottom: 16 }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Chi tiết đặt lịch Salon
            </Typography.Title>
            <Typography.Text type="secondary">Mã đặt lịch: #{appointment.id}</Typography.Text>
          </div>
          <StatusTag status={appointment.status} />
        </div>

        <Descriptions bordered column={1} labelStyle={{ fontWeight: 600, width: 200 }} contentStyle={{ background: "#faf8f5" }}>
          <Descriptions.Item label="Dịch vụ yêu cầu">{serviceName}</Descriptions.Item>
          <Descriptions.Item label="Thợ làm tóc chuyên gia">{appointment.employee_details?.full_name || "Thợ làm tóc chuyên nghiệp"}</Descriptions.Item>
          <Descriptions.Item label="Ngày hẹn">
            {appointment.scheduled_start ? formatAppointmentDate(appointment.scheduled_start) : "TBD"}
          </Descriptions.Item>
          <Descriptions.Item label="Giờ đến">
            {appointment.scheduled_start ? formatShortTime(appointment.scheduled_start) : "TBD"}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng thời gian">{appointment.service_details?.duration || 45} phút</Descriptions.Item>
          <Descriptions.Item label="Giá cơ bản">{basePrice}</Descriptions.Item>
          <Descriptions.Item label="Điểm tích lũy">
            <span style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>
              <TrophyOutlined style={{ marginRight: 6 }} /> {loyaltyGain}
            </span>
          </Descriptions.Item>
          {appointment.cancellation_reason && (
            <Descriptions.Item label="Lý do hủy">
              <span style={{ color: "#ef4444" }}>{appointment.cancellation_reason}</span>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {isCancellable && (
            <Button 
              danger 
              onClick={handleCancelClick} 
              loading={cancelMutation.isPending}
              style={{ borderRadius: 8 }}
            >
              Hủy đặt lịch
            </Button>
          )}
          <Link to="/customer/book">
            <Button type="primary" className="login-button-gold" style={{ borderRadius: 8 }}>
              Đặt thêm dịch vụ khác
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
