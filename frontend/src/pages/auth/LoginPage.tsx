import { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, Typography } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { authApi } from "../../api/auth.api";
import { ROUTES } from "../../constants/routes";
import { tokenService } from "../../services/token.service";
import type { LoginCredentials } from "../../types/auth";
import { getErrorMessage } from "../../utils/error";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginError, setLoginError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      tokenService.setTokens(tokens.access, tokens.refresh);
      try {
        const user = await authApi.getMe();
        const redirectUrl = searchParams.get("redirect");
        if (redirectUrl && redirectUrl !== ROUTES.dashboard) {
          navigate(redirectUrl, { replace: true });
          return;
        }
        
        // Directly route to the role hub
        switch (user.role) {
          case "customer":
            navigate("/customer", { replace: true });
            break;
          case "receptionist":
            navigate("/receptionist", { replace: true });
            break;
          case "staff":
            navigate("/staff", { replace: true });
            break;
          case "manager":
            navigate("/manager", { replace: true });
            break;
          default:
            navigate("/403", { replace: true });
        }
      } catch (err) {
        navigate(ROUTES.dashboard, { replace: true });
      }
    },

    onError: (error) => {
      const rawMsg = getErrorMessage(error);
      if (
        rawMsg.toLowerCase().includes("invalid username") || 
        rawMsg.toLowerCase().includes("password") || 
        rawMsg.toLowerCase().includes("non_field_errors")
      ) {
        setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.");
      } else {
        setLoginError(rawMsg);
      }
    },
  });

  return (
    <div className="login-split-container">
      
      {/* Left Column: Branding and Slogan */}
      <div className="login-brand-panel" style={{
        backgroundImage: "linear-gradient(rgba(20, 20, 18, 0.65), rgba(20, 20, 18, 0.8)), url('/login_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div className="login-brand-logo">S A L O N</div>
        <div className="login-brand-footer">
          <h1 className="login-brand-slogan">Kiến tạo khoảnh khắc đẹp, chăm chút từng chi tiết.</h1>
          <p className="login-brand-subtext">
            Truy cập bảng điều khiển vận hành salon cao cấp để quản lý lịch hẹn, tối ưu hóa lịch trình và đem lại dịch vụ khách hàng đáng nhớ.
          </p>
          <div style={{ width: 40, height: 3, background: "var(--color-primary)", marginTop: 24, borderRadius: 2 }} />
        </div>
      </div>

      {/* Right Column: Secure Form Panel */}
      <div className="login-form-panel">
        <Card className="login-form-card" bordered={false}>
          <div style={{ marginBottom: 32 }}>
            <Typography.Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
              Quản lý Salon
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 14 }}>
              Hệ thống quản trị vận hành salon cao cấp
            </Typography.Paragraph>
          </div>

          <Form<LoginCredentials> 
            layout="vertical" 
            onFinish={(values) => {
              setLoginError(null);
              mutation.mutate(values);
            }}
          >
            {loginError && (
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  backgroundColor: "#FFF5F5",
                  border: "1px solid #FED7D7",
                  borderRadius: 8,
                  color: "#C53030",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 20,
                  animation: "fadeIn 0.3s ease"
                }}
              >
                <span style={{ fontSize: 16, display: "flex", alignItems: "center", userSelect: "none" }}>⚠️</span>
                <span style={{ flex: 1, lineHeight: "1.4" }}>{loginError}</span>
              </div>
            )}

            <Form.Item 
              name="username" 
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Tên đăng nhập</span>}
              required
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />} 
                placeholder="Nhập tên đăng nhập của bạn"
                autoComplete="username" 
                style={{ height: 42, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>Mật khẩu</span>}
              required
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: "var(--color-muted)", marginRight: 4 }} />} 
                placeholder="Nhập mật khẩu của bạn"
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
              Vào không gian làm việc
            </Button>
          </Form>

          <Typography.Paragraph style={{ marginTop: 24, marginBottom: 0, textAlign: "center", fontSize: 13 }}>
            Khách hàng mới? <Link to={ROUTES.register} style={{ color: "var(--color-primary)", fontWeight: 600 }}>Tạo tài khoản</Link>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
};
