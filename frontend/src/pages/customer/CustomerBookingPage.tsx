import { useState } from "react";
import { Button, Card, Col, DatePicker, Row, Steps, Typography, Space, message, Spin, Avatar } from "antd";
import { ScissorOutlined, CalendarOutlined, SmileOutlined, CheckCircleOutlined, ClockCircleOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import { servicesApi } from "../../api/services.api";
import { employeesApi } from "../../api/employees.api";
import { appointmentsApi } from "../../api/appointments.api";
import { useMe } from "../../hooks/useMe";
import { normalizePaginatedResponse } from "../../utils/apiResponse";
import { queryKeys } from "../../constants/queryKeys";

const getServiceImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("cut") || n.includes("style")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=60";
  }
  if (n.includes("wash") || n.includes("shampoo") || n.includes("treatment")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60";
  }
  if (n.includes("nail") || n.includes("manicure") || n.includes("pedicure")) {
    return "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60";
};

const getStylistImage = (id: number, name: string) => {
  const n = name.toLowerCase();
  if (n.includes("elena") || id === 1) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60";
  }
  if (n.includes("marcus") || id === 2) {
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60";
};

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export const CustomerBookingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    service: "",
    stylist: "",
    date: "",
    time: "",
  });

  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(currentStep - 1);

  // Fetch current customer user
  const { data: currentUser } = useMe();

  // Fetch services dynamically
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: () => servicesApi.list(),
  });

  // Fetch stylists dynamically
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: queryKeys.employees.list(),
    queryFn: () => employeesApi.list(),
  });

  const servicesList = normalizePaginatedResponse(servicesData || []).results;
  const employeesList = normalizePaginatedResponse(employeesData || []).results;

  // Filter stylists (role_type === "staff")
  const stylistsList = employeesList.filter((emp) => emp.role_type === "staff");

  const selectedServiceObj = servicesList.find((s) => String(s.id) === bookingData.service);
  const selectedStylistObj = stylistsList.find((st) => String(st.id) === bookingData.stylist);

  // Mutation for creating the booking
  const bookingMutation = useMutation({
    mutationFn: (payload: any) => appointmentsApi.create(payload),
    onSuccess: () => {
      void message.success("Sanctuary booking request submitted successfully!");
      navigate("/customer/appointments");
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Failed to make reservation. Please try again.";
      void message.error(errMsg);
    },
  });

  const handleConfirm = () => {
    if (!bookingData.service || !bookingData.stylist || !bookingData.date || !bookingData.time) {
      void message.error("Please complete all booking steps.");
      return;
    }

    // Combine date and time
    const startDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
    if (isNaN(startDateTime.getTime())) {
      void message.error("Invalid date or time selected.");
      return;
    }

    // Add service duration to get end time
    const duration = selectedServiceObj ? selectedServiceObj.duration_minutes : 45;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

    const payload = {
      customer: currentUser?.customer_profile_id || 0, // Auto-injected in backend fallback, but good to send
      staff: Number(bookingData.stylist),
      scheduled_start: startDateTime.toISOString(),
      scheduled_end: endDateTime.toISOString(),
      source: "customer" as const,
      services: [
        {
          service: Number(bookingData.service),
          quantity: 1,
        },
      ],
    };

    bookingMutation.mutate(payload);
  };

  const isDataLoading = servicesLoading || employeesLoading;

  if (isDataLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Loading available slots, services and stylists..." />
      </Card>
    );
  }

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Reserve Your Self-Care Session
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Select your service, preferred expert specialist, and schedule details below.
        </Typography.Paragraph>
      </div>

      <Steps 
        current={currentStep} 
        style={{ maxWidth: 800, margin: "0 auto 40px" }}
        items={[
          { title: "Select Service", icon: <ScissorOutlined /> },
          { title: "Choose Stylist", icon: <SmileOutlined /> },
          { title: "Schedule", icon: <CalendarOutlined /> },
          { title: "Confirm", icon: <CheckCircleOutlined /> },
        ]}
      />

      <div style={{ minHeight: 200, maxWidth: 900, margin: "0 auto 40px" }}>
        {/* Step 0: Service Cards Selection */}
        {currentStep === 0 && (
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Typography.Text strong style={{ fontSize: 16, fontFamily: "'Outfit', sans-serif" }}>
              Select a Premium Salon Service
            </Typography.Text>
            <Row gutter={[20, 20]}>
              {servicesList.map((service) => {
                const isSelected = String(service.id) === bookingData.service;
                return (
                  <Col xs={24} md={8} key={service.id}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={service.name}
                          src={getServiceImage(service.name)}
                          style={{ height: 140, objectFit: "cover" }}
                        />
                      }
                      style={{
                        borderRadius: 12,
                        border: isSelected 
                          ? "2px solid var(--color-primary)" 
                          : "1px solid var(--app-border)",
                        boxShadow: isSelected ? "0 4px 15px rgba(188, 163, 116, 0.15)" : "none",
                        transition: "all 0.2s ease"
                      }}
                      onClick={() => setBookingData({ ...bookingData, service: String(service.id) })}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, background: "var(--color-accent)", color: "var(--color-primary-dark)", padding: "2px 6px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase" }}>
                          {service.category || "Hair"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--color-muted)" }}>
                          {service.duration_minutes} mins
                        </span>
                      </div>
                      <Typography.Title level={5} style={{ margin: "4px 0 8px", fontWeight: 600, fontSize: 15 }}>
                        {service.name}
                      </Typography.Title>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", height: 36, overflow: "hidden", marginBottom: 12 }}>
                        {service.description || "Our premium hair care formula tailored for your absolute comfort."}
                      </Typography.Text>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--app-border)", paddingTop: 10 }}>
                        <strong style={{ color: "var(--color-primary-dark)", fontSize: 15 }}>
                          {Number(service.base_price).toLocaleString()} VND
                        </strong>
                        {isSelected && <CheckOutlined style={{ color: "var(--color-primary)", fontWeight: 700 }} />}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Space>
        )}

        {/* Step 1: Stylist Selection */}
        {currentStep === 1 && (
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Typography.Text strong style={{ fontSize: 16, fontFamily: "'Outfit', sans-serif" }}>
              Select Stylist Specialist
            </Typography.Text>
            <Row gutter={[20, 20]}>
              {stylistsList.map((stylist) => {
                const isSelected = String(stylist.id) === bookingData.stylist;
                return (
                  <Col xs={24} sm={12} md={8} key={stylist.id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 12,
                        border: isSelected 
                          ? "2px solid var(--color-primary)" 
                          : "1px solid var(--app-border)",
                        boxShadow: isSelected ? "0 4px 15px rgba(188, 163, 116, 0.15)" : "none",
                        textAlign: "center",
                        transition: "all 0.2s ease"
                      }}
                      onClick={() => setBookingData({ ...bookingData, stylist: String(stylist.id) })}
                      cover={
                        <Avatar 
                          src={getStylistImage(Number(stylist.id), stylist.full_name)} 
                          size={80} 
                          style={{ marginBottom: 16, border: "2px solid var(--color-accent)", marginTop: 16 }}
                        />
                      }
                    >
                      <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600 }}>
                        {stylist.full_name}
                      </Typography.Title>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 16 }}>
                        {stylist.specialties || "Senior Hair Stylist"}
                      </Typography.Text>
                      <div style={{ display: "flex", justifyContent: "center", borderTop: "1px solid var(--app-border)", paddingTop: 10 }}>
                        <span style={{ fontSize: 12, color: isSelected ? "var(--color-primary-dark)" : "var(--color-muted)", fontWeight: 600 }}>
                          {isSelected ? "Selected Stylist" : "Tap to Select"}
                        </span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Space>
        )}

        {/* Step 2: Date & Time slot grid */}
        {currentStep === 2 && (
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Typography.Text strong style={{ fontSize: 16, fontFamily: "'Outfit', sans-serif" }}>
              Select Date and Arrival Time Slot
            </Typography.Text>
            <Row gutter={[32, 24]}>
              <Col xs={24} md={10}>
                <Card bordered style={{ borderRadius: 12, background: "var(--color-bg)" }}>
                  <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 12 }}>
                    CHOOSE DATE
                  </Typography.Text>
                  <DatePicker 
                    placeholder="Select Session Date"
                    style={{ width: "100%", height: 44, borderRadius: 8 }}
                    onChange={(date, dateStr) => setBookingData({ ...bookingData, date: String(dateStr) })}
                  />
                </Card>
              </Col>
              
              <Col xs={24} md={14}>
                <Typography.Text type="secondary" style={{ display: "block", marginBottom: 12, fontSize: 12 }}>
                  CHOOSE AVAILABLE SLOT
                </Typography.Text>
                {bookingData.date ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = slot === bookingData.time;
                      return (
                        <Button
                          key={slot}
                          type={isSelected ? "primary" : "default"}
                          style={{
                            borderRadius: 6,
                            height: 40,
                            borderColor: isSelected ? "var(--color-primary)" : "var(--app-border)",
                            background: isSelected ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" : "#ffffff",
                            color: isSelected ? "#ffffff" : "var(--color-text)",
                            fontWeight: isSelected ? 600 : 400
                          }}
                          onClick={() => setBookingData({ ...bookingData, time: slot })}
                        >
                          {slot}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <Card bordered={false} style={{ background: "var(--color-bg)", border: "1px dashed var(--app-border)", textAlign: "center", padding: "16px 0", borderRadius: 12 }}>
                    <Typography.Text type="secondary">
                      Please select a Date first to see available stylist slots.
                    </Typography.Text>
                  </Card>
                )}
              </Col>
            </Row>
          </Space>
        )}

        {/* Step 3: Summary & Confirmation */}
        {currentStep === 3 && (
          <Card 
            bordered={false} 
            style={{ 
              background: "var(--color-surface)", 
              border: "1px solid var(--app-border)", 
              borderRadius: 16,
              boxShadow: "0 8px 30px rgba(188, 163, 116, 0.05)"
            }}
          >
            <Typography.Title level={4} style={{ margin: "0 0 24px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, borderBottom: "1px solid var(--app-border)", paddingBottom: 16 }}>
              Review Your Appointment Details
            </Typography.Title>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
                  SELECTED SERVICE
                </Typography.Text>
                {selectedServiceObj && (
                  <div style={{ display: "flex", gap: 16 }}>
                    <img
                      src={getServiceImage(selectedServiceObj.name)}
                      alt={selectedServiceObj.name}
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--app-border)" }}
                    />
                    <div>
                      <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600 }}>
                        {selectedServiceObj.name}
                      </Typography.Title>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Category: {selectedServiceObj.category || "Hair Care"}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Duration: {selectedServiceObj.duration_minutes} Mins
                      </Typography.Text>
                    </div>
                  </div>
                )}
              </Col>
              
              <Col xs={24} md={12} style={{ borderLeft: "1px solid var(--app-border)", paddingLeft: 24 }}>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
                  ASSIGNED SPECIALIST
                </Typography.Text>
                {selectedStylistObj && (
                  <div style={{ display: "flex", gap: 16 }}>
                    <Avatar 
                      src={getStylistImage(Number(selectedStylistObj.id), selectedStylistObj.full_name)}
                      size={64}
                      style={{ border: "1px solid var(--color-accent)" }}
                    />
                    <div>
                      <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600 }}>
                        {selectedStylistObj.full_name}
                      </Typography.Title>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Role: {selectedStylistObj.specialties || "Stylist Specialist"}
                      </Typography.Text>
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            <div 
              style={{ 
                marginTop: 24, 
                background: "var(--color-bg)", 
                padding: "16px 24px", 
                borderRadius: 12, 
                border: "1px solid var(--app-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClockCircleOutlined style={{ color: "var(--color-primary)" }} />
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                    SCHEDULED DATE & TIME
                  </Typography.Text>
                  <strong>{bookingData.date}</strong> at <strong>{bookingData.time}</strong>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                  TOTAL PRICE
                </Typography.Text>
                <strong style={{ fontSize: 20, color: "var(--color-primary-dark)", fontFamily: "'Outfit', sans-serif" }}>
                  {selectedServiceObj ? Number(selectedServiceObj.base_price).toLocaleString() : "0"} VND
                </strong>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        {currentStep > 0 && (
          <Button onClick={prev} style={{ height: 40, width: 100 }} disabled={bookingMutation.isPending}>
            Back
          </Button>
        )}
        {currentStep < 3 ? (
          <Button 
            type="primary" 
            onClick={next} 
            className="login-button-gold"
            disabled={
              (currentStep === 0 && !bookingData.service) ||
              (currentStep === 1 && !bookingData.stylist) ||
              (currentStep === 2 && (!bookingData.date || !bookingData.time))
            }
            style={{ height: 40, width: 100 }}
          >
            Next
          </Button>
        ) : (
          <Button 
            type="primary" 
            onClick={handleConfirm}
            className="login-button-gold"
            style={{ height: 40, width: 160 }}
            loading={bookingMutation.isPending}
          >
            Confirm Reservation
          </Button>
        )}
      </div>
    </Card>
  );
};
