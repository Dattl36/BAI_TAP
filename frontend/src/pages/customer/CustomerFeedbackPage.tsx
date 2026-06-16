import { useState } from "react";
import { Button, Card, Form, Input, Rate, Typography, App, Select, Spin, Alert } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { appointmentsApi } from "../../api/appointments.api";
import { feedbackApi } from "../../api/feedback.api";
import { useMe } from "../../hooks/useMe";
import { normalizePaginatedResponse } from "../../utils/apiResponse";

export const CustomerFeedbackPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Load current customer user info
  const { data: currentUser, isLoading: meLoading } = useMe();

  // Load customer appointments to choose which to review
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => appointmentsApi.list({ ordering: "-scheduled_start" }),
  });

  const appointmentsList = normalizePaginatedResponse(appointmentsData || []).results;

  // Filter completed or invoiced appointments for meaningful review
  const eligibleAppointments = appointmentsList.filter(app => 
    ["completed", "invoiced", "closed"].includes(app.status)
  );

  const appointmentOptions = eligibleAppointments.map((app) => ({
    value: String(app.id),
    label: `#${app.id} - ${app.service_details?.name || "Beauty Session"} with ${app.employee_details?.full_name || "Specialist"} on ${app.scheduled_start ? new Date(app.scheduled_start).toLocaleDateString() : ""}`
  }));

  const feedbackMutation = useMutation({
    mutationFn: (payload: any) => {
      console.log("Submitting feedback payload to backend:", payload);
      return feedbackApi.create(payload);
    },
    onSuccess: () => {
      void message.success("Thank you for sharing your experience with us!");
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ["appointments", "list"] });
      navigate("/customer");
    },
    onError: (err: any) => {
      console.error("Feedback submission error detail:", err.response?.data || err);
      let errMsg = "Failed to submit review.";
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

  const handleFeedback = (values: any) => {
    const customerId = currentUser?.customer_profile_id;
    if (!customerId) {
      void message.error("Could not determine your customer profile. Please log in again.");
      return;
    }

    const payload = {
      customer: customerId,
      appointment: Number(values.appointment),
      rating: Number(values.rating),
      message: values.comment,
    };

    feedbackMutation.mutate(payload);
  };

  const isDataLoading = appointmentsLoading || meLoading;

  if (isDataLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Loading your appointment history...">
          <div style={{ padding: 50 }} />
        </Spin>
      </Card>
    );
  }

  const hasNoEligibleAppointments = eligibleAppointments.length === 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <SmileOutlined style={{ fontSize: 36, color: "var(--color-primary)", marginBottom: 16 }} />
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
            Share Your Experience
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            Your reviews help us maintain high-end stylist execution standards.
          </Typography.Paragraph>
        </div>

        {hasNoEligibleAppointments ? (
          <Alert
            message="No Completed Sessions Found"
            description="Reviews must be linked to a completed or paid appointment. You do not have any completed appointments to review at the moment."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : null}

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFeedback} 
          disabled={hasNoEligibleAppointments || feedbackMutation.isPending}
        >
          <Form.Item 
            label="Select Salon Session" 
            name="appointment" 
            rules={[{ required: true, message: "Please select a session to review" }]}
          >
            <Select 
              placeholder="Select the session to review"
              options={appointmentOptions}
              style={{ height: 42 }}
            />
          </Form.Item>

          <Form.Item label="Styling & Therapist Rating" name="rating" rules={[{ required: true, message: "Please give a star rating" }]}>
            <Rate style={{ color: "var(--color-primary)", fontSize: 24 }} />
          </Form.Item>

          <Form.Item label="Your Comments" name="comment" rules={[{ required: true, message: "Please leave a brief review comment" }]}>
            <Input.TextArea 
              rows={4} 
              placeholder="Tell us what you loved about your visit, styling formula, or ambient wellness comfort..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            className="login-button-gold" 
            style={{ height: 44, marginTop: 12 }}
            loading={feedbackMutation.isPending}
            disabled={hasNoEligibleAppointments}
          >
            Submit Review
          </Button>
        </Form>
      </Card>
    </div>
  );
};
