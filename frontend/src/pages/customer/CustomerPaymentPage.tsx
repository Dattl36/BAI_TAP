import { Card, Descriptions, Typography, Button, Space, Input, message, Form, Result } from "antd";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftOutlined, GiftOutlined, CreditCardOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { invoicesApi } from "../../api/invoices.api";
import { paymentsApi } from "../../api/payments.api";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";

export const CustomerPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [voucherCode, setVoucherCode] = useState("");

  const { data: invoice, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["invoices", "detail", id],
    queryFn: () => invoicesApi.detail(Number(id)),
    enabled: Boolean(id),
  });

  const applyVoucherMutation = useMutation({
    mutationFn: (code: string) => invoicesApi.applyVoucher(Number(id), code),
    onSuccess: () => {
      void message.success("Áp dụng mã giảm giá thành công!");
      setVoucherCode("");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || err.response?.data?.message || "Không thể áp dụng mã giảm giá.";
      void message.error(errMsg);
    }
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error("Invoice not found");
      const payment = await paymentsApi.create({
        invoice: invoice.id,
        amount: invoice.total_due,
        method: "credit_card",
      });
      return paymentsApi.markSuccess(payment.id);
    },
    onSuccess: () => {
      void message.success("Thanh toán thành công!");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || err.response?.data?.message || "Thanh toán thất bại.";
      void message.error(errMsg);
    }
  });

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error} onRetry={refetch} />;
  if (!invoice) return <ErrorState message="Không tìm thấy hóa đơn." onRetry={refetch} />;

  const isPaid = ["paid", "cancelled"].includes(invoice.status);

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
              </Link>
            ]}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "#faf8f5", padding: 20, borderRadius: 12 }}>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>Chi tiết dịch vụ</Typography.Title>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
                    <div>
                      <Typography.Text strong style={{ display: "block" }}>{item.description}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>Số lượng: {item.quantity}</Typography.Text>
                    </div>
                    <Typography.Text strong>{Number(item.line_total).toLocaleString("vi-VN")} VNĐ</Typography.Text>
                  </div>
                ))
              ) : (
                <Typography.Text type="secondary">Chưa có dịch vụ nào trong hóa đơn.</Typography.Text>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Typography.Text>Tạm tính:</Typography.Text>
                  <Typography.Text>{Number(invoice.subtotal).toLocaleString("vi-VN")} VNĐ</Typography.Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Typography.Text>Mã giảm giá:</Typography.Text>
                  <Typography.Text type="danger">-{Number(invoice.discount_total).toLocaleString("vi-VN")} VNĐ</Typography.Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, borderBottom: "2px solid #e8e8e8", paddingBottom: 16 }}>
                  <Typography.Text>Điểm thưởng quy đổi:</Typography.Text>
                  <Typography.Text style={{ color: "var(--color-primary-dark)" }}>-{Number(invoice.reward_discount).toLocaleString("vi-VN")} VNĐ</Typography.Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography.Text strong style={{ fontSize: 18 }}>Tổng thanh toán:</Typography.Text>
                  <Typography.Text strong style={{ fontSize: 24, color: "var(--color-primary-dark)" }}>
                    {Number(invoice.total_due).toLocaleString("vi-VN")} VNĐ
                  </Typography.Text>
                </div>
              </div>
            </div>

            <Card size="small" title={<><GiftOutlined /> Áp dụng Voucher</>} style={{ borderRadius: 12 }}>
              <Space.Compact style={{ width: "100%" }}>
                <Input 
                  placeholder="Nhập mã giảm giá của bạn" 
                  value={voucherCode} 
                  onChange={(e) => setVoucherCode(e.target.value)}
                  style={{ borderRadius: "8px 0 0 8px" }}
                />
                <Button 
                  type="primary" 
                  onClick={() => applyVoucherMutation.mutate(voucherCode)} 
                  loading={applyVoucherMutation.isPending}
                  disabled={!voucherCode}
                  style={{ borderRadius: "0 8px 8px 0", background: "var(--color-primary)" }}
                >
                  Áp dụng
                </Button>
              </Space.Compact>
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
