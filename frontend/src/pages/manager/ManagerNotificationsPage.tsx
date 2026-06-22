import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Form,
  Row,
  Col,
  Tag,
  message,
  Typography,
  Radio,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SendOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  GroupOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { notificationsApi } from "../../api/notifications.api";
import { employeesApi } from "../../api/employees.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { PageHeader } from "../../components/common/PageHeader";
import type { Notification } from "../../types/notification";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/date";

export const ManagerNotificationsPage = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [composerForm] = Form.useForm();
  
  // Recipient selector state
  const [recipientType, setRecipientType] = useState<"all" | "group" | "specific">("all");
  const [sending, setSending] = useState(false);

  // Queries
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list({ limit: 100 }),
  });

  const employeesQuery = useQuery({
    queryKey: ["employees", "list"],
    queryFn: () => employeesApi.list({ limit: 100 }),
  });

  const employees = getListItems(employeesQuery.data);
  const notifications = getListItems(notificationsQuery.data);

  // Multi-sending logic
  const handleSendNotification = () => {
    composerForm.validateFields().then(async (values) => {
      setSending(true);
      const activeEmployees = employees.filter((e) => e.employment_status === "active" && e.user);

      // Determine recipients
      let targets: any[] = [];
      let label = "";

      if (recipientType === "all") {
        targets = activeEmployees;
        label = "Toàn bộ nhân viên";
      } else if (recipientType === "group") {
        targets = activeEmployees.filter((e) => e.role_type === values.group);
        label = values.group === "staff" ? "Nhóm nhà tạo mẫu" : "Nhóm lễ tân";
      } else {
        const emp = activeEmployees.find((e) => e.id === values.specific_employee);
        if (emp) {
          targets = [emp];
          label = emp.full_name;
        }
      }

      if (targets.length === 0) {
        message.error("Không tìm thấy người dùng đang hoạt động trong nhóm nhận đã chọn.");
        setSending(false);
        return;
      }

      const category = `broadcast_${values.priority}`;
      let successCount = 0;

      // Send requests sequentially
      const key = "sending_broadcast";
      message.loading({ content: `Sending notification to ${targets.length} recipient(s)...`, key });

      for (const t of targets) {
        try {
          await notificationsApi.create({
            recipient: t.user,
            category: category,
            title: values.title,
            message: values.message,
          });
          successCount++;
        } catch (e) {
          console.error(`Failed to send to user ${t.user}`, e);
        }
      }

      setSending(false);

      if (successCount > 0) {
        message.success({ content: `Successfully sent broadcast to ${successCount} user(s)!`, key, duration: 2 });
        composerForm.resetFields();
        composerForm.setFieldsValue({ priority: "medium" });
        setRecipientType("all");
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } else {
        message.error({ content: "Failed to send notification to any recipient.", key, duration: 2 });
      }
    });
  };

  const getPriorityTag = (category: string) => {
    if (category.endsWith("high")) return <Tag color="error">Cao</Tag>;
    if (category.endsWith("medium")) return <Tag color="warning">Trung bình</Tag>;
    return <Tag color="blue">Thấp</Tag>;
  };

  // Filter logs
  const filteredLogs = notifications.filter((n) => {
    const matchesSearch =
      !searchText ||
      n.title.toLowerCase().includes(searchText.toLowerCase()) ||
      n.message.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const columns: ColumnsType<Notification> = [
    {
      title: "Ngày gửi",
      dataIndex: "created_at",
      key: "date",
      width: 140,
      render: (val) => formatDateTime(val),
    },
    {
      title: "Thông tin",
      key: "message",
      render: (_, record) => (
        <div>
          <strong style={{ display: "block", fontSize: 13 }}>{record.title}</strong>
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{record.message}</span>
        </div>
      ),
    },
    {
      title: "Người nhận",
      dataIndex: "recipient",
      key: "recipient",
      width: 120,
      render: (userId) => {
        const emp = employees.find((e) => e.user === userId);
        return <span>{emp?.full_name || `User #${userId}`}</span>;
      },
    },
    {
      title: "Ưu tiên",
      dataIndex: "category",
      key: "priority",
      width: 130,
      render: (cat) => getPriorityTag(cat || "broadcast_medium"),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 110,
      render: (_, record) => {
        if (record.read_at) {
          return <Tag color="default">Đã đọc</Tag>;
        }
        return <Tag color="processing">Đã gửi</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Thông báo"
        description="Gửi thông báo, cập nhật chính sách và lịch làm việc đến nhân viên."
      />

      <Row gutter={[24, 24]}>
        {/* Left Column: Notification Composer */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BellOutlined /> Notification Composer
              </span>
            }
            bordered={false}
          >
            <Form
              form={composerForm}
              layout="vertical"
              initialValues={{ priority: "medium" }}
            >
              <Form.Item label="Gửi đến" required>
                <Radio.Group
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  style={{ width: "100%", marginBottom: 12 }}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="all" style={{ width: "33.3%", textAlign: "center" }}>
                    <GlobalOutlined /> Toàn bộ
                  </Radio.Button>
                  <Radio.Button value="group" style={{ width: "33.3%", textAlign: "center" }}>
                    <GroupOutlined /> Nhóm
                  </Radio.Button>
                  <Radio.Button value="specific" style={{ width: "33.3%", textAlign: "center" }}>
                    <UserOutlined /> Cá nhân
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {recipientType === "group" && (
                <Form.Item name="group" label="Chọn nhóm" rules={[{ required: true }]}>
                  <Select placeholder="Chọn nhóm">
                    <Select.Option value="staff">Stylists/Salon Staff</Select.Option>
                    <Select.Option value="receptionist">Lễ tân</Select.Option>
                  </Select>
                </Form.Item>
              )}

              {recipientType === "specific" && (
                <Form.Item name="specific_employee" label="Tìm nhân viên" rules={[{ required: true }]}>
                  <Select
                    placeholder="Nhập tên nhân viên..."
                    showSearch
                    optionFilterProp="children"
                  >
                    {employees
                      .filter((e) => e.employment_status === "active")
                      .map((emp) => (
                        <Select.Option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.role_type.toUpperCase()})
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true }]}>
                <Radio.Group style={{ width: "100%" }} buttonStyle="solid">
                  <Radio.Button value="low" style={{ width: "33.3%", textAlign: "center" }}>
                    Thấp
                  </Radio.Button>
                  <Radio.Button value="medium" style={{ width: "33.3%", textAlign: "center" }}>
                    Trung bình
                  </Radio.Button>
                  <Radio.Button value="high" style={{ width: "33.3%", textAlign: "center" }}>
                    Cao
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="title"
                label="Tiêu đề thông báo"
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề thông báo." },
                  { max: 100, message: "Tiêu đề không được vượt quá 100 ký tự." },
                ]}
              >
                <Input placeholder="Nhập tiêu đề..." />
              </Form.Item>

              <Form.Item
                name="message"
                label="Nội dung thông báo"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung thông báo." },
                  { min: 10, message: "Nội dung thông báo cần tối thiểu 10 ký tự." },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Viết nội dung tin nhắn tại đây..." />
              </Form.Item>

              <Form.Item style={{ margin: 0 }}>
                <Button
                  type="primary"
                  className="login-button-gold"
                  icon={<SendOutlined />}
                  onClick={handleSendNotification}
                  loading={sending}
                  style={{ width: "100%", height: 40 }}
                >
                  BROADCAST MESSAGE
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column: Sent Logs */}
        <Col xs={24} lg={14}>
          <Card title="Nhật ký gửi thông báo" bordered={false}>
            <div className="table-toolbar" style={{ marginBottom: 20 }}>
              <Input
                placeholder="Lọc nhật ký..."
                prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", height: 38, borderRadius: 8 }}
                allowClear
              />
            </div>

            {notificationsQuery.isError ? (
              <ErrorState
                message="Không thể tải nhật ký gửi thông báo."
                onRetry={() => void notificationsQuery.refetch()}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredLogs}
                loading={notificationsQuery.isLoading || employeesQuery.isLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
