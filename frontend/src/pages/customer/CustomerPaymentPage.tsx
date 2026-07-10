import { ArrowLeftOutlined, CheckCircleFilled, CreditCardOutlined, GiftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input, Result, Space, Typography, message } from "antd";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { invoicesApi } from "../../api/invoices.api";
import { paymentsApi } from "../../api/payments.api";
import { vouchersApi } from "../../api/vouchers.api";
import { ErrorState } from "../../components/common/ErrorState";
import { PageLoading } from "../../components/common/PageLoading";
import { useMe } from "../../hooks/useMe";
import { getListItems } from "../../utils/apiResponse";

const formatMoney = (value: string | number | undefined | null) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;

const formatVoucherDiscount = (type: string, value: string | number) => {
  const amount = Number(value);
  if (type === "percent") return `${amount % 1 === 0 ? amount.toFixed(0) : amount}% OFF`;
  return `${amount.toLocaleString("vi-VN")} VNĐ OFF`;
};

const formatVoucherDate = (value?: string | null) => {
  if (!value) return "Không hết hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Không hết hạn" : date.toLocaleDateString("vi-VN");
};

export const CustomerPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useMe();
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucherSuggestions, setShowVoucherSuggestions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  const { data: invoice, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["invoices", "detail", id],
    queryFn: () => invoicesApi.detail(Number(id)),
    enabled: Boolean(id),
  });

  const { data: vouchersData, isLoading: isVouchersLoading } = useQuery({
    queryKey: ["vouchers", "payment-suggestions", id],
    queryFn: () => vouchersApi.list({ status: "active" }),
    enabled: Boolean(id),
  });

  const applyVoucherMutation = useMutation({
    mutationFn: (code: string) => invoicesApi.applyVoucher(Number(id), code),
    onSuccess: () => {
      void message.success("Áp dụng mã giảm giá thành công.");
      setVoucherCode("");
      setShowVoucherSuggestions(false);
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Không thể áp dụng mã giảm giá.";
      void message.error(errMsg);
    },
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error("Invoice not found");
      const amountDue = Number(invoice.balance_due || 0);
      const walletBalance = Number(currentUser?.customer_profile?.wallet_balance || 0);

      if (amountDue <= 0) {
        throw new Error("Hóa đơn này không còn số tiền cần thanh toán.");
      }

      if (paymentMethod === "wallet" && walletBalance < amountDue) {
        throw new Error("Số dư ví không đủ để thanh toán hóa đơn này.");
      }

      const payment = await paymentsApi.create({
        invoice: invoice.id,
        amount: invoice.balance_due,
        method: paymentMethod,
      });
      return paymentsApi.markSuccess(payment.id);
    },
    onSuccess: () => {
      void message.success("Thanh toán thành công.");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Thanh toán thất bại.";
      void message.error(errMsg);
    },
  });

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error} onRetry={refetch} />;
  if (!invoice) return <ErrorState message="Không tìm thấy hóa đơn." onRetry={refetch} />;

  const isPaid = ["paid", "cancelled"].includes(invoice.status);
  const customerId = currentUser?.customer_profile_id ? String(currentUser.customer_profile_id) : "";
  const availableVouchers = getListItems(vouchersData).filter((voucher) => {
    const now = new Date();
    const startsAt = voucher.starts_at ? new Date(voucher.starts_at) : null;
    const expiresAt = voucher.expires_at ? new Date(voucher.expires_at) : null;
    const isStarted = !startsAt || Number.isNaN(startsAt.getTime()) || startsAt <= now;
    const isNotExpired = !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt >= now;
    const hasUsageLeft = Number(voucher.used_count || 0) < Number(voucher.usage_limit || 0);
    const meetsMinInvoice = Number(invoice.subtotal || 0) >= Number(voucher.min_invoice || 0);
    const matchesCustomer = !voucher.customer || String(voucher.customer) === customerId;
    return voucher.status === "active" && isStarted && isNotExpired && hasUsageLeft && meetsMinInvoice && matchesCustomer;
  });

  const handleApplyVoucher = (code = voucherCode) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      void message.warning("Vui lòng nhập hoặc chọn một mã giảm giá.");
      return;
    }
    applyVoucherMutation.mutate(normalizedCode);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <Button type="text" onClick={() => navigate(-1)} style={{ color: "var(--color-primary-dark)", fontWeight: 500, paddingLeft: 0 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Quay lại
        </Button>
      </div>

      <Card bordered={false} style={{ border: "1px solid var(--app-border)", borderRadius: 16 }}>
        <Typography.Title level={3} style={{ margin: "0 0 24px", fontFamily: "'Outfit', sans-serif" }}>
          Cổng thanh toán an toàn
        </Typography.Title>

        {isPaid ? (
          <Result
            icon={<CheckCircleFilled style={{ color: "var(--color-primary)" }} />}
            title="Thanh toán hoàn tất"
            subTitle="Hóa đơn này đã được thanh toán hoặc đã bị hủy."
            extra={[
              <Link to="/customer/invoices" key="invoices">
                <Button type="primary" className="login-button-gold">
                  Xem lịch sử hóa đơn
                </Button>
              </Link>,
            ]}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "#faf8f5", padding: 20, borderRadius: 12 }}>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                Chi tiết dịch vụ
              </Typography.Title>

              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
                    <div>
                      <Typography.Text strong style={{ display: "block" }}>{item.description}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>Số lượng: {item.quantity}</Typography.Text>
                    </div>
                    <Typography.Text strong>{formatMoney(item.line_total)}</Typography.Text>
                  </div>
                ))
              ) : (
                <Typography.Text type="secondary">Chưa có dịch vụ nào trong hóa đơn.</Typography.Text>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Typography.Text>Tạm tính:</Typography.Text>
                  <Typography.Text>{formatMoney(invoice.subtotal)}</Typography.Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Typography.Text>Mã giảm giá:</Typography.Text>
                  <Typography.Text type="danger">-{formatMoney(invoice.discount_total)}</Typography.Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, borderBottom: "2px solid #e8e8e8", paddingBottom: 16 }}>
                  <Typography.Text>Điểm thưởng quy đổi:</Typography.Text>
                  <Typography.Text style={{ color: "var(--color-primary-dark)" }}>-{formatMoney(invoice.reward_discount)}</Typography.Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <Typography.Text strong style={{ fontSize: 18 }}>Còn phải thanh toán:</Typography.Text>
                  <Typography.Text strong style={{ fontSize: 24, color: "var(--color-primary-dark)" }}>
                    {formatMoney(invoice.balance_due)}
                  </Typography.Text>
                </div>
              </div>
            </div>

            <Card
              size="small"
              title={<><GiftOutlined /> Áp dụng Voucher</>}
              style={{
                borderRadius: 12,
                overflow: "visible",
                position: "relative",
                zIndex: showVoucherSuggestions ? 10 : 1,
                marginBottom: showVoucherSuggestions ? 188 : 0,
              }}
            >
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setShowVoucherSuggestions(true)}
                onMouseLeave={() => setShowVoucherSuggestions(false)}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập mã giảm giá của bạn"
                    value={voucherCode}
                    onFocus={() => setShowVoucherSuggestions(true)}
                    onChange={(event) => setVoucherCode(event.target.value)}
                    style={{ borderRadius: "8px 0 0 8px" }}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleApplyVoucher()}
                    loading={applyVoucherMutation.isPending}
                    disabled={!voucherCode.trim()}
                    style={{ borderRadius: "0 8px 8px 0", background: "var(--color-primary)" }}
                  >
                    Áp dụng
                  </Button>
                </Space.Compact>

                {showVoucherSuggestions && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 30,
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      padding: 10,
                      background: "#fff",
                      border: "1px solid var(--app-border)",
                      borderRadius: 10,
                      boxShadow: "0 12px 30px rgba(43, 36, 25, 0.14)",
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 12 }}>
                      Gợi ý voucher của bạn
                    </Typography.Text>
                    {isVouchersLoading ? (
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>Đang tải voucher...</Typography.Text>
                    ) : availableVouchers.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {availableVouchers.slice(0, 6).map((voucher) => (
                          <button
                            key={voucher.id}
                            type="button"
                            onClick={() => {
                              setVoucherCode(voucher.code);
                              setShowVoucherSuggestions(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 10px",
                              border: "1px dashed #d7bd82",
                              borderRadius: 8,
                              background: "#fffaf0",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                              <strong style={{ color: "#7d5a1e", fontFamily: "monospace", letterSpacing: "0.04em" }}>{voucher.code}</strong>
                              <span style={{ color: "var(--color-primary-dark)", fontWeight: 700, fontSize: 12 }}>
                                {formatVoucherDiscount(voucher.discount_type, voucher.discount_value)}
                              </span>
                            </div>
                            <div style={{ color: "var(--color-muted)", fontSize: 11 }}>
                              Đơn tối thiểu {formatMoney(voucher.min_invoice)} - HSD: {formatVoucherDate(voucher.expires_at)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                        Hiện chưa có voucher phù hợp với hóa đơn này.
                      </Typography.Text>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Card size="small" title={<><CreditCardOutlined /> Chọn phương thức thanh toán</>} style={{ borderRadius: 12, marginTop: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  onClick={() => setPaymentMethod("credit_card")}
                  style={{
                    padding: 16,
                    border: paymentMethod === "credit_card" ? "2px solid var(--color-primary)" : "1px solid #d9d9d9",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    background: paymentMethod === "credit_card" ? "#fffcf5" : "white",
                  }}
                >
                  <Typography.Text strong>Thẻ Ngân Hàng / Chuyển khoản</Typography.Text>
                  {paymentMethod === "credit_card" && <CheckCircleFilled style={{ color: "var(--color-primary)", fontSize: 18 }} />}
                </div>

                <div
                  onClick={() => setPaymentMethod("wallet")}
                  style={{
                    padding: 16,
                    border: paymentMethod === "wallet" ? "2px solid var(--color-primary)" : "1px solid #d9d9d9",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    background: paymentMethod === "wallet" ? "#fffcf5" : "white",
                  }}
                >
                  <div>
                    <Typography.Text strong style={{ display: "block" }}>Số dư Ví Salon</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Khả dụng: {formatMoney(currentUser?.customer_profile?.wallet_balance || 0)}
                    </Typography.Text>
                  </div>
                  {paymentMethod === "wallet" && <CheckCircleFilled style={{ color: "var(--color-primary)", fontSize: 18 }} />}
                </div>
              </div>
            </Card>

            <Button
              type="primary"
              size="large"
              icon={<CreditCardOutlined />}
              style={{ width: "100%", height: 50, fontSize: 16, borderRadius: 12, background: "#10b981", borderColor: "#10b981", marginTop: 8 }}
              loading={payMutation.isPending}
              onClick={() => payMutation.mutate()}
            >
              Tiến hành thanh toán
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
