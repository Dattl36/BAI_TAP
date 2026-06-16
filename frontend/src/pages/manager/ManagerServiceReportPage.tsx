import { Card, Table } from "antd";
import { ServicePieChart } from "../../components/charts/ServicePieChart";
import { useManagerDashboardData } from "../../hooks/queries/useManagerDashboardData";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

const columns = [
  { title: "Service Category", dataIndex: "label", key: "label", render: (t: string) => <strong>{t}</strong> },
  { title: "Completed Treatments", dataIndex: "value", key: "value", render: (val: number) => <span style={{ fontWeight: 600 }}>{val} treatments</span> }
];

export const ManagerServiceReportPage = () => {
  const { isLoading, isError, error, serviceReport, refetch } = useManagerDashboardData();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <Card title="Popular Treatment Categories" bordered={false} style={{ marginBottom: 24, height: 420 }}>
        <div style={{ height: 320 }}>
          <ServicePieChart data={serviceReport} />
        </div>
      </Card>

      <Card title="Category Session Audits" bordered={false}>
        {serviceReport.length > 0 ? (
          <Table dataSource={serviceReport} columns={columns} rowKey="label" pagination={false} size="middle" />
        ) : (
          <EmptyState description="No treatment categories logged." />
        )}
      </Card>
    </div>
  );
};
