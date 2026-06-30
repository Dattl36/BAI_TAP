import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, Typography, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { authApi } from "../../api/auth.api";
import { ROUTES } from "../../constants/routes";
import type { RegisterPayload } from "../../types/auth";
import { getErrorMessage } from "../../utils/error";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_, variables) => {
      void messageApi.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      void messageApi.success("Xác minh tài khoản thành công!");
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      setIsOtpModalVisible(false);
      setTimeout(() => {
        navigate("/customer");
      }, 1000);
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: () => {
      void messageApi.success("Đã gửi lại mã OTP vào email của bạn.");
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length < 6) {
      void messageApi.error("Vui lòng nhập đủ 6 số mã OTP");
      return;
    }
    verifyOtpMutation.mutate({ email: registeredEmail, otp: otpCode });
  };

  const handleResendOtp = () => {
    if (!registeredEmail) return;
    resendOtpMutation.mutate({ email: registeredEmail });
  };

  return (
    <div className="login-split-container">
      {contextHolder}

      {/* Left Column: Branding Image Panel */}
      <div
        className="login-brand-panel"
        style={{
          backgroundImage: "linear-gradient(rgba(20, 20, 18, 0.65), rgba(20, 20, 18, 0.8)), url('/images/barber_register_banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="login-brand-logo">S A L O N</div>
        <div className="login-brand-footer">
          <h1 className="login-brand-slogan">Định hình phong cách, làm chủ diện mạo.</h1>
          <p className="login-brand-subtext">
            Tham gia trải nghiệm dịch vụ salon cao cấp, đặt lịch chuyên gia hàng đầu và quản lý lịch trình của bạn dễ dàng.
          </p>
          <div style={{ width: 40, height: 3, background: "var(--color-primary)", marginTop: 24, borderRadius: 2 }} />
        </div>
      </div>

      {/* Right Column: Registration Form Panel */}
      <div className="login-form-panel">
        <Card className="login-form-card" bordered={false}>
          {/* Logo element above form */}
          <div style={{ fontSize: 16, letterSpacing: "0.15em", fontWeight: 600, color: "var(--color-primary)", marginBottom: 12 }}>
            S A L O N
          </div>

          <div style={{ marginBottom: 28 }}>
            <Typography.Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
              Tạo tài khoản khách hàng
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 6, fontSize: 14 }}>
              Tham gia hệ thống của chúng tôi để quản lý các lịch hẹn dễ dàng hơn.
            </Typography.Paragraph>
          </div>

          <Form<RegisterPayload>
            layout="vertical"
            onFinish={(values) => registerMutation.mutate(values)}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Tên đăng nhập</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập." }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="Chọn tên đăng nhập"
                autoComplete="username"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Địa chỉ Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn." },
                { type: "email", message: "Vui lòng nhập địa chỉ email hợp lệ." }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="emailcuaban@example.com"
                autoComplete="email"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Mật khẩu</span>}
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu." },
                { min: 8, message: "Mật khẩu phải chứa ít nhất 8 ký tự." }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="Tạo mật khẩu mạnh"
                autoComplete="new-password"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Button
              block
              type="primary"
              htmlType="submit"
              loading={registerMutation.isPending}
              className="login-button-gold"
              style={{ marginTop: 12, height: 44, borderRadius: 14 }}
            >
              Đăng ký tài khoản
            </Button>
          </Form>

          <Typography.Paragraph style={{ marginTop: 24, marginBottom: 0, textAlign: "center", fontSize: 13 }}>
            Đã có tài khoản?{" "}
            <Link to={ROUTES.login} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Đăng nhập
            </Link>
          </Typography.Paragraph>
        </Card>
      </div>

      <Modal
        title={<div style={{ textAlign: "center", fontSize: 20 }}>Xác minh địa chỉ Email</div>}
        open={isOtpModalVisible}
        onOk={handleVerifyOtp}
        onCancel={() => setIsOtpModalVisible(false)}
        okText="Xác nhận mã OTP"
        cancelText="Để sau"
        confirmLoading={verifyOtpMutation.isPending}
        centered
        maskClosable={false}
        okButtonProps={{ className: "login-button-gold", style: { height: 40, borderRadius: 8 } }}
      >
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
            Chúng tôi đã gửi một mã xác minh gồm 6 chữ số đến email <br/>
            <strong style={{ color: "var(--color-text)" }}>{registeredEmail}</strong>
          </Typography.Paragraph>
          
          <Input.OTP 
            length={6} 
            value={otpCode}
            onChange={(val) => setOtpCode(val)}
            size="large"
            style={{ marginBottom: 24 }}
          />

          <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
            Không nhận được mã?{" "}
            <Button 
              type="link" 
              onClick={handleResendOtp}
              loading={resendOtpMutation.isPending}
              style={{ padding: 0, fontWeight: 600, color: "var(--color-primary-dark)" }}
            >
              Gửi lại OTP
            </Button>
          </Typography.Paragraph>
        </div>
      </Modal>
    </div>
  );
};
