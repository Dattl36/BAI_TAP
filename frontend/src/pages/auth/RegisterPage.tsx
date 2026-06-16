import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../../api/auth.api";
import { ROUTES } from "../../constants/routes";
import type { RegisterPayload } from "../../types/auth";
import { getErrorMessage } from "../../utils/error";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      void messageApi.success("Account created successfully. You can login now.");
      setTimeout(() => {
        navigate(ROUTES.login);
      }, 1200);
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

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
          <h1 className="login-brand-slogan">Book your style, own your look.</h1>
          <p className="login-brand-subtext">
            Join our premium salon experience, book elite stylists, and manage your reservation schedule effortlessly.
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
              Create customer account
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 6, fontSize: 14 }}>
              Join our salon system and manage your appointments easily.
            </Typography.Paragraph>
          </div>

          <Form<RegisterPayload>
            layout="vertical"
            onFinish={(values) => mutation.mutate(values)}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Username</span>}
              rules={[{ required: true, message: "Please enter your username." }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="Choose a username"
                autoComplete="username"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Email Address</span>}
              rules={[
                { required: true, message: "Please enter your email." },
                { type: "email", message: "Please enter a valid email address." }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="yourname@example.com"
                autoComplete="email"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Password</span>}
              rules={[
                { required: true, message: "Please input your password." },
                { min: 8, message: "Password must be at least 8 characters." }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />}
                placeholder="Create a strong password"
                autoComplete="new-password"
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Button
              block
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="login-button-gold"
              style={{ marginTop: 12, height: 44, borderRadius: 14 }}
            >
              Register Account
            </Button>
          </Form>

          <Typography.Paragraph style={{ marginTop: 24, marginBottom: 0, textAlign: "center", fontSize: 13 }}>
            Already have an account?{" "}
            <Link to={ROUTES.login} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Login
            </Link>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
};
