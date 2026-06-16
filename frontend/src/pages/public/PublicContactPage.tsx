import { Typography, Row, Col, Card, Form, Input, Button, message, Space } from "antd";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";

export const PublicContactPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Inquiry submitted:", values);
    void message.success("Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.");
    form.resetFields();
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", animation: "fadeIn 0.5s ease", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <Typography.Title level={1} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0 }}>
          Liên Hệ
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 15 }}>
          Gửi thắc mắc hoặc ghé thăm chúng tôi trực tiếp để được tư vấn tận tình.
        </Typography.Paragraph>
      </div>

      <Row gutter={[40, 40]}>
        {/* Left column: Contact Info & Map */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size={24} style={{ width: "100%", marginBottom: 32 }}>
            <Card style={{ borderRadius: 12 }} bordered>
              <Space align="start" size={16}>
                <EnvironmentOutlined style={{ fontSize: 20, color: "var(--color-primary)", marginTop: 4 }} />
                <div>
                  <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600 }}>Địa Chỉ</Typography.Title>
                  <Typography.Text type="secondary">123 Đường Sắc Đẹp, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</Typography.Text>
                </div>
              </Space>
            </Card>

            <Card style={{ borderRadius: 12 }} bordered>
              <Space align="start" size={16}>
                <PhoneOutlined style={{ fontSize: 20, color: "var(--color-primary)", marginTop: 4 }} />
                <div>
                  <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600 }}>Điện Thoại</Typography.Title>
                  <Typography.Text type="secondary">(028) 3822 1234 (Hotline đặt lịch nhanh)</Typography.Text>
                </div>
              </Space>
            </Card>

            <Card style={{ borderRadius: 12 }} bordered>
              <Space align="start" size={16}>
                <MailOutlined style={{ fontSize: 20, color: "var(--color-primary)", marginTop: 4 }} />
                <div>
                  <Typography.Title level={5} style={{ margin: "0 0 4px", fontWeight: 600 }}>Email</Typography.Title>
                  <Typography.Text type="secondary">contact@salonbeauty.com</Typography.Text>
                </div>
              </Space>
            </Card>
          </Space>

          {/* Map placeholder */}
          <div 
            style={{ 
              width: "100%", 
              height: 280, 
              background: "#eae6df", 
              borderRadius: 16, 
              display: "flex", 
              flexDirection: "column",
              justifyContent: "center", 
              alignItems: "center",
              border: "1px solid var(--app-border)"
            }}
          >
            <EnvironmentOutlined style={{ fontSize: 32, color: "var(--color-primary)", marginBottom: 8 }} />
            <Typography.Text strong>Bản Đồ Salon</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>123 Đường Sắc Đẹp, Quận 1</Typography.Text>
          </div>
        </Col>

        {/* Right column: Form */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Gửi Lời Nhắn Cho Chúng Tôi
              </Typography.Title>
            }
            style={{ borderRadius: 16 }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="name"
                label={<span style={{ fontWeight: 500 }}>Họ và Tên</span>}
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nhập họ và tên của bạn" style={{ height: 40, borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 500 }}>Số Điện Thoại</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9+() -]*$/, message: "Số điện thoại không hợp lệ" }
                ]}
              >
                <Input placeholder="Nhập số điện thoại liên hệ" style={{ height: 40, borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 500 }}>Email</span>}
                rules={[
                  { type: "email", message: "Email không hợp lệ" },
                  { required: true, message: "Vui lòng nhập email" }
                ]}
              >
                <Input placeholder="Nhập email liên hệ" style={{ height: 40, borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="message"
                label={<span style={{ fontWeight: 500 }}>Lời nhắn / Yêu cầu tư vấn</span>}
                rules={[{ required: true, message: "Vui lòng nhập lời nhắn" }]}
              >
                <Input.TextArea placeholder="Chúng tôi có thể giúp gì cho bạn?" rows={4} style={{ borderRadius: 8 }} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="login-button-gold"
                block
                style={{ height: 42, fontSize: 14, fontWeight: 600, marginTop: 12 }}
              >
                Gửi Thông Tin Liên Hệ
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
