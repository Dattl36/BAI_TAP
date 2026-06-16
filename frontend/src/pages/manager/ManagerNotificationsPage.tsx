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
        label = "All Staff";
      } else if (recipientType === "group") {
        targets = activeEmployees.filter((e) => e.role_type === values.group);
        label = values.group === "staff" ? "Stylists Group" : "Receptionists Group";
      } else {
        const emp = activeEmployees.find((e) => e.id === values.specific_employee);
        if (emp) {
          targets = [emp];
          label = emp.full_name;
        }
      }

      if (targets.length === 0) {
        message.error("No active users found for the selected recipient group.");
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
    if (category.endsWith("high")) return <Tag color="error">High Priority</Tag>;
    if (category.endsWith("medium")) return <Tag color="warning">Medium Priority</Tag>;
    return <Tag color="blue">Low Priority</Tag>;
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
      title: "Date Sent",
      dataIndex: "created_at",
      key: "date",
      width: 140,
      render: (val) => formatDateTime(val),
    },
    {
      title: "Title & Message",
      key: "message",
      render: (_, record) => (
        <div>
          <strong style={{ display: "block", fontSize: 13 }}>{record.title}</strong>
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{record.message}</span>
        </div>
      ),
    },
    {
      title: "Recipient ID",
      dataIndex: "recipient",
      key: "recipient",
      width: 120,
      render: (userId) => {
        const emp = employees.find((e) => e.user === userId);
        return <span>{emp?.full_name || `User #${userId}`}</span>;
      },
    },
    {
      title: "Priority",
      dataIndex: "category",
      key: "priority",
      width: 130,
      render: (cat) => getPriorityTag(cat || "broadcast_medium"),
    },
    {
      title: "Read Status",
      key: "status",
      width: 110,
      render: (_, record) => {
        if (record.read_at) {
          return <Tag color="default">Read</Tag>;
        }
        return <Tag color="processing">Delivered</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Broadcast alerts, policy updates, and scheduling announcements to staff."
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
              <Form.Item label="Target Recipients" required>
                <Radio.Group
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  style={{ width: "100%", marginBottom: 12 }}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="all" style={{ width: "33.3%", textAlign: "center" }}>
                    <GlobalOutlined /> All Staff
                  </Radio.Button>
                  <Radio.Button value="group" style={{ width: "33.3%", textAlign: "center" }}>
                    <GroupOutlined /> Group
                  </Radio.Button>
                  <Radio.Button value="specific" style={{ width: "33.3%", textAlign: "center" }}>
                    <UserOutlined /> Specific
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {recipientType === "group" && (
                <Form.Item name="group" label="Select Staff Role" rules={[{ required: true }]}>
                  <Select placeholder="Choose role group">
                    <Select.Option value="staff">Stylists / Salon Staff</Select.Option>
                    <Select.Option value="receptionist">Receptionists</Select.Option>
                  </Select>
                </Form.Item>
              )}

              {recipientType === "specific" && (
                <Form.Item name="specific_employee" label="Select Employee" rules={[{ required: true }]}>
                  <Select
                    placeholder="Choose active employee"
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

              <Form.Item name="priority" label="Priority Level" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="low">Low Priority</Select.Option>
                  <Select.Option value="medium">Medium Priority</Select.Option>
                  <Select.Option value="high">High Priority</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="title"
                label="Notification Title"
                rules={[
                  { required: true, message: "Title is required" },
                  { max: 100, message: "Title must be less than 100 characters" },
                ]}
              >
                <Input placeholder="e.g. Schedule Change Alert, Staff Policy Update" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message Body"
                rules={[
                  { required: true, message: "Message body is required" },
                  { min: 10, message: "Message must be at least 10 characters" },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Type announcement message here..." />
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
                  Broadcast Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column: Sent Logs */}
        <Col xs={24} lg={14}>
          <Card title="Broadcast Log" bordered={false}>
            <div className="table-toolbar" style={{ marginBottom: 20 }}>
              <Input
                placeholder="Search notification messages..."
                prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", height: 38, borderRadius: 8 }}
                allowClear
              />
            </div>

            {notificationsQuery.isError ? (
              <ErrorState
                message="Failed to load broadcast log."
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
