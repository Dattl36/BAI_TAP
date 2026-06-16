import { Card, Space, Timeline, Typography, Button } from "antd";
import { Link } from "react-router-dom";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import { appointmentsApi } from "../../api/appointments.api";
import { StatusTag } from "../../components/common/StatusTag";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { normalizePaginatedResponse } from "../../utils/apiResponse";

const getServiceImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("cut") || n.includes("style")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=60";
  }
  if (n.includes("wash") || n.includes("shampoo") || n.includes("treatment")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=60";
  }
  if (n.includes("nail") || n.includes("manicure") || n.includes("pedicure")) {
    return "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&auto=format&fit=crop&q=60";
};

export const CustomerAppointmentsPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => appointmentsApi.list({ ordering: "-scheduled_start" }),
  });

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const appointmentsList = normalizePaginatedResponse(data || []).results;

  const formatShortDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatShortTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Lịch sử cuộc hẹn của bạn
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Theo dõi các lịch hẹn đã đặt, trải nghiệm dịch vụ trước đó và quản lý đặt lịch.
        </Typography.Paragraph>
      </div>

      {appointmentsList.length > 0 ? (
        <Timeline mode="left" style={{ marginTop: 24 }}>
          {appointmentsList.map((app) => {
            const serviceName = app.service_details?.name || "Phục hồi tóc tổng quát";
            return (
              <Timeline.Item 
                key={app.id} 
                dot={<CalendarOutlined style={{ fontSize: 16, color: "var(--color-primary)" }} />}
                label={
                  <strong style={{ color: "var(--color-primary-dark)", fontSize: 13 }}>
                    {app.scheduled_start ? formatShortDate(app.scheduled_start) : "TBD"}
                  </strong>
                }
              >
                <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <img
                        src={getServiceImage(serviceName)}
                        alt={serviceName}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid var(--app-border)" }}
                      />
                      <Space direction="vertical" size={2}>
                        <Typography.Text type="secondary" style={{ fontSize: 10, letterSpacing: "0.05em" }}>
                          MÃ ĐẶT LỊCH #{app.id}
                        </Typography.Text>
                        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                          {serviceName}
                        </Typography.Title>
                        <Typography.Text style={{ color: "var(--color-muted)", fontSize: 12 }}>
                          Stylist phụ trách: <strong>{app.employee_details?.full_name || "Stylist được phân công"}</strong> vào lúc {app.scheduled_start ? formatShortTime(app.scheduled_start) : "TBD"}
                        </Typography.Text>
                      </Space>
                    </div>

                    <Space direction="vertical" align="end" size={8}>
                      <StatusTag status={app.status} />
                      <Link to={`/customer/appointments/${app.id}`}>
                        <Button type="default" size="small" icon={<EyeOutlined />} style={{ borderRadius: 6 }}>
                          Xem chi tiết
                        </Button>
                      </Link>
                    </Space>
                  </div>
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Card bordered={false} style={{ textAlign: "center", padding: "60px 0", borderRadius: 16, border: "1px dashed var(--color-primary)" }}>
          <CalendarOutlined style={{ fontSize: 48, color: "var(--color-primary)", marginBottom: 16, opacity: 0.7 }} />
          <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, margin: "0 0 8px" }}>
            Không tìm thấy lịch hẹn nào
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
            Bạn chưa đặt lịch hẹn nào. Hãy nuông chiều bản thân với dịch vụ chăm sóc cao cấp của chúng tôi!
          </Typography.Paragraph>
          <Link to="/customer/book">
            <Button type="primary" size="large" className="login-button-gold" icon={<EyeOutlined style={{ transform: "rotate(-45deg)" }} />}>
              Đặt lịch ngay
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
