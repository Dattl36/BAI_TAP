import { Button, Card, Form, Input, Typography, message, Spin, Tabs, Table, Tag, Modal, InputNumber } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, WalletOutlined, DollarOutlined } from "@ant-design/icons";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";

import { useMe } from "../../hooks/useMe";
import { authApi } from "../../api/auth.api";
import { customersApi } from "../../api/customers.api";
import { queryKeys } from "../../constants/queryKeys";

export const CustomerProfilePage = () => {
  const { data: user, isLoading } = useMe();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const [isTopupModalVisible, setIsTopupModalVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number | null>(null);

  const customerId = user?.customer_profile?.id;

  const { data: walletTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["customers", "wallet_transactions", customerId],
    queryFn: () => customersApi.walletTransactions(Number(customerId)),
    enabled: Boolean(customerId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => authApi.updateMe(payload),
    onSuccess: () => {
      void message.success("Cập nhật thông tin hồ sơ thành công!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Cập nhật thông tin thất bại.";
      void message.error(errMsg);
    }
  });

  const topupMutation = useMutation({
    mutationFn: (amount: number) => customersApi.topup(Number(customerId), amount),
    onSuccess: () => {
      void message.success("Nạp tiền thành công!");
      setIsTopupModalVisible(false);
      setTopupAmount(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      void queryClient.invalidateQueries({ queryKey: ["customers", "wallet_transactions", customerId] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Nạp tiền thất bại.";
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

  const handleTopup = () => {
    if (!topupAmount || topupAmount <= 0) {
      void message.error("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    topupMutation.mutate(topupAmount);
  };

  if (isLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </Card>
    );
  }

  const profileTab = (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <UserOutlined style={{ fontSize: 40, color: "var(--color-primary)", marginBottom: 12 }} />
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Cài đặt hồ sơ
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Tùy chỉnh thông tin đăng nhập, điện thoại hoặc thông tin tài khoản của bạn.
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
        <Form.Item label="Tên đăng nhập" name="username">
          <Input disabled style={{ height: 42, borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Tên" name="first_name" rules={[{ required: true, message: "Tên là bắt buộc" }]}>
          <Input prefix={<UserOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Họ" name="last_name" rules={[{ required: true, message: "Họ là bắt buộc" }]}>
          <Input prefix={<UserOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Địa chỉ Email" name="email" rules={[{ type: "email", required: true, message: "Vui lòng nhập địa chỉ email hợp lệ" }]}>
          <Input prefix={<MailOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input prefix={<PhoneOutlined style={{ color: "var(--color-muted)" }} />} style={{ height: 42, borderRadius: 8 }} placeholder="Ví dụ: 0912345678" />
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          className="login-button-gold" 
          style={{ height: 44, marginTop: 12 }}
          loading={updateMutation.isPending}
        >
          Lưu thay đổi
        </Button>
      </Form>
    </div>
  );

  const walletBalance = Number(user?.customer_profile?.wallet_balance || 0);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('HH:mm DD/MM/YYYY'),
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (type: string) => {
        let color = 'blue';
        let label = 'Nạp tiền';
        if (type === 'payment') { color = 'red'; label = 'Thanh toán'; }
        if (type === 'refund') { color = 'green'; label = 'Hoàn tiền'; }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string, record: any) => {
        const isNegative = record.transaction_type === 'payment';
        const formatted = Number(amount).toLocaleString('vi-VN') + ' VNĐ';
        return <strong style={{ color: isNegative ? 'red' : 'green' }}>{isNegative ? '-' : '+'}{formatted}</strong>;
      },
    },
    {
      title: 'Chi tiết',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const txData = Array.isArray((walletTransactions as any)?.data) ? (walletTransactions as any).data : [];

  const walletTab = (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <Card 
        style={{ 
          background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)", 
          color: "white", 
          borderRadius: 16,
          marginBottom: 24,
          boxShadow: "0 10px 25px rgba(188, 163, 116, 0.3)"
        }} 
        bordered={false}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Typography.Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, display: "block", marginBottom: 8 }}>
              Số dư hiện tại
            </Typography.Text>
            <Typography.Title level={1} style={{ color: "white", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              {walletBalance.toLocaleString('vi-VN')} <span style={{ fontSize: 20 }}>VNĐ</span>
            </Typography.Title>
          </div>
          <div>
            <Button 
              size="large" 
              icon={<DollarOutlined />} 
              style={{ background: "white", color: "var(--color-primary-dark)", border: "none", fontWeight: 600, borderRadius: 8, height: 48 }}
              onClick={() => setIsTopupModalVisible(true)}
            >
              Nạp Tiền
            </Button>
          </div>
        </div>
      </Card>

      <Typography.Title level={4} style={{ marginBottom: 16 }}>Lịch sử giao dịch</Typography.Title>
      <Table 
        columns={columns} 
        dataSource={txData} 
        rowKey="id" 
        loading={isLoadingTransactions}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Nạp tiền vào Ví Salon"
        open={isTopupModalVisible}
        onOk={handleTopup}
        onCancel={() => { setIsTopupModalVisible(false); setTopupAmount(null); }}
        confirmLoading={topupMutation.isPending}
        okText="Xác nhận nạp"
        cancelText="Hủy"
        okButtonProps={{ className: "login-button-gold" }}
      >
        <div style={{ margin: "20px 0" }}>
          <Typography.Text style={{ display: "block", marginBottom: 8 }}>Nhập số tiền muốn nạp (VNĐ):</Typography.Text>
          <InputNumber 
            style={{ width: "100%", height: 44, fontSize: 18 }} 
            placeholder="Ví dụ: 500000"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            value={topupAmount}
            onChange={(val) => setTopupAmount(val as number)}
            min={10000}
            step={10000}
          />
        </div>
      </Modal>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <Tabs 
          defaultActiveKey="1" 
          items={[
            { key: "1", label: <><UserOutlined /> Hồ sơ cá nhân</>, children: profileTab },
            { key: "2", label: <><WalletOutlined /> Ví Salon & Lịch sử</>, children: walletTab },
          ]} 
        />
      </Card>
    </div>
  );
};
