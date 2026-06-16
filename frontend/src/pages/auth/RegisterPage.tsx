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
      void messageApi.success("Account created. You can login now.");
      navigate(ROUTES.login);
    },
    onError: (error) => {
      void messageApi.error(getErrorMessage(error));
    },
  });

  return (
    <Card className="auth-card">
      {contextHolder}
      <Typography.Title level={3}>Create customer account</Typography.Title>
      <Form<RegisterPayload> layout="vertical" onFinish={(values) => mutation.mutate(values)}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input autoComplete="username" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input type="email" autoComplete="email" />
        </Form.Item>
        <Form.Item 
          name="password" 
          label="Password" 
          rules={[
            { required: true, message: "Please input your password." },
            { min: 8, message: "Password must be at least 8 characters." }
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button block type="primary" htmlType="submit" loading={mutation.isPending}>
          Register
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        Already have an account? <Link to={ROUTES.login}>Login</Link>
      </Typography.Paragraph>
    </Card>
  );
};
