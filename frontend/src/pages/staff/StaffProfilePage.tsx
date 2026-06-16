import React, { useEffect } from "react";
import { Card, Form, Input, Button, message, Row, Col, Avatar, Space, Typography, Tag, Divider } from "antd";
import { UserOutlined, PhoneOutlined, SafetyCertificateOutlined, MailOutlined, EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { stylistApi } from "../../api/stylist.api";
import { queryKeys } from "../../constants/queryKeys";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";

export const StaffProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // 1. Fetch current Stylist profile
  const profileQuery = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: () => stylistApi.getMyProfile(),
  });

  const stylist = profileQuery.data;

  // Set form initial values once data is loaded
  useEffect(() => {
    if (stylist) {
      form.setFieldsValue({
        full_name: stylist.full_name,
        phone: stylist.phone || "",
        specialties: stylist.specialties || "",
      });
    }
  }, [stylist, form]);

  // 2. Profile update mutation
  const updateMutation = useMutation({
    mutationFn: (payload: any) => stylistApi.updateMyProfile(stylist!.id, payload),
    onSuccess: () => {
      void message.success("Đã cập nhật hồ sơ cá nhân thành công!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
    onError: (err) => {
      void message.error(`Lỗi cập nhật hồ sơ: ${getErrorMessage(err)}`);
    }
  });

  const handleSave = (values: any) => {
    updateMutation.mutate(values);
  };

  if (profileQuery.isLoading) {
    return <LoadingSkeleton type="profile" />;
  }

  if (profileQuery.isError) {
    return <ErrorMessage error={profileQuery.error} onRetry={() => void profileQuery.refetch()} />;
  }

  const initials = stylist?.full_name ? stylist.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "ST";

  return (
    <div className="animate-fade-in" style={{ maxWidth: 850, margin: "0 auto" }}>
      <Row gutter={[24, 24]}>
        {/* Left Column - Stylist Card Summary */}
        <Col xs={24} md={8}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 16, 
              textAlign: "center", 
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--app-border)"
            }}
          >
            <Avatar 
              size={96} 
              style={{ 
                backgroundColor: "var(--color-primary)", 
                color: "#ffffff", 
                fontSize: 32, 
                fontWeight: 600,
                boxShadow: "0 4px 10px rgba(188, 163, 116, 0.2)"
              }}
            >
              {initials}
            </Avatar>
            
            <Typography.Title level={4} style={{ margin: "16px 0 4px", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              {stylist?.full_name}
            </Typography.Title>
            
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
              Mã số: <strong>{stylist?.employee_code}</strong>
            </Typography.Paragraph>

            <Space wrap style={{ justifyContent: "center", marginBottom: 12 }}>
              <Tag color="gold" style={{ textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
                {stylist?.role_type === "staff" ? "Stylist chính" : stylist?.role_type}
              </Tag>
              <Tag color="green" style={{ textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
                {stylist?.employment_status === "active" ? "Đang làm việc" : stylist?.employment_status}
              </Tag>
            </Space>

            <Divider style={{ margin: "12px 0" }} />

            <div style={{ textAlign: "left", fontSize: 13, color: "var(--color-muted)" }}>
              <Space direction="vertical" size={8}>
                <span>
                  <PhoneOutlined style={{ marginRight: 6 }} /> {stylist?.phone || "Chưa cập nhật SĐT"}
                </span>
                <span>
                  <SafetyCertificateOutlined style={{ marginRight: 6 }} /> Phục vụ khách hàng cao cấp
                </span>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Right Column - Profile Form Editor */}
        <Col xs={24} md={16}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 16, 
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--app-border)" 
            }}
            title={
              <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Thiết lập Hồ sơ Stylist
              </Typography.Title>
            }
          >
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSave}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item 
                    label="Tên hiển thị công khai (Khách đặt lịch nhìn thấy)" 
                    name="full_name" 
                    rules={[{ required: true, message: "Vui lòng nhập họ tên hiển thị" }]}
                  >
                    <Input prefix={<UserOutlined />} style={{ height: 42, borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item 
                    label="Số điện thoại liên lạc" 
                    name="phone" 
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                  >
                    <Input prefix={<PhoneOutlined />} style={{ height: 42, borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                label="Chuyên môn & Tiểu sử (Mô tả kinh nghiệm và phong cách tạo mẫu)" 
                name="specialties"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Ví dụ: Chuyên gia thiết kế tóc nam nữ, cắt tỉa layer hiện đại. Trên 5 năm kinh nghiệm trong các salon cao cấp..." 
                  style={{ borderRadius: 8 }} 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  className="btn-gold-premium" 
                  loading={updateMutation.isPending}
                  style={{ height: 44, marginTop: 12 }}
                >
                  Lưu thiết lập hồ sơ
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
