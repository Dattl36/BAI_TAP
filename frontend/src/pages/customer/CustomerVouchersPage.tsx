import { Card, Col, Row, Typography, Button, message, Spin } from "antd";
import { GiftOutlined, CopyOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { vouchersApi } from "../../api/vouchers.api";
import { normalizePaginatedResponse } from "../../utils/apiResponse";
import { ErrorState } from "../../components/common/ErrorState";

export const CustomerVouchersPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["vouchers", "list"],
    queryFn: () => vouchersApi.list(),
  });

  const handleCopy = (code: string) => {
    void navigator.clipboard.writeText(code);
    void message.success(`Voucher code "${code}" copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <Card bordered={false} style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Opening voucher wallet..." />
      </Card>
    );
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const vouchersList = normalizePaginatedResponse(data || []).results;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0 }}>
          Your Voucher Wallet
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Redeem coupon codes at checkout or copy them to apply on online booking reserves.
        </Typography.Paragraph>
      </div>

      {vouchersList.length > 0 ? (
        <Row gutter={[24, 24]}>
          {vouchersList.map((v) => {
            const isPercent = v.discount_type === "percent";
            const discountLabel = isPercent 
              ? `${v.discount_value}% OFF` 
              : `${Number(v.discount_value).toLocaleString()} VND OFF`;

            return (
              <Col xs={24} md={12} lg={8} key={v.id}>
                <Card 
                  bordered={false} 
                  hoverable
                  style={{ 
                    borderRadius: 16, 
                    border: "1px dashed var(--color-primary)",
                    background: "var(--color-surface)",
                    textAlign: "center"
                  }}
                >
                  <GiftOutlined style={{ fontSize: 32, color: "var(--color-primary)", marginBottom: 16 }} />
                  
                  <Typography.Title level={3} style={{ margin: "0 0 4px", color: "var(--color-primary-dark)", fontFamily: "'Outfit', sans-serif" }}>
                    {discountLabel}
                  </Typography.Title>
                  
                  <Typography.Title level={5} style={{ margin: "0 0 12px", fontWeight: 600 }}>
                    {v.min_invoice ? `Min Invoice: ${Number(v.min_invoice).toLocaleString()} VND` : "No Minimum Invoice"}
                  </Typography.Title>
                  
                  <Typography.Paragraph type="secondary" style={{ fontSize: 13, minHeight: 40, margin: "0 0 16px" }}>
                    Redeem this code at checkout to claim your self-care promotional discount.
                  </Typography.Paragraph>
                  
                  <div 
                    style={{ 
                      background: "var(--color-accent)", 
                      padding: "8px", 
                      borderRadius: 8, 
                      fontFamily: "monospace", 
                      fontWeight: 700, 
                      fontSize: 14,
                      letterSpacing: "0.1em",
                      color: "var(--color-primary-dark)",
                      marginBottom: 16,
                      border: "1px solid var(--app-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer"
                    }}
                    onClick={() => handleCopy(v.code)}
                  >
                    {v.code}
                    <CopyOutlined style={{ fontSize: 12, color: "var(--color-muted)" }} />
                  </div>

                  <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                    Valid Until: {v.expires_at ? new Date(v.expires_at).toLocaleDateString() : "Never"}
                  </Typography.Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card bordered={false} style={{ textAlign: "center", padding: "60px 0", borderRadius: 16, border: "1px dashed var(--color-primary)" }}>
          <GiftOutlined style={{ fontSize: 48, color: "var(--color-primary)", marginBottom: 16, opacity: 0.7 }} />
          <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, margin: "0 0 8px" }}>
            Voucher Wallet is Empty
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
            You don't have any active discount vouchers at the moment. Keep an eye out for our upcoming seasonal pampering events!
          </Typography.Paragraph>
          <Link to="/customer/book">
            <Button type="primary" className="login-button-gold">
              Book a Service
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
