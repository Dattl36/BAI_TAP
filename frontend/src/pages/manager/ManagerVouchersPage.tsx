import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Tag,
  Drawer,
  Descriptions,
  Divider,
  Row,
  Col,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  PoweroffOutlined,
  HistoryOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { vouchersApi } from "../../api/vouchers.api";
import { customersApi } from "../../api/customers.api";
import { servicesApi } from "../../api/services.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { PageHeader } from "../../components/common/PageHeader";
import type { Voucher } from "../../types/voucher";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";
import { formatDate } from "../../utils/date";

export const ManagerVouchersPage = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();

  // History Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Queries
  const vouchersQuery = useQuery({
    queryKey: ["vouchers", "list"],
    queryFn: () => vouchersApi.list({ limit: 100 }),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", "list"],
    queryFn: () => customersApi.list({ limit: 100 }),
  });

  const servicesQuery = useQuery({
    queryKey: ["services", "list"],
    queryFn: () => servicesApi.list({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: Partial<Voucher>) => vouchersApi.create(payload),
    onSuccess: () => {
      message.success("Voucher created successfully!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => {
      message.error(getErrorMessage(err) || "Failed to create voucher");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Voucher> }) =>
      vouchersApi.update(id, payload),
    onSuccess: () => {
      message.success("Voucher updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      setIsModalOpen(false);
      form.resetFields();
      setEditingVoucher(null);
    },
    onError: (err) => {
      message.error(getErrorMessage(err) || "Failed to update voucher");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "cancelled" }) =>
      vouchersApi.update(id, { status }),
    onSuccess: (_, variables) => {
      message.success(`Voucher status updated to ${variables.status}!`);
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (err) => {
      message.error(getErrorMessage(err) || "Failed to update status");
    },
  });

  // Actions
  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({
      starts_at: dayjs(),
      expires_at: dayjs().add(30, "day"),
      status: "active",
      usage_limit: 1,
      min_invoice: 0,
      discount_type: "amount",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: Voucher) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      code: record.code,
      discount_type: record.discount_type,
      discount_value: Number(record.discount_value),
      min_invoice: Number(record.min_invoice),
      usage_limit: record.usage_limit,
      starts_at: dayjs(record.starts_at),
      expires_at: dayjs(record.expires_at),
      status: record.status,
      customer: record.customer,
    });
    setIsModalOpen(true);
  };

  const handleSaveVoucher = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        starts_at: values.starts_at.toISOString(),
        expires_at: values.expires_at.toISOString(),
      };

      if (editingVoucher) {
        updateMutation.mutate({ id: Number(editingVoucher.id), payload });
      } else {
        createMutation.mutate(payload);
      }
    });
  };

  const handleToggleStatus = (record: Voucher) => {
    const nextStatus = record.status === "active" ? "cancelled" : "active";
    toggleMutation.mutate({ id: Number(record.id), status: nextStatus });
  };

  const handleOpenHistory = (record: Voucher) => {
    setSelectedVoucher(record);
    setDrawerOpen(true);
  };

  // Data processing
  const allVouchers = getListItems(vouchersQuery.data);
  const customers = getListItems(customersQuery.data);
  const services = getListItems(servicesQuery.data);

  const filtered = allVouchers.filter((item) => {
    const matchesSearch =
      !searchText || item.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Columns definition
  const columns: ColumnsType<Voucher> = [
    {
      title: "Voucher Code",
      dataIndex: "code",
      key: "code",
      render: (text) => (
        <span style={{ fontWeight: 600, color: "var(--color-primary-dark)", display: "flex", alignItems: "center", gap: 6 }}>
          <GiftOutlined /> {text}
        </span>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount_value",
      key: "discount",
      render: (val, record) => (
        <span style={{ fontWeight: 500 }}>
          {record.discount_type === "amount" ? formatMoney(val) : `${val}% OFF`}
        </span>
      ),
    },
    {
      title: "Min Spend",
      dataIndex: "min_invoice",
      key: "min_invoice",
      render: (val) => formatMoney(val),
    },
    {
      title: "Assigned Client",
      dataIndex: "customer",
      key: "customer",
      render: (custId) => {
        if (!custId) return <Tag color="blue">Global (All clients)</Tag>;
        const custObj = customers.find((c) => String(c.id) === String(custId));
        return <span>{custObj?.full_name || `Client #${custId}`}</span>;
      },
    },
    {
      title: "Validity",
      key: "validity",
      render: (_, record) => (
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
          {formatDate(record.starts_at)} to {formatDate(record.expires_at)}
        </span>
      ),
    },
    {
      title: "Usage (Used / Limit)",
      key: "usage",
      render: (_, record) => (
        <span>
          <strong>{record.used_count || 0}</strong> / {record.usage_limit}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "var(--color-primary-dark)" }} />}
            onClick={() => handleOpenEditModal(record)}
          />
          <Button
            type="text"
            danger={record.status === "active"}
            icon={<PoweroffOutlined />}
            onClick={() => handleToggleStatus(record)}
            disabled={toggleMutation.isPending}
          />
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => handleOpenHistory(record)}
          >
            History
          </Button>
        </Space>
      ),
    },
  ];

  // Mock redemption history since API is not fully built for it (uses frontend mapping)
  const getRedemptions = (voucherId: any) => {
    // Generate mock log based on voucherId
    return [
      {
        id: 1,
        customerName: "Alex Morgan",
        invoiceCode: "#INV-122",
        discountApplied: "$15.00",
        date: "2026-06-05 14:22",
      },
      {
        id: 2,
        customerName: "Jessica Alba",
        invoiceCode: "#INV-105",
        discountApplied: "$15.00",
        date: "2026-06-03 10:15",
      },
    ].slice(0, selectedVoucher?.used_count || 0);
  };

  return (
    <div>
      <PageHeader
        title="Voucher & Promotions"
        description="Configure promotional codes, loyalty discounts, and track redemption trends across campaigns."
        actions={
          <Button
            type="primary"
            className="login-button-gold"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
          >
            Create Voucher
          </Button>
        }
      />

      <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
        <div className="table-toolbar" style={{ marginBottom: 24 }}>
          <Input
            placeholder="Search by voucher code..."
            prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="table-search-input"
            allowClear
            style={{ width: 300, borderRadius: 8, height: 38 }}
          />

          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200, height: 38 }}
            allowClear
            options={[
              { label: "Active", value: "active" },
              { label: "Redeemed", value: "redeemed" },
              { label: "Expired", value: "expired" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        </div>

        {vouchersQuery.isError ? (
          <ErrorState
            message={getErrorMessage(vouchersQuery.error)}
            onRetry={() => void vouchersQuery.refetch()}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            loading={vouchersQuery.isLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingVoucher ? "Edit Voucher Details" : "Create New Campaign Voucher"}
        open={isModalOpen}
        onOk={handleSaveVoucher}
        onCancel={() => setIsModalOpen(false)}
        okText={editingVoucher ? "Save Changes" : "Create Voucher"}
        okButtonProps={{ className: "login-button-gold" }}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Voucher Code"
                rules={[
                  { required: true, message: "Please specify code" },
                  { pattern: /^[A-Z0-9_-]+$/, message: "Uppercase letters, numbers, hyphens or underscores only" },
                ]}
              >
                <Input placeholder="e.g. SUMMER50" style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customer" label="Assign to Specific Client (Optional)">
                <Select
                  placeholder="Select client"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {customers.map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.full_name} ({c.phone || "No Phone"})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="discount_type" label="Discount Type" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="amount">Fixed Amount ($)</Select.Option>
                  <Select.Option value="percent">Percentage (%)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discount_value" label="Discount Value" rules={[{ required: true, message: "Specify value" }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_invoice" label="Minimum Invoice Condition ($)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="usage_limit" label="Total Usage Limit" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="starts_at" label="Active From" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expires_at" label="Active Until" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Initial Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* History Drawer */}
      <Drawer
        title="Voucher Audit Log & History"
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedVoucher && (
          <div>
            <Descriptions title="Campaign Overview" column={1} bordered size="small">
              <Descriptions.Item label="Code">{selectedVoucher.code}</Descriptions.Item>
              <Descriptions.Item label="Discount">
                {selectedVoucher.discount_type === "amount"
                  ? formatMoney(selectedVoucher.discount_value)
                  : `${selectedVoucher.discount_value}% OFF`}
              </Descriptions.Item>
              <Descriptions.Item label="Min Spend">
                {formatMoney(selectedVoucher.min_invoice)}
              </Descriptions.Item>
              <Descriptions.Item label="Redemption Stats">
                {selectedVoucher.used_count} used / {selectedVoucher.usage_limit} limit
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={selectedVoucher.status} />
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Typography.Title level={5}>Redemption Ledger</Typography.Title>
            
            {getRedemptions(selectedVoucher.id).length > 0 ? (
              <Table
                dataSource={getRedemptions(selectedVoucher.id)}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: "Client", dataIndex: "customerName", key: "cust" },
                  { title: "Invoice", dataIndex: "invoiceCode", key: "inv" },
                  { title: "Saved", dataIndex: "discountApplied", key: "saved" },
                  { title: "Redeemed", dataIndex: "date", key: "date" },
                ]}
              />
            ) : (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--color-muted)" }}>
                No redemptions logged for this code yet.
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
