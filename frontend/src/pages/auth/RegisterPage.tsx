import { IdcardOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, Modal, Typography, message } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../../api/auth.api";
import { ROUTES } from "../../constants/routes";
import type { RegisterPayload } from "../../types/auth";
import { getErrorMessage, getFieldErrors } from "../../utils/error";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterPayload>();
  const [messageApi, contextHolder] = message.useMessage();
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data, variables) => {
      form.resetFields(["password"]);
      void messageApi.success(data.message || "Đăng ký thành công.");
      setRegisteredPhone(variables.phone || "");
      setOtpCode(data.otp_code || "");
      setIsOtpModalVisible(true);
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      const formErrors = Object.entries(fieldErrors).map(([name, errors]) => ({
        name: name as keyof RegisterPayload,
        errors,
      }));
      if (formErrors.length > 0) {
        form.setFields(formErrors);
      }
      void messageApi.error(getErrorMessage(error));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      void messageApi.success("Xác minh tài khoản thành công.");
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      setIsOtpModalVisible(false);
      setTimeout(() => navigate("/customer"), 1000);
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: (data) => {
      void messageApi.success(data.message || "Đã gửi lại mã OTP.");
      if (data.otp_code) {
        setOtpCode(data.otp_code);
      }
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  const handleSubmit = (values: RegisterPayload) => {
    form.setFields([
      { name: "username", errors: [] },
      { name: "email", errors: [] },
      { name: "full_name", errors: [] },
      { name: "phone", errors: [] },
      { name: "password", errors: [] },
    ]);
    registerMutation.mutate({
      ...values,
      username: values.username?.trim(),
      email: values.email?.trim(),
      full_name: values.full_name?.trim(),
      phone: values.phone?.trim(),
    });
  };

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length < 6) {
      void messageApi.error("Vui lòng nhập đủ 6 số mã OTP.");
      return;
    }
    verifyOtpMutation.mutate({ phone: registeredPhone, otp: otpCode });
  };

  const handleResendOtp = () => {
    if (!registeredPhone) return;
    resendOtpMutation.mutate({ phone: registeredPhone });
  };

  return (
    <div className="login-split-container">
      {contextHolder}

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

      <div className="login-form-panel">
        <Card className="login-form-card" bordered={false}>
          <div style={{ fontSize: 16, letterSpacing: "0.15em", fontWeight: 600, color: "var(--color-primary)", marginBottom: 12 }}>
            S A L O N
          </div>

          <div style={{ marginBottom: 24 }}>
            <Typography.Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
              Tạo tài khoản khách hàng
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 6, fontSize: 14 }}>
              Họ tên có thể dùng dấu cách. Tên đăng nhập dùng để đăng nhập và không chứa dấu cách.
            </Typography.Paragraph>
          </div>

          <Form<RegisterPayload> form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              name="full_name"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Họ và tên</span>}
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên." },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự." },
              ]}
            >
              <Input
                prefix={<IdcardOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Tên đăng nhập</span>}
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập." },
                { whitespace: true, message: "Tên đăng nhập không được chỉ gồm khoảng trắng." },
                { pattern: /^\S+$/, message: "Tên đăng nhập không được chứa dấu cách." },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="ten_dang_nhap"
                autoComplete="username"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Địa chỉ email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email của bạn." },
                { type: "email", message: "Vui lòng nhập địa chỉ email hợp lệ." },
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
              name="phone"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Số điện thoại</span>}
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại." },
                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ (10-11 chữ số)." },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="0912345678"
                autoComplete="tel"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Mật khẩu</span>}
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu." },
                { min: 8, message: "Mật khẩu phải chứa ít nhất 8 ký tự." },
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
        title={<div style={{ textAlign: "center", fontSize: 20 }}>Xác minh địa chỉ email</div>}
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
            Chúng tôi đã gửi một mã xác minh gồm 6 chữ số đến số điện thoại <br />
            <strong style={{ color: "var(--color-text)" }}>{registeredPhone}</strong>
          </Typography.Paragraph>

          <Input.OTP length={6} value={otpCode} onChange={(val) => setOtpCode(val)} size="large" style={{ marginBottom: 24 }} />

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
