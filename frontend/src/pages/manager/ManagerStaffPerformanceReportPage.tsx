import { Card, Table, Rate } from "antd";
import { useManagerDashboardData } from "../../hooks/queries/useManagerDashboardData";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

const columns = [
  { title: "Stylist Specialist", dataIndex: "name", key: "name", render: (t: string) => <strong>{t}</strong> },
  { title: "Role", dataIndex: "role", key: "role" },
  { title: "Review Score", dataIndex: "score", key: "score", render: (s: number) => <Rate disabled defaultValue={s} allowHalf style={{ fontSize: 13, color: "var(--color-primary)" }} /> },
  { title: "Completed Sessions", dataIndex: "sessions", key: "sessions" },
  { title: "Stylist Commission", dataIndex: "commission", key: "commission", render: (text: string) => <span style={{ fontWeight: 600, color: "#10b981" }}>{text}</span> }
];

export const ManagerStaffPerformanceReportPage = () => {
  const { isLoading, isError, error, staffPerformanceReport, refetch } = useManagerDashboardData();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <Card title="Stylist Roster Commissions & Quality Metrics" bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      {staffPerformanceReport.length > 0 ? (
        <Table dataSource={staffPerformanceReport} columns={columns} rowKey="name" pagination={false} size="middle" />
      ) : (
        <EmptyState description="No stylist activity recorded in SQLite database." />
      )}
    </Card>
  );
};
