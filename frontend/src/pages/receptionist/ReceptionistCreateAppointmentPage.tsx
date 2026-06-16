import { useState, useEffect } from "react";
import { Button, Card, Form, Input, Select, DatePicker, TimePicker, message, Spin, Alert, Row, Col, Space } from "antd";
import { PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { servicesApi } from "../../api/services.api";
import { employeesApi } from "../../api/employees.api";
import { customersApi } from "../../api/customers.api";
import { authApi } from "../../api/auth.api";
import { appointmentsApi } from "../../api/appointments.api";

import type { SalonService } from "../../types/service";
import type { Employee } from "../../types/employee";
import type { Customer } from "../../types/customer";
import { getListItems } from "../../utils/apiResponse";

export const ReceptionistCreateAppointmentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<SalonService[]>([]);
  const [stylists, setStylists] = useState<Employee[]>([]);
  
  // Customer lookup states
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [phoneSearched, setPhoneSearched] = useState(false);

  useEffect(() => {
    const fetchInitData = async () => {
      setLoading(true);
      try {
        const servicesRes = await servicesApi.list();
        const activeServices = getListItems(servicesRes).filter(
          (s: SalonService) => s.active !== false && s.status === "active"
        );
        setServices(activeServices);

        const employeesRes = await employeesApi.list({ role_type: "staff", employment_status: "active" });
        setStylists(getListItems(employeesRes));
      } catch (err) {
        void message.error("Failed to load salon catalog and stylist lists");
      } finally {
        setLoading(false);
      }
    };
    void fetchInitData();
  }, []);

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value.length >= 9) {
      setSearchingCustomer(true);
      try {
        const res = await customersApi.list();
        const list = getListItems(res);
        const found = list.find((c: Customer) => (c.phone || "").replace(/[\s-+]/g, "").includes(value.replace(/[\s-+]/g, "")));
        
        if (found) {
          setExistingCustomer(found);
          form.setFieldsValue({
            customerName: found.full_name,
            customerEmail: found.email,
          });
          void message.info(`Found existing guest: ${found.full_name}`);
        } else {
          setExistingCustomer(null);
        }
        setPhoneSearched(true);
      } catch (err) {
        // Fallback or ignore
      } finally {
        setSearchingCustomer(false);
      }
    } else {
      setPhoneSearched(false);
      setExistingCustomer(null);
    }
  };

  const handleCreate = async (values: any) => {
    const { customerPhone, customerName, customerEmail, serviceId, stylistId, date, time, note } = values;
    setLoading(true);
    try {
      // 1. Build time range
      const start = dayjs(date)
        .hour(dayjs(time).hour())
        .minute(dayjs(time).minute())
        .second(0)
        .millisecond(0);
      const startStr = start.toISOString();
      
      const selectedService = services.find((s) => s.id === serviceId);
      const duration = selectedService?.duration_minutes || 60;
      const endStr = start.add(duration, "minute").toISOString();

      let targetCustomerId: number | string;

      // 2. Obtain or register Customer Profile
      if (existingCustomer) {
        targetCustomerId = existingCustomer.id;
      } else {
        // Register customer account automatically
        const formattedUsername = customerPhone.replace(/[^0-9]/g, "") || `walkin_${Date.now()}`;
        const newGuestUser = await authApi.register({
          username: formattedUsername,
          password: "SalonPass123!",
          full_name: customerName,
          phone: customerPhone,
          email: customerEmail || `${formattedUsername}@salon.com`,
        });

        // Query customer profile ID
        const customerListRes = await customersApi.list();
        const list = getListItems(customerListRes);
        const matchedCustomer = list.find((c: Customer) => c.phone === customerPhone || c.user === newGuestUser.id);
        
        if (!matchedCustomer) {
          throw new Error("Unable to retrieve registered client details");
        }
        targetCustomerId = matchedCustomer.id;
      }

      // 3. Create appointment queue
      await appointmentsApi.create({
        customer: targetCustomerId,
        staff: stylistId,
        scheduled_start: startStr,
        scheduled_end: endStr,
        source: "receptionist",
        appointment_services: [
          {
            service: serviceId,
            quantity: 1,
          },
        ],
      });

      void message.success("Salon appointment reserved successfully!");
      navigate("/receptionist/today");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "An error occurred while reserving appointment";
      void message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <Spin size="large" tip="Loading Salon Catalog..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <Card 
        bordered={false} 
        title={
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "var(--color-primary-dark)" }}>
            Reserve Premium Appointment
          </div>
        }
        style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} disabled={loading}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Guest Phone Number" 
                name="customerPhone" 
                rules={[
                  { required: true, message: "Please input phone number" },
                  { pattern: /^[0-9+\s-]{9,15}$/, message: "Please enter a valid phone number" }
                ]}
              >
                <Input 
                  placeholder="Enter guest phone (e.g. 0912345678)" 
                  prefix={<PhoneOutlined style={{ color: "var(--color-muted)" }} />}
                  onChange={handlePhoneChange}
                  style={{ height: 42, borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {phoneSearched && (
            <div style={{ marginBottom: 20 }}>
              {existingCustomer ? (
                <Alert 
                  message="Recognized Guest Profile" 
                  description={`Found matched client: ${existingCustomer.full_name} (${existingCustomer.code})`}
                  type="success" 
                  showIcon 
                />
              ) : (
                <Alert 
                  message="New Client Registration" 
                  description="No records matched. System will automatically register a new client profile."
                  type="warning" 
                  showIcon 
                />
              )}
            </div>
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Guest Name" 
                name="customerName" 
                rules={[{ required: true, message: "Please input guest name" }]}
              >
                <Input 
                  placeholder="Enter guest full name" 
                  prefix={<UserOutlined style={{ color: "var(--color-muted)" }} />}
                  style={{ height: 42, borderRadius: 8 }}
                  disabled={!!existingCustomer}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                label="Guest Email (Optional)" 
                name="customerEmail"
              >
                <Input 
                  placeholder="email@example.com" 
                  prefix={<MailOutlined style={{ color: "var(--color-muted)" }} />}
                  style={{ height: 42, borderRadius: 8 }}
                  disabled={!!existingCustomer}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Service Requested" name="serviceId" rules={[{ required: true, message: "Please select a service" }]}>
                <Select 
                  placeholder="Select a premium service"
                  options={services.map((s) => ({
                    value: s.id,
                    label: `${s.name} - $${Number(s.base_price).toFixed(2)} (${s.duration_minutes}m)`
                  }))}
                  style={{ height: 42 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Assigned Stylist / Expert" name="stylistId" rules={[{ required: true, message: "Please select a therapist" }]}>
                <Select 
                  placeholder="Choose available expert"
                  options={stylists.map((e) => ({
                    value: e.id,
                    label: `${e.full_name} (${e.specialties || "Specialist"})`
                  }))}
                  style={{ height: 42 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Session Date" name="date" rules={[{ required: true, message: "Please select a date" }]}>
                <DatePicker 
                  style={{ width: "100%", height: 42, borderRadius: 8 }} 
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                  prefix={<CalendarOutlined />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Arrival Time" name="time" rules={[{ required: true, message: "Please select an arrival time" }]}>
                <TimePicker 
                  format="HH:mm" 
                  style={{ width: "100%", height: 42, borderRadius: 8 }}
                  prefix={<ClockCircleOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Appointment Notes" name="note">
            <Input.TextArea placeholder="Any styling preferences or special requests..." rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            className="login-button-gold" 
            style={{ height: 46, marginTop: 12 }}
            loading={loading}
          >
            {existingCustomer ? "Reserve Appointment Queue" : "Register Guest & Reserve Queue"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};
