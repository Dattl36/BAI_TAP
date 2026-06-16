import { Card, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";

import { complaintsApi } from "../../api/complaints.api";
import { StatusTag } from "../../components/common/StatusTag";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { queryKeys } from "../../constants/queryKeys";
import type { Complaint } from "../../types/complaint";
import { getListItems } from "../../utils/apiResponse";

export const ReceptionistComplaintsPage = () => {
  const query = useQuery({
    queryKey: queryKeys.complaints.list(),
    queryFn: () => complaintsApi.list(),
  });

  const disputes = getListItems(query.data);

  const columns = [
    {
      title: "Complaint Code",
      dataIndex: "id",
      key: "id",
      render: (id: number | string) => <span>#DIS-{id}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (val: number | string) => <span>Customer #{val}</span>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Tag color="volcano">{text}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <Card variant="borderless" style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      {query.isError ? (
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      ) : disputes.length === 0 && !query.isLoading ? (
        <EmptyState description="No complaints on record." />
      ) : (
        <Table
          dataSource={disputes}
          columns={columns}
          loading={query.isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      )}
    </Card>
  );
};
