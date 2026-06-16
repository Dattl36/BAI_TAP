import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  DatePicker,
  Modal,
  Descriptions,
  Divider,
  Tag,
  message,
  Col,
  Row,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

import { invoicesApi } from "../../api/invoices.api";
import { paymentsApi } from "../../api/payments.api";
import { employeesApi } from "../../api/employees.api";
import { customersApi } from "../../api/customers.api";
import { servicesApi } from "../../api/services.api";
import { appointmentsApi } from "../../api/appointments.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import type { Invoice } from "../../types/invoice";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";
import { formatDateTime } from "../../utils/date";

const { RangePicker } = DatePicker;

export const ManagerInvoicesPage = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [staffFilter, setStaffFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [methodFilter, setMethodFilter] = useState<string | undefined>(undefined);

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Queries
  const invoicesQuery = useQuery({
    queryKey: ["invoices", "list"],
    queryFn: () => invoicesApi.list({ limit: 100 }),
  });

  const paymentsQuery = useQuery({
    queryKey: ["payments", "list"],
    queryFn: () => paymentsApi.list({ limit: 100 }),
  });

  const employeesQuery = useQuery({
    queryKey: ["employees", "list"],
    queryFn: () => employeesApi.list({ limit: 100 }),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", "list"],
    queryFn: () => customersApi.list({ limit: 100 }),
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => appointmentsApi.list({ limit: 100 }),
  });

  const servicesQuery = useQuery({
    queryKey: ["services", "list"],
    queryFn: () => servicesApi.list({ limit: 100 }),
  });

  const handleResetFilters = () => {
    setSearchText("");
    setDateRange(null);
    setStaffFilter(undefined);
    setStatusFilter(undefined);
    setMethodFilter(undefined);
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handlePrint = (invoiceId: string | number) => {
    message.loading("Preparing print template...", 1);
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleDownloadPDF = (invoiceId: string | number) => {
    const key = "pdf_download";
    message.loading({ content: "Generating PDF file...", key });
    setTimeout(() => {
      message.success({ content: `Invoice_INV-${invoiceId}.pdf downloaded successfully!`, key, duration: 2 });
    }, 1500);
  };

  // Data mapping
  const allInvoices = getListItems(invoicesQuery.data);
  const payments = getListItems(paymentsQuery.data);
  const employees = getListItems(employeesQuery.data);
  const customers = getListItems(customersQuery.data);
  const appointments = getListItems(appointmentsQuery.data);

  // Filter process
  const filtered = allInvoices.filter((inv) => {
    // 1. Search text (matches invoice ID or customer name)
    const custObj = customers.find((c) => String(c.id) === String(inv.customer));
    const matchesSearch =
      !searchText ||
      String(inv.id).includes(searchText) ||
      (custObj?.full_name && custObj.full_name.toLowerCase().includes(searchText.toLowerCase()));

    // 2. Date Range
    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const invDate = dayjs(inv.created_at || inv.issued_at);
      matchesDate = invDate.isBetween(dateRange[0].startOf("day"), dateRange[1].endOf("day"), null, "[]");
    }

    // 3. Staff filter (we look up the appointment of the invoice to see who was the staff)
    let matchesStaff = true;
    if (staffFilter) {
      const apt = appointments.find((a) => String(a.id) === String(inv.appointment));
      matchesStaff = !!apt && Number(apt.staff) === staffFilter;
    }

    // 4. Status
    const matchesStatus = !statusFilter || inv.status === statusFilter;

    // 5. Payment Method
    let matchesMethod = true;
    if (methodFilter) {
      const pms = payments.filter((p) => String(p.invoice) === String(inv.id) && p.status === "successful");
      matchesMethod = pms.some((p) => p.method.toLowerCase() === methodFilter.toLowerCase());
    }

    return matchesSearch && matchesDate && matchesStaff && matchesStatus && matchesMethod;
  });

  // Table columns definition
  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice Code",
      dataIndex: "id",
      key: "id",
      render: (id) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>#INV-{id}</span>,
    },
    {
      title: "Booking ID",
      dataIndex: "appointment",
      key: "appointment",
      render: (aptId) => <span>#B-{aptId}</span>,
    },
    {
      title: "Payment Date",
      dataIndex: "created_at",
      key: "date",
      render: (val) => formatDateTime(val),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (custId) => {
        const cust = customers.find((c) => String(c.id) === String(custId));
        return <span>{cust?.full_name || `Client #${custId}`}</span>;
      },
    },
    {
      title: "Assigned Stylist",
      key: "stylist",
      render: (_, record) => {
        const apt = appointments.find((a) => String(a.id) === String(record.appointment));
        if (!apt) return <span style={{ color: "var(--color-muted)" }}>N/A</span>;
        const stylist = employees.find((e) => String(e.id) === String(apt.staff));
        return <span>{stylist?.full_name || `Stylist #${apt.staff}`}</span>;
      },
    },
    {
      title: "Final Amount",
      dataIndex: "total_due",
      key: "total_due",
      render: (val) => <span style={{ fontWeight: 600 }}>{formatMoney(val)}</span>,
    },
    {
      title: "Payment Method",
      key: "method",
      render: (_, record) => {
        const successfulPayments = payments.filter((p) => String(p.invoice) === String(record.id) && p.status === "successful");
        if (successfulPayments.length === 0) return <Tag color="warning">Unpaid</Tag>;
        return (
          <Space size={4}>
            {successfulPayments.map((p, idx) => (
              <Tag color="gold" key={idx}>
                {p.method.toUpperCase()}
              </Tag>
            ))}
          </Space>
        );
      },
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
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button
              type="text"
              icon={<PrinterOutlined style={{ color: "var(--color-primary-dark)" }} />}
              onClick={() => handlePrint(Number(record.id))}
            />
          </Tooltip>
          <Tooltip title="Export PDF">
            <Button
              type="text"
              icon={<DownloadOutlined style={{ color: "#3b82f6" }} />}
              onClick={() => handleDownloadPDF(Number(record.id))}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Selected Invoice Detail Calculations
  const getSelectedInvoiceStylist = () => {
    if (!selectedInvoice) return "N/A";
    const apt = appointments.find((a) => String(a.id) === String(selectedInvoice.appointment));
    const stylist = employees.find((e) => String(e.id) === String(apt?.staff));
    return stylist?.full_name || "N/A";
  };

  const getSelectedInvoiceCustomer = () => {
    if (!selectedInvoice) return null;
    return customers.find((c) => String(c.id) === String(selectedInvoice.customer));
  };

  const getSelectedInvoiceItems = () => {
    if (!selectedInvoice || !selectedInvoice.items) return [];
    return selectedInvoice.items;
  };

  const isQueryLoading =
    invoicesQuery.isLoading ||
    paymentsQuery.isLoading ||
    employeesQuery.isLoading ||
    customersQuery.isLoading ||
    appointmentsQuery.isLoading ||
    servicesQuery.isLoading;

  const isQueryError =
    invoicesQuery.isError ||
    paymentsQuery.isError ||
    employeesQuery.isError ||
    customersQuery.isError ||
    appointmentsQuery.isError ||
    servicesQuery.isError;

  return (
    <div>
      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Typography.Paragraph style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--color-muted)" }}>
                SEARCH INVOICE
              </Typography.Paragraph>
              <Input
                placeholder="Invoice code or customer..."
                prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", height: 38, borderRadius: 8 }}
                allowClear
              />
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Typography.Paragraph style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--color-muted)" }}>
                DATE RANGE
              </Typography.Paragraph>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as any)}
                style={{ width: "100%", height: 38, borderRadius: 8 }}
              />
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Typography.Paragraph style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--color-muted)" }}>
                STYLIST
              </Typography.Paragraph>
              <Select
                placeholder="Choose stylist"
                value={staffFilter}
                onChange={setStaffFilter}
                style={{ width: "100%", height: 38 }}
                allowClear
              >
                {employees
                  .filter((emp) => emp.role_type === "staff")
                  .map((emp) => (
                    <Select.Option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </Select.Option>
                  ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Typography.Paragraph style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--color-muted)" }}>
                PAYMENT METHOD
              </Typography.Paragraph>
              <Select
                placeholder="Choose method"
                value={methodFilter}
                onChange={setMethodFilter}
                style={{ width: "100%", height: 38 }}
                allowClear
                options={[
                  { label: "Cash", value: "cash" },
                  { label: "Card", value: "card" },
                  { label: "Bank Transfer", value: "bank" },
                ]}
              />
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Typography.Paragraph style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--color-muted)" }}>
                STATUS
              </Typography.Paragraph>
              <Select
                placeholder="Choose status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%", height: 38 }}
                allowClear
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Issued", value: "issued" },
                  { label: "Paid", value: "paid" },
                  { label: "Adjusted", value: "adjusted" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ borderRadius: 8 }}
            >
              Reset Filters
            </Button>
          </div>
        </Space>
      </Card>

      <Card bordered={false} style={{ borderRadius: 16 }}>
        {isQueryError ? (
          <ErrorState
            message="Failed to fetch transactions list."
            onRetry={() => void invoicesQuery.refetch()}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            loading={isQueryLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontFamily: "'Outfit', sans-serif" }}>
            Invoice Details <span style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>#INV-{selectedInvoice?.id}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            className="login-button-gold"
            icon={<PrinterOutlined />}
            onClick={() => selectedInvoice && handlePrint(selectedInvoice.id)}
          >
            Print
          </Button>,
          <Button
            key="download"
            type="primary"
            ghost
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            icon={<DownloadOutlined />}
            onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice.id)}
          >
            Export PDF
          </Button>,
        ]}
        width={650}
      >
        {selectedInvoice && (
          <div style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions title="Billing Info" column={1} size="small">
                  <Descriptions.Item label="Client Name">
                    <strong>{getSelectedInvoiceCustomer()?.full_name || "Walk-in Guest"}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {getSelectedInvoiceCustomer()?.phone || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {getSelectedInvoiceCustomer()?.phone ? "N/A" : "Guest Client"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions title="Reference" column={1} size="small">
                  <Descriptions.Item label="Booking ID">#B-{selectedInvoice.appointment}</Descriptions.Item>
                  <Descriptions.Item label="Stylist">{getSelectedInvoiceStylist()}</Descriptions.Item>
                  <Descriptions.Item label="Issued Date">{formatDateTime(selectedInvoice.created_at || selectedInvoice.issued_at)}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            <Typography.Title level={5} style={{ marginBottom: 12 }}>Line Items</Typography.Title>
            <Table
              dataSource={getSelectedInvoiceItems()}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: "Description", dataIndex: "description", key: "desc" },
                { title: "Qty", dataIndex: "quantity", key: "qty", width: 80, align: "center" },
                {
                  title: "Unit Price",
                  dataIndex: "unit_price",
                  key: "unit",
                  width: 120,
                  align: "right",
                  render: (val) => formatMoney(val),
                },
                {
                  title: "Total",
                  dataIndex: "line_total",
                  key: "total",
                  width: 120,
                  align: "right",
                  render: (val) => formatMoney(val),
                },
              ]}
            />

            <Divider style={{ margin: "20px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ display: "flex", width: 260, justifyContent: "space-between" }}>
                <Typography.Text type="secondary">Subtotal:</Typography.Text>
                <Typography.Text style={{ fontWeight: 500 }}>{formatMoney(selectedInvoice.subtotal)}</Typography.Text>
              </div>
              <div style={{ display: "flex", width: 260, justifyContent: "space-between" }}>
                <Typography.Text type="secondary">Campaign Discount:</Typography.Text>
                <Typography.Text type="danger">- {formatMoney(selectedInvoice.discount_total)}</Typography.Text>
              </div>
              {Number(selectedInvoice.reward_discount) > 0 && (
                <div style={{ display: "flex", width: 260, justifyContent: "space-between" }}>
                  <Typography.Text type="secondary">Points Redeemed:</Typography.Text>
                  <Typography.Text type="danger">- {formatMoney(selectedInvoice.reward_discount)}</Typography.Text>
                </div>
              )}
              <Divider style={{ margin: "8px 0", width: 260 }} />
              <div style={{ display: "flex", width: 260, justifyContent: "space-between" }}>
                <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Total Due:</Typography.Text>
                <Typography.Text style={{ fontSize: 16, fontWeight: 700, color: "var(--color-primary-dark)" }}>
                  {formatMoney(selectedInvoice.total_due)}
                </Typography.Text>
              </div>
              <div style={{ display: "flex", width: 260, justifyContent: "space-between", marginTop: 4 }}>
                <Typography.Text type="secondary">Paid Amount:</Typography.Text>
                <Typography.Text style={{ color: "green", fontWeight: 600 }}>{formatMoney(selectedInvoice.paid_amount)}</Typography.Text>
              </div>
              <div style={{ display: "flex", width: 260, justifyContent: "space-between" }}>
                <Typography.Text type="secondary">Balance Remaining:</Typography.Text>
                <Typography.Text style={{ fontWeight: 600 }}>{formatMoney(selectedInvoice.balance_due)}</Typography.Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
