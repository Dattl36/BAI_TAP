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

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => appointmentsApi.cancel(Number(id), reason),
    onSuccess: () => {
      void message.success("Your booking has been cancelled successfully.");
      void refetch();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Failed to cancel reservation.";
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
    return <ErrorState message="Appointment not found." onRetry={refetch} />;
  }

  const handleCancelClick = () => {
    Modal.confirm({
      title: "Are you sure you want to cancel this booking?",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: "This action cannot be undone. You will lose your scheduled time slot.",
      okText: "Yes, Cancel Booking",
      okType: "danger",
      cancelText: "No, Keep Appointment",
      onOk: () => {
        return cancelMutation.mutateAsync("Cancelled by customer via portal");
      },
    });
  };

  const serviceName = appointment.service_details?.name || "Premium Beauty Session";
  const basePrice = appointment.appointment_services?.[0]
    ? `${Number(appointment.appointment_services[0].price_at_booking).toLocaleString()} VND`
    : "Price TBD";

  // Calculate points gained (e.g. 1 point for every 10,000 VND)
  const basePriceNum = appointment.appointment_services?.[0]
    ? Number(appointment.appointment_services[0].price_at_booking)
    : 0;
  const loyaltyGain = `${Math.round(basePriceNum / 10000)} Points`;

  const isCancellable = ["requested", "confirmed"].includes(appointment.status);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/customer/appointments" style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Back to Appointments
        </Link>
      </div>

      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--app-border)", paddingBottom: 16 }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Sanctuary Booking Detail
            </Typography.Title>
            <Typography.Text type="secondary">Booking Code: #{appointment.id}</Typography.Text>
          </div>
          <StatusTag status={appointment.status} />
        </div>

        <Descriptions bordered column={1} labelStyle={{ fontWeight: 600, width: 200 }} contentStyle={{ background: "#faf8f5" }}>
          <Descriptions.Item label="Requested Care">{serviceName}</Descriptions.Item>
          <Descriptions.Item label="Expert Specialist">{appointment.employee_details?.full_name || "Assigned Stylist Specialist"}</Descriptions.Item>
          <Descriptions.Item label="Scheduled Date">
            {appointment.scheduled_start ? new Date(appointment.scheduled_start).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD"}
          </Descriptions.Item>
          <Descriptions.Item label="Scheduled Arrival">
            {appointment.scheduled_start ? new Date(appointment.scheduled_start).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "TBD"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Duration">{appointment.service_details?.duration || 45} Mins</Descriptions.Item>
          <Descriptions.Item label="Base Price">{basePrice}</Descriptions.Item>
          <Descriptions.Item label="Loyalty Accrued">
            <span style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>
              <TrophyOutlined style={{ marginRight: 6 }} /> {loyaltyGain}
            </span>
          </Descriptions.Item>
          {appointment.cancellation_reason && (
            <Descriptions.Item label="Cancellation Reason">
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
              Cancel Booking
            </Button>
          )}
          <Link to="/customer/book">
            <Button type="primary" className="login-button-gold" style={{ borderRadius: 8 }}>
              Book Another Session
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
