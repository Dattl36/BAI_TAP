import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { authApi } from "../../api/auth.api";
import { ROUTES } from "../../constants/routes";
import { tokenService } from "../../services/token.service";
import type { LoginCredentials } from "../../types/auth";
import { getErrorMessage } from "../../utils/error";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (tokens) => {
      tokenService.setTokens(tokens.access, tokens.refresh);
      const redirectUrl = searchParams.get("redirect") || ROUTES.dashboard;
      navigate(redirectUrl, { replace: true });
    },

    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  return (
    <div className="login-split-container">
      {contextHolder}
      
      {/* Left Column: Branding and Slogan */}
      <div className="login-brand-panel" style={{
        backgroundImage: "linear-gradient(rgba(20, 20, 18, 0.65), rgba(20, 20, 18, 0.8)), url('/login_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div className="login-brand-logo">S A L O N</div>
        <div className="login-brand-footer">
          <h1 className="login-brand-slogan">Curating beautiful moments, one detail at a time.</h1>
          <p className="login-brand-subtext">
            Access the premium salon operations dashboard to manage bookings, optimize scheduling, and deliver unforgettable client care.
          </p>
          <div style={{ width: 40, height: 3, background: "var(--color-primary)", marginTop: 24, borderRadius: 2 }} />
        </div>
      </div>

      {/* Right Column: Secure Form Panel */}
      <div className="login-form-panel">
        <Card className="login-form-card" bordered={false}>
          <div style={{ marginBottom: 32 }}>
            <Typography.Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
              Salon Management
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 14 }}>
              Premium salon operations dashboard
            </Typography.Paragraph>
          </div>

          <Form<LoginCredentials> layout="vertical" onFinish={(values) => mutation.mutate(values)}>
            <Form.Item 
              name="username" 
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Username</span>}
              required
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />} 
                placeholder="Enter your username"
                autoComplete="username" 
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Password</span>}
              required
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />} 
                placeholder="Enter your password"
                autoComplete="current-password" 
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Button 
              block 
              type="primary" 
              htmlType="submit" 
              loading={mutation.isPending}
              className="login-button-gold"
              style={{ marginTop: 8 }}
            >
              Access Workspace
            </Button>
          </Form>

          <Typography.Paragraph style={{ marginTop: 24, marginBottom: 0, textAlign: "center", fontSize: 13 }}>
            New customer? <Link to={ROUTES.register} style={{ color: "var(--color-primary)", fontWeight: 600 }}>Create an account</Link>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
};
