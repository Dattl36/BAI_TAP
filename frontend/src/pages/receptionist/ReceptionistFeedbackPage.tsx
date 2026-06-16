import { Card, Table, Rate } from "antd";
import { useQuery } from "@tanstack/react-query";

import { feedbackApi } from "../../api/feedback.api";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { queryKeys } from "../../constants/queryKeys";
import type { Feedback } from "../../types/feedback";
import { getListItems } from "../../utils/apiResponse";

export const ReceptionistFeedbackPage = () => {
  const query = useQuery({
    queryKey: queryKeys.feedback.list(),
    queryFn: () => feedbackApi.list(),
  });

  const feedbackData = getListItems(query.data);

  const columns = [
    {
      title: "Feedback ID",
      dataIndex: "id",
      key: "id",
      render: (id: number | string) => <span>#FB-{id}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (val: number | string) => <span>Customer #{val}</span>,
    },
    {
      title: "Appointment",
      dataIndex: "appointment",
      key: "appointment",
      render: (val: number | string | null) => val ? <span>Appt #{val}</span> : <span style={{ color: "var(--color-muted)" }}>—</span>,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (r: number) =>
        r ? <Rate disabled defaultValue={r} style={{ fontSize: 13, color: "var(--color-primary)" }} /> : <span>—</span>,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (text: string) => text || <span style={{ color: "var(--color-muted)" }}>No comment</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ textTransform: "capitalize", color: status === "responded" ? "#10b981" : "inherit" }}>
          {status || "received"}
        </span>
      ),
    },
  ];

  return (
    <Card variant="borderless" style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      {query.isError ? (
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      ) : feedbackData.length === 0 && !query.isLoading ? (
        <EmptyState description="No customer feedback submitted yet." />
      ) : (
        <Table
          dataSource={feedbackData}
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
