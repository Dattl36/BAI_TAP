import { Card, Table } from "antd";
import { RevenueLineChart } from "../../components/charts/RevenueLineChart";
import { useManagerDashboardData } from "../../hooks/queries/useManagerDashboardData";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

const columns = [
  { title: "Period / Date", dataIndex: "week", key: "week", render: (t: string) => <strong>{t}</strong> },
  { title: "Gross Styling Sales", dataIndex: "sales", key: "sales" },
  { title: "Vouchers & Reward Offsets", dataIndex: "discounts", key: "discounts" },
  { title: "Net Salon Revenue", dataIndex: "net", key: "net", render: (text: string) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{text}</span> }
];

export const ManagerRevenueReportPage = () => {
  const { isLoading, isError, error, revenueReport, refetch } = useManagerDashboardData();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <Card title="Revenue Stream Trends" bordered={false} style={{ marginBottom: 24, height: 420 }}>
        <div style={{ height: 320 }}>
          <RevenueLineChart data={revenueReport.dailySeries} />
        </div>
      </Card>

      <Card title="Revenue Stream Detailed Ledger" bordered={false}>
        {revenueReport.cashflowRows.length > 0 ? (
          <Table dataSource={revenueReport.cashflowRows} columns={columns} rowKey="week" pagination={false} size="middle" />
        ) : (
          <EmptyState description="No financial transactions recorded in SQLite database." />
        )}
      </Card>
    </div>
  );
};
