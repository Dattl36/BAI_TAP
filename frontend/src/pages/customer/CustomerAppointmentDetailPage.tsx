import { Card, Descriptions, Typography, Button, Space, Modal, message, Form, Input } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, TrophyOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { appointmentsApi } from "../../api/appointments.api";
import { invoicesApi } from "../../api/invoices.api";
import { paymentsApi } from "../../api/payments.api";
import { StatusTag } from "../../components/common/StatusTag";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";

export const CustomerAppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleForm] = Form.useForm();
  const todayStr = new Date().toISOString().split("T")[0];

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: number; newDate: string; newTime: string }) => {
      const scheduledStart = new Date(`${newDate}T${newTime}:00`).toISOString();
      const end = new Date(new Date(`${newDate}T${newTime}:00`).getTime() + 60 * 60_000); // Default 60 min
      return appointmentsApi.reschedule(id, { scheduled_start: scheduledStart, scheduled_end: end.toISOString() });
    },
    onSuccess: () => {
      void message.success("Đổi lịch hẹn thành công!");
      setRescheduleOpen(false);
      rescheduleForm.resetFields();
      refetch();
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || err.response?.data?.message || err.message || "Không thể đổi lịch hẹn. Vui lòng thử lại.";
      void message.error(errMsg);
    },
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      return invoicesApi.createFromAppointment(Number(id));
    },
    onSuccess: (invoice) => {
      navigate(`/customer/payment/${invoice.id}`);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || err.response?.data?.message || "Không thể khởi tạo thanh toán.";
      void message.error(errMsg);
    }
  });

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
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || err.response?.data?.message || err.message || "Hủy đặt lịch thất bại.";
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
  const isReschedulable = ["requested", "confirmed"].includes(appointment.status);
  const isPayable = ["requested", "confirmed", "arrived", "in_service", "completed"].includes(appointment.status) && appointment.invoice_status !== "paid";

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
          {isReschedulable && (
            <Button
              onClick={() => setRescheduleOpen(true)}
              style={{ borderRadius: 8, borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              Đổi lịch hẹn
            </Button>
          )}
          {isPayable && (
            <Button 
              type="primary" 
              onClick={() => payMutation.mutate()} 
              loading={payMutation.isPending}
              style={{ borderRadius: 8, background: "#10b981", borderColor: "#10b981" }}
            >
              Thanh toán ngay
            </Button>
          )}
          <Link to="/customer/book">
            <Button type="primary" className="login-button-gold" style={{ borderRadius: 8 }}>
              Đặt thêm dịch vụ khác
            </Button>
          </Link>
        </div>

        {/* Reschedule Modal */}
        <Modal
          open={rescheduleOpen}
          title={
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18 }}>
              Đổi lịch hẹn
            </span>
          }
          onCancel={() => { setRescheduleOpen(false); rescheduleForm.resetFields(); }}
          footer={null}
          centered
          width={480}
          styles={{ body: { paddingTop: 8 } }}
        >
          <Form form={rescheduleForm} layout="vertical" onFinish={(v) => {
            rescheduleMutation.mutate({ id: Number(appointment.id), ...v });
          }}>
            <Form.Item label="Ngày hẹn mới" name="newDate" rules={[{ required: true, message: "Vui lòng chọn ngày hẹn mới" }]}>
              <input
                type="date" min={todayStr}
                style={{
                  width: "100%", height: 40, borderRadius: 8,
                  border: "1px solid #d9d9d9", padding: "4px 12px",
                  fontSize: 14, outline: "none", cursor: "pointer",
                  background: "#fff", color: "#1f2937",
                }}
                onChange={(e) => rescheduleForm.setFieldValue("newDate", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Giờ hẹn mới" name="newTime" rules={[{ required: true, message: "Vui lòng chọn giờ hẹn mới" }]}>
              <input
                type="time"
                style={{
                  width: "100%", height: 40, borderRadius: 8,
                  border: "1px solid #d9d9d9", padding: "4px 12px",
                  fontSize: 14, outline: "none", cursor: "pointer",
                  background: "#fff", color: "#1f2937",
                }}
                onChange={(e) => rescheduleForm.setFieldValue("newTime", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Lý do đổi lịch (không bắt buộc)" name="reason">
              <Input.TextArea rows={3} placeholder="Ví dụ: Tôi muốn đổi sang khung giờ thuận tiện hơn..." style={{ borderRadius: 8 }} />
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <Button onClick={() => { setRescheduleOpen(false); rescheduleForm.resetFields(); }} style={{ borderRadius: 8 }}>
                Hủy bỏ
              </Button>
              <Button type="primary" htmlType="submit" className="login-button-gold" loading={rescheduleMutation.isPending} style={{ borderRadius: 8 }}>
                Xác nhận đổi lịch
              </Button>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};
