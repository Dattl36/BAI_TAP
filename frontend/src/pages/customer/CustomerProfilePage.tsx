import { Button, Card, Form, Input, Typography, message, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { useMe } from "../../hooks/useMe";
import { authApi } from "../../api/auth.api";
import { queryKeys } from "../../constants/queryKeys";

export const CustomerProfilePage = () => {
  const { data: user, isLoading } = useMe();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const updateMutation = useMutation({
    mutationFn: (payload: any) => authApi.updateMe(payload),
    onSuccess: () => {
      void message.success("Sanctuary profile updated successfully!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Failed to update profile settings.";
      void message.error(errMsg);
    }
  });

  const handleUpdate = (values: any) => {
    updateMutation.mutate({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
    });
  };

  if (isLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Loading profile configurations..." />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <UserOutlined style={{ fontSize: 40, color: "var(--color-primary)", marginBottom: 12 }} />
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
            Your Profile Settings
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            Customize your credentials, phone, or billing details.
          </Typography.Paragraph>
        </div>

        <Form 
          form={form} 
          key={user?.id || "loading"}
          layout="vertical" 
          onFinish={handleUpdate}
          initialValues={{
            username: user?.username,
            email: user?.email,
            first_name: user?.first_name,
            last_name: user?.last_name,
            phone: user?.phone,
          }}
        >
          <Form.Item label="Username" name="username">
            <Input disabled style={{ height: 42, borderRadius: 8 }} />
          </Form.Item>

          <Form.Item label="First Name" name="first_name" rules={[{ required: true, message: "First name is required" }]}>
            <Input prefix={<UserOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} />
          </Form.Item>

          <Form.Item label="Last Name" name="last_name" rules={[{ required: true, message: "Last name is required" }]}>
            <Input prefix={<UserOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} />
          </Form.Item>

          <Form.Item label="Email Address" name="email" rules={[{ type: "email", required: true, message: "Please enter a valid email" }]}>
            <Input prefix={<MailOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} />
          </Form.Item>

          <Form.Item label="Phone Number" name="phone">
            <Input prefix={<PhoneOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} placeholder="e.g. 0912345678" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            className="login-button-gold" 
            style={{ height: 44, marginTop: 12 }}
            loading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </Form>
      </Card>
    </div>
  );
};
