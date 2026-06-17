import {
  CalendarOutlined,
  GiftOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  StarOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Typography, Modal, Form, Input, App, Tag } from "antd";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";

import { useCustomerHomeData } from "../../hooks/queries/useCustomerHomeData";
import { useMe } from "../../hooks/useMe";
import { servicesApi } from "../../api/services.api";
import { appointmentsApi } from "../../api/appointments.api";
import { normalizePaginatedResponse } from "../../utils/apiResponse";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";

// ─── Service image helper ─────────────────────────────────────────────────
const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80",
];
const getServiceImage = (name: string, idx: number) => {
  const n = name.toLowerCase();
  if (n.includes("cut") || n.includes("style") || n.includes("cắt")) return SERVICE_IMAGES[0];
  if (n.includes("wash") || n.includes("treatment") || n.includes("dưỡng")) return SERVICE_IMAGES[1];
  if (n.includes("spa") || n.includes("relax") || n.includes("thư giãn")) return SERVICE_IMAGES[2];
  return SERVICE_IMAGES[idx % SERVICE_IMAGES.length];
};

// ─── Date helpers ─────────────────────────────────────────────────────────
const fmtDate = (s: string) => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
};
const fmtTime = (s: string) => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return "TBD";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};
const fmtShortDate = (s: string) => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
};
const fmtDiscount = (type: string, value: number | string) => {
  const v = Number(value);
  return type === "percent" ? `${v % 1 === 0 ? v.toFixed(0) : v}% OFF` : `${v.toLocaleString("vi-VN")}đ OFF`;
};
const fmtExpiry = (s?: string | null) => {
  if (!s) return "Không hết hạn";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "Không hết hạn" : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const mapStatus = (status: string) => {
  const m: Record<string, string> = {
    requested: "Chờ xác nhận", confirmed: "Đã xác nhận",
    arrived: "Đã đến", in_service: "Đang phục vụ",
  };
  return m[status] ?? status;
};

// ─── HERO BACKGROUND ──────────────────────────────────────────────────────
const HERO_BG = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1600&auto=format&fit=crop&q=80";

export const CustomerHomePage = () => {
  const { data: user } = useMe();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isLoading: isHomeLoading,
    isError: isHomeError,
    error: homeError,
    nextAppointment,
    activeVouchers,
    currentPoints,
    loyaltyTier,
    refetch,
  } = useCustomerHomeData();

  // Services query
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "list"],
    queryFn: () => servicesApi.list(),
  });
  const servicesList = normalizePaginatedResponse(servicesData || []).results;

  // Reschedule modal
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleForm] = Form.useForm();
  const todayStr = new Date().toISOString().split("T")[0];

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: number; newDate: string; newTime: string }) => {
      const scheduledStart = new Date(`${newDate}T${newTime}:00`).toISOString();
      const durationMin = nextAppointment?.service_details?.duration || 60;
      const end = new Date(new Date(`${newDate}T${newTime}:00`).getTime() + durationMin * 60_000);
      return appointmentsApi.reschedule(id, { scheduled_start: scheduledStart, scheduled_end: end.toISOString() });
    },
    onSuccess: () => {
      void message.success("Đổi lịch hẹn thành công!");
      setRescheduleOpen(false);
      rescheduleForm.resetFields();
      refetch();
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: () => void message.error("Không thể đổi lịch hẹn. Vui lòng thử lại."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => appointmentsApi.cancel(id, "Khách hàng tự hủy qua cổng thông tin"),
    onSuccess: () => {
      void message.success("Hủy lịch hẹn thành công!");
      refetch();
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: () => void message.error("Không thể hủy lịch hẹn. Vui lòng thử lại."),
  });

  const handleCancelConfirm = () => {
    if (!nextAppointment) return;
    Modal.confirm({
      title: "Bạn có chắc chắn muốn hủy lịch hẹn này không?",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Có, hủy lịch hẹn",
      okType: "danger",
      cancelText: "Không, giữ lại",
      onOk: () => cancelMutation.mutateAsync(Number(nextAppointment.id)),
    });
  };

  // Carousel scroll
  const scrollServices = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (isHomeLoading || servicesLoading) return <PageLoading />;
  if (isHomeError) return <ErrorState message={homeError} onRetry={refetch} />;

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
    : (user?.username || "Quý khách");

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative",
        height: 440,
        overflow: "hidden",
        borderRadius: "0 0 32px 32px",
        marginBottom: 40,
      }}>
        {/* BG Image */}
        <img
          src={HERO_BG}
          alt="Salon"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "brightness(0.52)",
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(10,8,5,0.75) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          height: "100%",
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 40px 48px",
          maxWidth: 760,
        }}>
          <p style={{
            margin: "0 0 10px",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
            color: "#c9a96e", textTransform: "uppercase",
          }}>
            THE ART OF REFINEMENT
          </p>
          <h1 style={{
            margin: "0 0 18px",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400, fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.18,
            color: "#faf7f2",
          }}>
            Chào mừng trở lại,<br />
            <span style={{ color: "#c9a96e" }}>{displayName}</span>
          </h1>
          <p style={{
            margin: "0 0 24px",
            color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7,
          }}>
            Không gian chăm sóc sắc đẹp của bạn đã sẵn sàng. Đặt lịch hoặc khám phá các dịch vụ cao cấp của chúng tôi.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/customer/book">
              <Button
                size="large"
                style={{
                  background: "#c9a96e",
                  borderColor: "#c9a96e",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 10,
                  letterSpacing: "0.04em",
                  height: 46,
                  paddingInline: 28,
                  boxShadow: "0 4px 20px rgba(201,169,110,0.4)",
                }}
              >
                Khám phá dịch vụ
              </Button>
            </Link>
            <Link to="/customer/appointments">
              <Button
                size="large"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  borderColor: "rgba(255,255,255,0.35)",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 10,
                  height: 46,
                  paddingInline: 24,
                  backdropFilter: "blur(8px)",
                }}
              >
                Lịch hẹn của tôi <ArrowRightOutlined style={{ fontSize: 12 }} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          THREE INFO CARDS
      ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 24px", maxWidth: 1200, margin: "0 auto 48px" }}>
        <Row gutter={[20, 20]}>

          {/* Card 1: Upcoming Appointment */}
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                border: "1px solid #ede8df",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                height: "100%",
                minHeight: 180,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#f8f4ee",
                    display: "grid", placeItems: "center",
                    color: "#c9a96e", fontSize: 16,
                  }}>
                    <CalendarOutlined />
                  </div>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Sắp tới
                  </span>
                </div>
                {nextAppointment && (
                  <Tag style={{
                    background: "#fef9ee", border: "1px solid #f0d98a",
                    color: "#92700a", borderRadius: 20, fontWeight: 600, fontSize: 10,
                  }}>
                    {mapStatus(nextAppointment.status)}
                  </Tag>
                )}
              </div>

              {nextAppointment ? (
                <>
                  <Typography.Title level={4} style={{
                    margin: "0 0 6px",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700, fontSize: 17, color: "#1f2937",
                  }}>
                    Lịch hẹn sắp tới
                  </Typography.Title>
                  <Typography.Text style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    {nextAppointment.service_details?.name || "Dịch vụ chăm sóc"}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 14 }}>
                    {nextAppointment.scheduled_start
                      ? `${fmtShortDate(nextAppointment.scheduled_start)} • ${fmtTime(nextAppointment.scheduled_start)}`
                      : "Chưa xác định"}
                    {nextAppointment.employee_details?.full_name && (
                      <span style={{ color: "#c9a96e" }}> · {nextAppointment.employee_details.full_name}</span>
                    )}
                  </Typography.Text>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      onClick={() => setRescheduleOpen(true)}
                      style={{ borderRadius: 8, fontSize: 12, borderColor: "#c9a96e", color: "#c9a96e" }}
                    >
                      Đổi lịch
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={handleCancelConfirm}
                      loading={cancelMutation.isPending}
                      style={{ borderRadius: 8, fontSize: 12 }}
                    >
                      Hủy
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Typography.Title level={4} style={{
                    margin: "0 0 6px",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700, fontSize: 17, color: "#1f2937",
                  }}>
                    Lịch hẹn sắp tới
                  </Typography.Title>
                  <Typography.Text style={{ fontSize: 13, color: "#9ca3af", display: "block", marginBottom: 14 }}>
                    Chưa có lịch hẹn nào
                  </Typography.Text>
                  <Link to="/customer/book">
                    <Button
                      size="small"
                      style={{
                        borderRadius: 8, fontSize: 12,
                        background: "#c9a96e", borderColor: "#c9a96e", color: "#fff",
                      }}
                    >
                      Đặt lịch ngay
                    </Button>
                  </Link>
                </>
              )}
            </Card>
          </Col>

          {/* Card 2: Membership — DARK */}
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: "linear-gradient(145deg, #1a1714 0%, #111009 100%)",
                border: "none",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                height: "100%",
                minHeight: 180,
                position: "relative",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 24 }}
            >
              {/* decorative circle */}
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 120, height: 120, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarOutlined style={{ color: "#c9a96e", fontSize: 18 }} />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Hạng thành viên
                    </span>
                  </div>
                  <span style={{
                    background: "linear-gradient(135deg, #c9a96e, #a0742a)",
                    color: "#fff", fontSize: 9, fontWeight: 800,
                    padding: "3px 10px", borderRadius: 20, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>
                    ELITE TIER
                  </span>
                </div>

                <Typography.Title level={3} style={{
                  margin: "0 0 6px",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400, color: "#faf7f2",
                }}>
                  {loyaltyTier || "Bronze"}
                </Typography.Title>
                <Typography.Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 14 }}>
                  Truy cập dịch vụ cao cấp với quyền lợi độc quyền
                </Typography.Text>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14,
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Điểm tích lũy</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#c9a96e", fontFamily: "'Outfit', sans-serif" }}>
                      {currentPoints} <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>điểm</span>
                    </div>
                  </div>
                  <Link to="/customer/rewards">
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      color: "#c9a96e", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      Trạng thái: Hoạt động <RightOutlined style={{ fontSize: 10 }} />
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </Col>

          {/* Card 3: Voucher Wallet */}
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                border: "1px solid #ede8df",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                height: "100%",
                minHeight: 180,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#f8f4ee",
                    display: "grid", placeItems: "center",
                    color: "#c9a96e", fontSize: 16,
                  }}>
                    <GiftOutlined />
                  </div>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {activeVouchers.length} Mã có sẵn
                  </span>
                </div>
                <Link to="/customer/vouchers" style={{ color: "#c9a96e", fontSize: 12, fontWeight: 600 }}>
                  Xem tất cả <RightOutlined style={{ fontSize: 9 }} />
                </Link>
              </div>

              <Typography.Title level={4} style={{
                margin: "0 0 6px",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700, fontSize: 17, color: "#1f2937",
              }}>
                Ví mã giảm giá
              </Typography.Title>
              <Typography.Text style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 14 }}>
                Quy đổi điểm thưởng để nâng cấp trải nghiệm
              </Typography.Text>

              {activeVouchers.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeVouchers.slice(0, 2).map((v) => (
                    <div key={v.id} style={{
                      background: "linear-gradient(135deg, #fdf6e3, #fef9ee)",
                      border: "1px dashed #c9a96e",
                      borderRadius: 10,
                      padding: "8px 12px",
                      minWidth: 100,
                    }}>
                      <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#7d5a1e", letterSpacing: "0.05em" }}>
                        {v.code}
                      </div>
                      <div style={{ fontSize: 11, color: "#c9a96e", fontWeight: 700, marginTop: 2 }}>
                        {fmtDiscount(v.discount_type, v.discount_value)}
                      </div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                        HSD: {fmtExpiry(v.expires_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  Chưa có mã giảm giá nào.
                </Typography.Text>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* ══════════════════════════════════════════════════════
          RECOMMENDED SERVICES
      ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <p style={{
              margin: "0 0 6px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              color: "#c9a96e", textTransform: "uppercase",
            }}>
              CURATED SELECTION
            </p>
            <Typography.Title level={2} style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400, fontSize: "clamp(22px, 3vw, 34px)",
              color: "#1f2937",
            }}>
              Dịch vụ nổi bật
            </Typography.Title>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => scrollServices("left")}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid #e5e0d8",
                background: "#fff",
                cursor: "pointer",
                display: "grid", placeItems: "center",
                fontSize: 13, color: "#6b7280",
                transition: "all 0.2s",
              }}
            >
              <LeftOutlined />
            </button>
            <button
              onClick={() => scrollServices("right")}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid #e5e0d8",
                background: "#fff",
                cursor: "pointer",
                display: "grid", placeItems: "center",
                fontSize: 13, color: "#6b7280",
                transition: "all 0.2s",
              }}
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: 12,
            scrollbarWidth: "none",
          }}
        >
          {servicesList.length === 0 ? (
            <div style={{ textAlign: "center", width: "100%", padding: "40px 0", color: "#9ca3af" }}>
              Chưa có dịch vụ nào.
            </div>
          ) : (
            servicesList.map((service, idx) => (
              <div
                key={service.id}
                style={{
                  flex: "0 0 280px",
                  scrollSnapAlign: "start",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid #ede8df",
                  background: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                  <img
                    src={getServiceImage(service.name, idx)}
                    alt={service.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 12, left: 12,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
                    padding: "3px 10px", borderRadius: 20,
                    fontSize: 10, fontWeight: 700, color: "#fff",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    {service.category || "Chăm sóc tóc"}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "16px 20px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <Typography.Text style={{ fontSize: 12, color: "#9ca3af" }}>
                      {service.duration_minutes ?? 60} phút
                    </Typography.Text>
                  </div>
                  <Typography.Title level={5} style={{
                    margin: "0 0 6px",
                    fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                    fontSize: 16, color: "#1f2937",
                  }}>
                    {service.name}
                  </Typography.Title>
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ fontSize: 12, marginBottom: 16 }}
                  >
                    {service.description || "Trải nghiệm dịch vụ chăm sóc cao cấp được thiết kế riêng cho bạn."}
                  </Typography.Paragraph>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#1f2937", fontFamily: "'Outfit', sans-serif" }}>
                      {Number(service.base_price).toLocaleString("vi-VN")}đ
                    </span>
                    <Link to="/customer/book">
                      <Button
                        size="small"
                        style={{
                          background: "#c9a96e", borderColor: "#c9a96e", color: "#fff",
                          borderRadius: 8, fontWeight: 600, fontSize: 12, height: 32,
                        }}
                      >
                        Đặt ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{
        background: "#faf7f2",
        borderTop: "1px solid #ede8df",
        padding: "36px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={7}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", color: "#1f2937", marginBottom: 8 }}>
                ELITE SALON
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.8 }}>
                Không gian chăm sóc sắc đẹp cao cấp dành cho phong cách hiện đại.
              </Typography.Text>
            </Col>
            <Col xs={12} md={5}>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 12 }}>
                KẾT NỐI
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Nghề nghiệp", "Liên hệ"].map((l) => (
                  <span key={l} style={{ fontSize: 13, color: "#6b7280", cursor: "pointer" }}>{l}</span>
                ))}
              </div>
            </Col>
            <Col xs={12} md={5}>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 12 }}>
                PHÁP LÝ
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Chính sách bảo mật", "Điều khoản dịch vụ"].map((l) => (
                  <span key={l} style={{ fontSize: 13, color: "#6b7280", cursor: "pointer" }}>{l}</span>
                ))}
              </div>
            </Col>
            <Col xs={24} md={7}>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 12 }}>
                BẢN TIN
              </div>
              <Typography.Text style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 10 }}>
                Đăng ký để nhận ưu đãi độc quyền.
              </Typography.Text>
              <div style={{ display: "flex", gap: 0, border: "1px solid #e5e0d8", borderRadius: 10, overflow: "hidden" }}>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  style={{
                    flex: 1, border: "none", outline: "none",
                    padding: "10px 14px", fontSize: 13,
                    background: "#fff", color: "#1f2937",
                  }}
                />
                <button style={{
                  background: "#c9a96e", border: "none", color: "#fff",
                  padding: "10px 16px", cursor: "pointer", fontSize: 14,
                }}>
                  <ArrowRightOutlined />
                </button>
              </div>
            </Col>
          </Row>
          <div style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid #ede8df",
            textAlign: "center",
            fontSize: 11,
            color: "#9ca3af",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            © {new Date().getFullYear()} ELITE SALON. THE ART OF REFINEMENT.
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════
          RESCHEDULE MODAL (unchanged logic)
      ══════════════════════════════════════════════════════ */}
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
        {nextAppointment && (
          <div style={{
            background: "#fdf6e3", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20,
            border: "1px solid #f0d98a",
          }}>
            <Typography.Text style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
              {nextAppointment.service_details?.name || "Dịch vụ chăm sóc"}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Lịch hiện tại:{" "}
              <strong>
                {nextAppointment.scheduled_start
                  ? `${fmtDate(nextAppointment.scheduled_start)} – ${fmtTime(nextAppointment.scheduled_start)}`
                  : "Chưa xác định"}
              </strong>
            </Typography.Text>
          </div>
        )}

        <Form form={rescheduleForm} layout="vertical" onFinish={(v) => {
          if (!nextAppointment) return;
          rescheduleMutation.mutate({ id: Number(nextAppointment.id), ...v });
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
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={rescheduleMutation.isPending}
              style={{ borderRadius: 8, background: "#c9a96e", borderColor: "#c9a96e" }}
            >
              Xác nhận đổi lịch
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
