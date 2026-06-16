import { Card, Table } from "antd";
import { AppointmentBarChart } from "../../components/charts/AppointmentBarChart";
import { useManagerDashboardData } from "../../hooks/queries/useManagerDashboardData";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

const columns = [
  { title: "Day of Week", dataIndex: "label", key: "label", render: (t: string) => <strong>{t}</strong> },
  { title: "Bookings Received", dataIndex: "count", key: "count", render: (val: number) => <span style={{ fontWeight: 600 }}>{val} sessions</span> }
];

export const ManagerAppointmentReportPage = () => {
  const { isLoading, isError, error, appointmentReport, refetch } = useManagerDashboardData();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <Card title="Daily Booking Traffic" bordered={false} style={{ marginBottom: 24, height: 420 }}>
        <div style={{ height: 320 }}>
          <AppointmentBarChart data={appointmentReport.dailySeries} />
        </div>
      </Card>

      <Card title="Daily Sessions Registry" bordered={false}>
        {appointmentReport.dailySeries.length > 0 ? (
          <Table dataSource={appointmentReport.dailySeries} columns={columns} rowKey="label" pagination={false} size="middle" />
        ) : (
          <EmptyState description="No appointment records found." />
        )}
      </Card>
    </div>
  );
};
