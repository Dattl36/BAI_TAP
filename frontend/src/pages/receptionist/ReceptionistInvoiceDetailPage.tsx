import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  Descriptions, 
  Typography, 
  Button, 
  Space, 
  message, 
  Input, 
  Row, 
  Col, 
  Table, 
  Modal, 
  Form, 
  Select, 
  Spin, 
  Alert,
  Badge,
  InputNumber,
  Divider
} from "antd";
import { 
  ArrowLeftOutlined, 
  TrophyOutlined, 
  GiftOutlined, 
  CreditCardOutlined,
  PlusOutlined,
  DollarOutlined,
  TagsOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { invoicesApi } from "../../api/invoices.api";
import { customersApi } from "../../api/customers.api";
import { rewardsApi } from "../../api/rewards.api";
import { paymentsApi } from "../../api/payments.api";
import { serviceExecutionsApi } from "../../api/serviceExecutions.api";
import { appointmentsApi } from "../../api/appointments.api";

import { StatusTag } from "../../components/common/StatusTag";
import type { Invoice, InvoiceItem } from "../../types/invoice";
import type { Customer } from "../../types/customer";
import { formatMoney } from "../../utils/money";
import { formatDateTime } from "../../utils/date";
import { getListItems } from "../../utils/apiResponse";

export const ReceptionistInvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Apply inputs
  const [voucherCode, setVoucherCode] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [referenceCode, setReferenceCode] = useState("");

  // Incidentals Modal States
  const [isIncidentalOpen, setIsIncidentalOpen] = useState(false);
  const [incidentalForm] = Form.useForm();
  const [executionId, setExecutionId] = useState<number | string | null>(null);

  // Fetch invoice details and related records
  const fetchInvoiceDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const invoiceRes = await invoicesApi.detail(id);
      const invData = invoiceRes;
      setInvoice(invData);

      // Fetch customer detail
      if (invData.customer) {
        const customerRes = await customersApi.detail(invData.customer);
        setCustomer(customerRes);

        // Fetch reward ledger for points balance
        const rewardsRes = await rewardsApi.list({ customer: invData.customer });
        const rewardsList = getListItems(rewardsRes);
        const sortedRewards = [...rewardsList].sort((a, b) => Number(b.id) - Number(a.id));
        setLoyaltyPoints(sortedRewards.length > 0 ? sortedRewards[0].balance_after : 0);
      }

      // Fetch associated service execution
      const execRes = await serviceExecutionsApi.list();
      const execList = getListItems(execRes);
      const matchedExec = execList.find((e) => e.appointment === invData.appointment);
      if (matchedExec) {
        setExecutionId(matchedExec.id);
      }
    } catch (err) {
      void message.error("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvoiceDetails();
  }, [id]);

  const handleApplyVoucher = async () => {
    if (!id || !voucherCode.trim()) return;
    setActionLoading(true);
    try {
      const res = await invoicesApi.applyVoucher(id, voucherCode.trim());
      setInvoice(res);
      void message.success("Voucher applied successfully!");
      setVoucherCode("");
    } catch (err: any) {
      void message.error(err?.response?.data?.message || err?.message || "Invalid voucher code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyPoints = async () => {
    if (!id || !pointsToRedeem || pointsToRedeem <= 0) return;
    if (pointsToRedeem > loyaltyPoints) {
      void message.error("Insufficient reward points balance");
      return;
    }
    setActionLoading(true);
    try {
      const res = await invoicesApi.useRewardPoints(id, pointsToRedeem);
      setInvoice(res);
      void message.success(`${pointsToRedeem} points redeemed!`);
      
      // Update points locally
      setLoyaltyPoints((prev) => prev - pointsToRedeem);
      setPointsToRedeem(null);
    } catch (err: any) {
      void message.error(err?.response?.data?.message || err?.message || "Failed to redeem points");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddIncidental = async (values: any) => {
    if (!executionId || !id || !invoice) return;
    setActionLoading(true);
    try {
      // 1. Add incidental to service execution
      await serviceExecutionsApi.addIncidental(executionId, {
        item_type: values.item_type,
        description: values.description,
        quantity: Number(values.quantity),
        unit_price: Number(values.unit_price),
      });

      // 2. Re-create invoice from appointment to update items list
      await invoicesApi.createFromAppointment(invoice.appointment);
      
      // 3. Refresh details
      await fetchInvoiceDetails();

      void message.success("Checkout incidental added");
      setIsIncidentalOpen(false);
      incidentalForm.resetFields();
    } catch (err: any) {
      void message.error(err?.response?.data?.message || err?.message || "Failed to add incidental");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!id || !invoice) return;
    setActionLoading(true);
    try {
      // 1. Record payment transaction
      const paymentRes = await paymentsApi.create({
        invoice: id,
        amount: invoice.balance_due,
        method: paymentMethod,
        reference_code: referenceCode,
      });

      // 2. Transite payment to successful
      if (paymentRes.id) {
        await paymentsApi.markSuccess(paymentRes.id);
      }

      // 3. Mark appointment status as closed
      await appointmentsApi.update(invoice.appointment, { status: "closed" });

      void message.success("Payment processed and checkout completed!");
      navigate("/receptionist/today");
    } catch (err: any) {
      void message.error(err?.response?.data?.message || err?.message || "Failed to record payment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: 400 }}>
        <Spin size="large" tip="Loading Invoice details..." />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Alert message="Invoice Not Found" description="The requested invoice was not found." type="error" showIcon />
    );
  }

  const itemsColumns: ColumnsType<InvoiceItem> = [
    { title: "Item Type", dataIndex: "item_type", key: "item_type", render: (type) => <span style={{ textTransform: "capitalize" }}>{type}</span> },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 100 },
    { title: "Unit Price", dataIndex: "unit_price", key: "unit_price", render: (val) => formatMoney(val), width: 120 },
    { title: "Line Total", dataIndex: "line_total", key: "line_total", render: (val) => <span style={{ fontWeight: 600 }}>{formatMoney(val)}</span>, width: 140 },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/receptionist/today" style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Back to Today's Dashboard
        </Link>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {/* Invoice Meta details */}
            <Card bordered={false} style={{ borderRadius: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <Typography.Title level={4} style={{ margin: 0, color: "var(--color-primary-dark)" }}>
                    Cashier Invoice #{invoice.id}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Issued Date: {invoice.issued_at ? formatDateTime(invoice.issued_at) : "Pending Checkout"}
                  </Typography.Text>
                </div>
                <StatusTag status={invoice.status} />
              </div>

              <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 600, width: 180, background: "#faf8f5" }}>
                <Descriptions.Item label="Guest Client">
                  {customer ? `${customer.full_name} (${customer.phone})` : `Client #${invoice.customer}`}
                </Descriptions.Item>
                <Descriptions.Item label="Appointment Code">#{invoice.appointment}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Invoice Items Registry */}
            <Card 
              title="Session Services & Products" 
              bordered={false} 
              style={{ borderRadius: 16 }}
              extra={
                invoice.status === "draft" && executionId && (
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsIncidentalOpen(true)}
                  >
                    Add Incidental
                  </Button>
                )
              }
            >
              <Table
                columns={itemsColumns}
                dataSource={invoice.items || []}
                rowKey="id"
                pagination={false}
                size="middle"
              />

              <Divider style={{ margin: "20px 0" }} />

              {/* Price Calculations */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 300, display: "flex", justifyContent: "space-between" }}>
                  <Typography.Text type="secondary">Subtotal:</Typography.Text>
                  <Typography.Text style={{ fontWeight: 500 }}>{formatMoney(invoice.subtotal)}</Typography.Text>
                </div>
                <div style={{ width: 300, display: "flex", justifyContent: "space-between" }}>
                  <Typography.Text type="secondary">Voucher Discount:</Typography.Text>
                  <Typography.Text style={{ color: "#ef4444" }}>-{formatMoney(invoice.discount_total)}</Typography.Text>
                </div>
                <div style={{ width: 300, display: "flex", justifyContent: "space-between" }}>
                  <Typography.Text type="secondary">Loyalty Points Offset:</Typography.Text>
                  <Typography.Text style={{ color: "#ef4444" }}>-{formatMoney(invoice.reward_discount)}</Typography.Text>
                </div>
                <div style={{ width: 300, display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--app-border)", paddingTop: 8 }}>
                  <Typography.Text style={{ fontWeight: 600 }}>Total Due:</Typography.Text>
                  <Typography.Text style={{ fontWeight: 700, fontSize: 16, color: "var(--color-primary-dark)" }}>
                    {formatMoney(invoice.total_due)}
                  </Typography.Text>
                </div>
                {Number(invoice.paid_amount) > 0 && (
                  <div style={{ width: 300, display: "flex", justifyContent: "space-between" }}>
                    <Typography.Text type="secondary">Amount Paid:</Typography.Text>
                    <Typography.Text style={{ color: "#10b981", fontWeight: 500 }}>{formatMoney(invoice.paid_amount)}</Typography.Text>
                  </div>
                )}
                <div style={{ width: 300, display: "flex", justifyContent: "space-between", borderTop: "2px double var(--app-border)", paddingTop: 8 }}>
                  <Typography.Text style={{ fontWeight: 700 }}>Balance Due:</Typography.Text>
                  <Typography.Text style={{ fontWeight: 800, fontSize: 18, color: "var(--color-primary)" }}>
                    {formatMoney(invoice.balance_due)}
                  </Typography.Text>
                </div>
              </div>
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {invoice.status === "draft" && (
              <>
                {/* Apply Voucher */}
                <Card 
                  title={<Space><TagsOutlined /> Apply Promo Voucher</Space>} 
                  bordered={false} 
                  style={{ borderRadius: 16 }}
                >
                  <Space.Compact style={{ width: "100%" }}>
                    <Input 
                      placeholder="Enter code (e.g. SPA50)" 
                      value={voucherCode} 
                      onChange={(e) => setVoucherCode(e.target.value)}
                      style={{ height: 42 }}
                      disabled={actionLoading}
                    />
                    <Button 
                      type="primary" 
                      icon={<GiftOutlined />} 
                      onClick={handleApplyVoucher}
                      loading={actionLoading}
                      className="login-button-gold"
                      style={{ height: 42 }}
                    >
                      Apply
                    </Button>
                  </Space.Compact>
                </Card>

                {/* Loyalty Point Offset */}
                <Card 
                  title={<Space><TrophyOutlined /> Redeem Loyalty Reward</Space>} 
                  bordered={false} 
                  style={{ borderRadius: 16 }}
                >
                  <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
                    Client has <strong style={{ color: "var(--color-primary)" }}>{loyaltyPoints} points</strong> available.
                  </Typography.Paragraph>
                  <Space.Compact style={{ width: "100%" }}>
                    <InputNumber 
                      placeholder="Points to redeem" 
                      value={pointsToRedeem} 
                      onChange={setPointsToRedeem}
                      min={1}
                      max={loyaltyPoints}
                      style={{ width: "100%", height: 42, borderRadius: "8px 0 0 8px" }}
                      disabled={loyaltyPoints <= 0 || actionLoading}
                    />
                    <Button 
                      type="default" 
                      icon={<TrophyOutlined style={{ color: "var(--color-primary)" }} />} 
                      onClick={handleApplyPoints}
                      loading={actionLoading}
                      disabled={loyaltyPoints <= 0 || !pointsToRedeem}
                      style={{ height: 42 }}
                    >
                      Redeem
                    </Button>
                  </Space.Compact>
                </Card>

                {/* Cash Register Checkout Box */}
                <Card title="Record Checkout Payment" bordered={false} style={{ borderRadius: 16 }}>
                  <Form layout="vertical" disabled={actionLoading}>
                    <Form.Item label="Payment Method">
                      <Select
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                        options={[
                          { value: "cash", label: "Cash Payment" },
                          { value: "credit_card", label: "Credit Card (POS)" },
                          { value: "bank_transfer", label: "Bank Transfer QR" },
                        ]}
                        style={{ height: 42 }}
                      />
                    </Form.Item>
                    
                    <Form.Item label="Reference Code (Optional)">
                      <Input
                        placeholder="POS receipt or bank transaction Ref"
                        value={referenceCode}
                        onChange={(e) => setReferenceCode(e.target.value)}
                        style={{ height: 42, borderRadius: 8 }}
                      />
                    </Form.Item>

                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                      icon={<CreditCardOutlined />} 
                      onClick={handleRecordPayment}
                      loading={actionLoading}
                      className="login-button-gold"
                      style={{ height: 48, marginTop: 12 }}
                    >
                      Complete Checkout ({formatMoney(invoice.balance_due)})
                    </Button>
                  </Form>
                </Card>
              </>
            )}

            {invoice.status === "paid" && (
              <Card bordered={false} style={{ borderRadius: 16, textAlign: "center", padding: "16px 0" }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: "#10b981", marginBottom: 16 }} />
                <Typography.Title level={4} style={{ margin: 0, color: "#10b981" }}>
                  Invoice Paid Successfully
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                  The receipt is finalized and the appointment has been checked out and closed.
                </Typography.Paragraph>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* Add Incidental Modal */}
      <Modal
        title={
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
            Add Checkout Incidental
          </div>
        }
        open={isIncidentalOpen}
        onCancel={() => setIsIncidentalOpen(false)}
        onOk={() => incidentalForm.submit()}
        confirmLoading={actionLoading}
        destroyOnClose
      >
        <div style={{ padding: "8px 0" }}>
          <Form form={incidentalForm} layout="vertical" onFinish={handleAddIncidental} initialValues={{ quantity: 1, item_type: "service" }}>
            <Form.Item label="Incidental Type" name="item_type" required>
              <Select
                options={[
                  { value: "service", label: "Additional Service" },
                  { value: "product", label: "Retail Product Sale" },
                  { value: "other", label: "Other Fee" },
                ]}
                style={{ height: 40 }}
              />
            </Form.Item>

            <Form.Item label="Description" name="description" rules={[{ required: true, message: "Please input description" }]}>
              <Input placeholder="e.g. Premium Scalp Treatment, Shampoo Product" style={{ borderRadius: 8, height: 40 }} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Unit Price ($)" name="unit_price" rules={[{ required: true, message: "Please input unit price" }]}>
                  <InputNumber min={0.01} style={{ width: "100%", borderRadius: 8, height: 40 }} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please input quantity" }]}>
                  <InputNumber min={1} precision={0} style={{ width: "100%", borderRadius: 8, height: 40 }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
