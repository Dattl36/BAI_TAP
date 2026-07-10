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
        salon_name: "Salon & Spa Cao cấp",
        phone: "+84 987 654 321",
        email: "lienhe@saloncaocap.vn",
        address: "123 Đường Premium, Quận 1, TP. Hồ Chí Minh",
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
      message.success("Đã lưu cài đặt salon thành công.");
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
          <Typography.Title level={5} style={{ marginBottom: 16 }}>Thông tin doanh nghiệp</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salon_name" label="Tên salon" rules={[{ required: true }]}>
                <Input placeholder="Salon & Spa Cao cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Đường dây liên hệ" rules={[{ required: true }]}>
                <Input placeholder="+84 987 654 321" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email liên hệ" rules={[{ required: true, type: "email" }]}>
                <Input placeholder="lienhe@saloncaocap.vn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tax_rate" label="Thuế VAT / Phí dịch vụ (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ salon" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="123 Đường Premium, Quận 1, TP. Hồ Chí Minh" />
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
          <Typography.Title level={5} style={{ marginBottom: 16 }}>Giờ vận hành</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="opening_time" label="Giờ mở cửa" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="closing_time" label="Giờ đóng cửa" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={5}>Vận hành ngày nghỉ / cuối tuần</Typography.Title>
          <Row gutter={16} align="middle" style={{ marginTop: 16 }}>
            <Col span={18}>
              <Typography.Text strong>Mở cửa vào ngày lễ quốc gia</Typography.Text>
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
          <PercentageOutlined /> Hoa hồng và quy tắc thân thiết
        </span>
      ),
      children: (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>Hoa hồng nhà tạo mẫu</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="commission_rate" label="Hoa hồng mặc định cho nhà tạo mẫu (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: "100%" }} formatter={(value) => `${value}%`} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 20 }}>
            This rate will apply to stylist revenues generated from completed appointments unless overridden inside individual stylist profile settings.
          </div>

          <Divider />
          <Typography.Title level={5}>Điểm thân thiết và phần thưởng</Typography.Title>
          <Row gutter={16} align="middle" style={{ marginTop: 16, marginBottom: 16 }}>
            <Col span={18}>
              <Typography.Text strong>Bật tích lũy điểm thân thiết</Typography.Text>
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
              <Form.Item name="points_ratio" label="Tỷ lệ tích điểm (mỗi 1 đơn vị chi tiêu tương ứng X điểm)">
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
        title="Cài đặt"
        description="Cấu hình thông tin doanh nghiệp, giờ làm việc và tham số thanh toán/khách hàng thân thiết."
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
              Lưu cài đặt
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
