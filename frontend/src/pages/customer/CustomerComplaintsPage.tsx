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

  const formatShortDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const appointmentOptions = [
    { value: "none", label: "Khiếu nại chung (Không gắn với lịch hẹn cụ thể)" },
    ...appointmentsList
      .filter((app) => ["completed", "invoiced", "closed"].includes(app.status))
      .map((app) => ({
        value: String(app.id),
        label: `#${app.id} - ${app.service_details?.name || "Lượt dịch vụ"} với ${app.employee_details?.full_name || "Chuyên gia"} vào ngày ${app.scheduled_start ? formatShortDate(app.scheduled_start) : ""} (Đã hoàn thành)`
      }))
  ];

  const categories = [
    { value: "billing", label: "Tranh chấp hóa đơn & Thanh toán" },
    { value: "service", label: "Chất lượng dịch vụ không đạt yêu cầu" },
    { value: "stylist", label: "Thái độ của nhân viên/thợ làm tóc" },
    { value: "booking", label: "Vấn đề hủy hoặc đổi lịch hẹn" },
    { value: "other", label: "Vấn đề khác" }
  ];

  const severities = [
    { value: "low", label: "Thấp (Góp ý, bất tiện nhỏ)" },
    { value: "normal", label: "Bình thường (Tranh chấp vận hành cơ bản)" },
    { value: "high", label: "Cao (Sai sót nghiêm trọng, lỗi thanh toán)" }
  ];

  const complaintMutation = useMutation({
    mutationFn: (payload: any) => {
      console.log("Submitting complaint payload to backend:", payload);
      return complaintsApi.create(payload);
    },
    onSuccess: () => {
      void message.success("Khiếu nại của bạn đã được ghi nhận. Quản lý salon sẽ liên hệ với bạn trong vòng 24 giờ.");
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ["appointments", "list"] });
      navigate("/customer");
    },
    onError: (err: any) => {
      console.error("Complaint submission error detail:", err.response?.data || err);
      let errMsg = "Gửi khiếu nại thất bại.";
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
      void message.error("Không xác định được hồ sơ khách hàng. Vui lòng đăng nhập lại.");
      return;
    }

    const selectedCategoryLabel = categories.find(c => c.value === values.category)?.label || "Vấn đề chung";
    
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
        <Spin size="large" tip="Đang tải lịch sử lịch hẹn...">
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
            Gửi khiếu nại / Phản hồi
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            Gặp sự cố về đặt lịch, sai lệch thanh toán hoặc chất lượng dịch vụ? Chúng tôi luôn sẵn sàng hỗ trợ.
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
              <Form.Item label="Danh mục khiếu nại" name="category" rules={[{ required: true, message: "Vui lòng chọn danh mục khiếu nại" }]}>
                <Select 
                  placeholder="Chọn chủ đề"
                  options={categories}
                  style={{ height: 42 }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item label="Mức độ nghiêm trọng" name="severity" rules={[{ required: true }]}>
                <Select 
                  options={severities}
                  style={{ height: 42 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Tiêu đề / Tóm tắt ngắn" name="title" rules={[{ required: true, message: "Vui lòng cung cấp tiêu đề ngắn" }]}>
            <Input placeholder="Ví dụ: Lỗi thanh toán hóa đơn, stylist đến trễ..." style={{ borderRadius: 8, height: 42 }} />
          </Form.Item>

          <Form.Item label="Lịch hẹn liên quan (Không bắt buộc)" name="appointmentId">
            <Select 
              placeholder="Chọn lịch hẹn xảy ra sự cố"
              options={appointmentOptions}
              style={{ height: 42 }}
            />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description" rules={[{ required: true, message: "Vui lòng cung cấp chi tiết sự việc" }]}>
            <Input.TextArea 
              rows={4} 
              placeholder="Vui lòng cung cấp ngày, tên nhân viên hoặc các thông tin liên quan để giúp chúng tôi kiểm tra và giải quyết nhanh chóng..."
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
            Gửi đơn khiếu nại
          </Button>
        </Form>
      </Card>
    </div>
  );
};
