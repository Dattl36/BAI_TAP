import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Tabs,
  TimePicker,
  Switch,
  message,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  SettingOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  SaveOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { PageHeader } from "../../components/common/PageHeader";

export const ManagerSettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load config from localStorage or defaults
    const config = localStorage.getItem("salon_system_config");
    if (config) {
      try {
        const parsed = JSON.parse(config);
        form.setFieldsValue({
          ...parsed,
          opening_time: parsed.opening_time ? dayjs(`2026-01-01T${parsed.opening_time}`) : null,
          closing_time: parsed.closing_time ? dayjs(`2026-01-01T${parsed.closing_time}`) : null,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // Set default values
      form.setFieldsValue({
        salon_name: "Luxury Salon & Spa Spa",
        phone: "+84 987 654 321",
        email: "contact@luxurysalon.com",
        address: "123 Premium Way, District 1, HCMC",
        tax_rate: 10,
        opening_time: dayjs("2026-01-01T09:00:00"),
        closing_time: dayjs("2026-01-01T21:00:00"),
        enable_loyalty: true,
        points_ratio: 1, // $1 = 1 point
        commission_rate: 15, // 15% stylist commission
      });
    }
  }, [form]);

  const handleSaveSettings = (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      opening_time: values.opening_time ? values.opening_time.format("HH:mm:ss") : null,
      closing_time: values.closing_time ? values.closing_time.format("HH:mm:ss") : null,
    };

    setTimeout(() => {
      localStorage.setItem("salon_system_config", JSON.stringify(payload));
      setLoading(false);
      message.success("Salon settings saved successfully!");
    }, 1000);
  };

  const tabsItems = [
    {
      key: "general",
      label: (
        <span>
          <ShopOutlined /> General Information
        </span>
      ),
      children: (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>General Business Details</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salon_name" label="Salon Name" rules={[{ required: true }]}>
                <Input placeholder="Luxury Salon & Spa" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Contact Hotline" rules={[{ required: true }]}>
                <Input placeholder="+84 987 654 321" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Contact Email" rules={[{ required: true, type: "email" }]}>
                <Input placeholder="contact@luxurysalon.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tax_rate" label="VAT / Service Tax Rate (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Street Address" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="123 Premium Way, District 1, HCMC" />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "hours",
      label: (
        <span>
          <ClockCircleOutlined /> Operating Hours
        </span>
      ),
      children: (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>Operational Working Hours</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="opening_time" label="Opening Time" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="closing_time" label="Closing Time" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={5}>Holiday / Weekend Operation</Typography.Title>
          <Row gutter={16} align="middle" style={{ marginTop: 16 }}>
            <Col span={18}>
              <Typography.Text strong>Open on National Holidays</Typography.Text>
              <div>Allow bookings on national holidays (custom schedules can still be configured).</div>
            </Col>
            <Col span={6} style={{ textAlign: "right" }}>
              <Form.Item name="open_holidays" valuePropName="checked" style={{ margin: 0 }}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "commissions",
      label: (
        <span>
          <PercentageOutlined /> Commission & Loyalty Rules
        </span>
      ),
      children: (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>Stylist Roster Commissions</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="commission_rate" label="Default Stylist Commission (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: "100%" }} formatter={(value) => `${value}%`} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 20 }}>
            This rate will apply to stylist revenues generated from completed appointments unless overridden inside individual stylist profile settings.
          </div>

          <Divider />
          <Typography.Title level={5}>Loyalty points & Rewards</Typography.Title>
          <Row gutter={16} align="middle" style={{ marginTop: 16, marginBottom: 16 }}>
            <Col span={18}>
              <Typography.Text strong>Enable Loyalty Point Accrual</Typography.Text>
              <div>Allow clients to accumulate reward points on completed bookings.</div>
            </Col>
            <Col span={6} style={{ textAlign: "right" }}>
              <Form.Item name="enable_loyalty" valuePropName="checked" style={{ margin: 0 }}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="points_ratio" label="Point Accrual Ratio ($1 spent equals X points)">
                <InputNumber min={0.1} step={0.5} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure general business specifications, working hours, and billing/loyalty parameters."
      />

      <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
        <Card
          bordered={false}
          style={{ borderRadius: 16 }}
          tabList={tabsItems.map((tab) => ({ key: tab.key, tab: tab.label }))}
          activeTabKey={form.getFieldValue("activeTab") || "general"}
          onTabChange={(key) => form.setFieldsValue({ activeTab: key })}
          extra={
            <Button
              type="primary"
              htmlType="submit"
              className="login-button-gold"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Save Settings
            </Button>
          }
        >
          <Form.Item name="activeTab" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Tabs
            activeKey={form.getFieldValue("activeTab") || "general"}
            renderTabBar={() => <></>} // Hide tab headers, using Card tabList instead
            items={tabsItems}
          />
        </Card>
      </Form>
    </div>
  );
};
