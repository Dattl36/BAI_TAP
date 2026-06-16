import { useState } from "react";
import { Card, Form, Input, Button, Typography, App, Select, Spin, Alert, Row, Col } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appointmentsApi } from "../../api/appointments.api";
import { complaintsApi } from "../../api/complaints.api";
import { useMe } from "../../hooks/useMe";
import { normalizePaginatedResponse } from "../../utils/apiResponse";

export const CustomerComplaintsPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Fetch logged in customer info
  const { data: currentUser, isLoading: meLoading } = useMe();

  // Load customer appointments to choose which to file a concern about
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => appointmentsApi.list({ ordering: "-scheduled_start" }),
  });

  const appointmentsList = normalizePaginatedResponse(appointmentsData || []).results;

  const appointmentOptions = [
    { value: "none", label: "General Concern (Not tied to a specific session)" },
    ...appointmentsList.map((app) => ({
      value: String(app.id),
      label: `#${app.id} - ${app.service_details?.name || "Beauty Session"} with ${app.employee_details?.full_name || "Specialist"} on ${app.scheduled_start ? new Date(app.scheduled_start).toLocaleDateString() : ""}`
    }))
  ];

  const categories = [
    { value: "billing", label: "Billing & Payment Disputes" },
    { value: "service", label: "Treatment Execution Unsatisfactory" },
    { value: "stylist", label: "Specialist Staff Behavior" },
    { value: "booking", label: "Appointment Cancellations or Reschedules" },
    { value: "other", label: "Other Issue" }
  ];

  const severities = [
    { value: "low", label: "Low (Minor discomfort, feedback)" },
    { value: "normal", label: "Normal (Standard operational dispute)" },
    { value: "high", label: "High (Severe dispute, billing failure)" }
  ];

  const complaintMutation = useMutation({
    mutationFn: (payload: any) => {
      console.log("Submitting complaint payload to backend:", payload);
      return complaintsApi.create(payload);
    },
    onSuccess: () => {
      void message.success("Your concern has been filed. A salon manager will contact you within 24 hours.");
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ["appointments", "list"] });
      navigate("/customer");
    },
    onError: (err: any) => {
      console.error("Complaint submission error detail:", err.response?.data || err);
      let errMsg = "Failed to file concern registry.";
      if (err.response?.data) {
        const errData = err.response.data;
        if (typeof errData === "object") {
          errMsg = Object.entries(errData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : JSON.stringify(val)}`)
            .join(" | ");
        } else {
          errMsg = String(errData);
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      void message.error(errMsg);
    }
  });

  const handleComplaint = (values: any) => {
    const customerId = currentUser?.customer_profile_id;
    if (!customerId) {
      void message.error("Could not determine your customer profile. Please log in again.");
      return;
    }

    const selectedCategoryLabel = categories.find(c => c.value === values.category)?.label || "General Issue";
    
    const payload: any = {
      customer: customerId,
      title: `${selectedCategoryLabel}: ${values.title}`,
      description: values.description,
      severity: values.severity || "normal",
      status: "received"
    };

    if (values.appointmentId && values.appointmentId !== "none") {
      payload.appointment = Number(values.appointmentId);
    }

    complaintMutation.mutate(payload);
  };

  const isDataLoading = appointmentsLoading || meLoading;

  if (isDataLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Loading your history...">
          <div style={{ padding: 50 }} />
        </Spin>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <WarningOutlined style={{ fontSize: 36, color: "#ff4d4f", marginBottom: 16 }} />
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
            Submit a Concern
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            Encountered booking disputes, payment discrepancies, or service issues? We are here to help.
          </Typography.Paragraph>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleComplaint} 
          initialValues={{ appointmentId: "none", severity: "normal" }}
          disabled={complaintMutation.isPending}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Concern Category" name="category" rules={[{ required: true, message: "Please select category" }]}>
                <Select 
                  placeholder="Select topic"
                  options={categories}
                  style={{ height: 42 }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item label="Severity Priority" name="severity" rules={[{ required: true }]}>
                <Select 
                  options={severities}
                  style={{ height: 42 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Subject / Brief Summary" name="title" rules={[{ required: true, message: "Please provide a brief title" }]}>
            <Input placeholder="e.g. Charge error, stylist late" style={{ borderRadius: 8, height: 42 }} />
          </Form.Item>

          <Form.Item label="Associated Appointment (Optional)" name="appointmentId">
            <Select 
              placeholder="Select which appointment is this about"
              options={appointmentOptions}
              style={{ height: 42 }}
            />
          </Form.Item>

          <Form.Item label="Detailed Explanation" name="description" rules={[{ required: true, message: "Please provide incident details" }]}>
            <Input.TextArea 
              rows={4} 
              placeholder="Kindly provide dates, names, or values to help us audit and resolve your dispute quickly..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Button 
            type="primary" 
            danger 
            htmlType="submit" 
            block 
            className="rcpt-btn-gold"
            style={{ height: 44, marginTop: 12, borderRadius: 8, background: "#ff4d4f", borderColor: "#ff4d4f" }}
            loading={complaintMutation.isPending}
          >
            File Concern Registry
          </Button>
        </Form>
      </Card>
    </div>
  );
};
