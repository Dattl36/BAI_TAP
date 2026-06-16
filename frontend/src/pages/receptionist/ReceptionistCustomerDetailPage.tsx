import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Table, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import { customersApi } from "../../api/customers.api";
import { appointmentsApi } from "../../api/appointments.api";
import { StatusTag } from "../../components/common/StatusTag";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { queryKeys } from "../../constants/queryKeys";
import type { Appointment } from "../../types/appointment";
import { getListItems } from "../../utils/apiResponse";
import { formatDateTime } from "../../utils/date";

export const ReceptionistCustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const customerQuery = useQuery({
    queryKey: queryKeys.customers.detail(id ?? ""),
    queryFn: () => customersApi.detail(id!),
    enabled: !!id,
  });

  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list({ customer: id }),
    queryFn: () => appointmentsApi.list({ customer: id, ordering: "-scheduled_start" }),
    enabled: !!id,
  });

  const customer = customerQuery.data;
  const bookingHistory = getListItems(appointmentsQuery.data);

  // Define column typings for Appointment records
  const columns: ColumnsType<Appointment> = [
    {
      title: "Booking Code",
      dataIndex: "id",
      key: "id",
      render: (text: number | string) => <strong>#{text}</strong>,
    },
    {
      title: "Scheduled Start",
      dataIndex: "scheduled_start",
      key: "scheduled_start",
      render: (value) => formatDateTime(value),
    },
    {
      title: "Scheduled End",
      dataIndex: "scheduled_end",
      key: "scheduled_end",
      render: (value) => formatDateTime(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/receptionist/customers" style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Back to Guest Registry
        </Link>
      </div>

      {customerQuery.isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      )}

      {customerQuery.isError && (
        <ErrorState message={customerQuery.error} onRetry={() => void customerQuery.refetch()} />
      )}

      {customer && (
        <Card variant="borderless" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Descriptions
            title="Client Core Account Details"
            bordered
            column={1}
            labelStyle={{ fontWeight: 600, width: 220 }}
            contentStyle={{ background: "#faf8f5" }}
          >
            <Descriptions.Item label="Full Name">{customer.full_name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Phone Line">{customer.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label="Email Account">{customer.email || "—"}</Descriptions.Item>
            <Descriptions.Item label="Account Status">
              <StatusTag status={customer.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Preferences">{customer.preferences || "—"}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="Appointment History" variant="borderless" style={{ borderRadius: 16 }}>
        {appointmentsQuery.isError ? (
          <ErrorState message={appointmentsQuery.error} onRetry={() => void appointmentsQuery.refetch()} />
        ) : bookingHistory.length === 0 && !appointmentsQuery.isLoading ? (
          <EmptyState description="No appointment history found for this client." />
        ) : (
          <Table<Appointment>
            dataSource={bookingHistory}
            columns={columns}
            loading={appointmentsQuery.isLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};
