import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { promotionsApi } from "../../api/promotions.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import type { Promotion } from "../../types/promotion";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

export const ManagerPromotionsPage = () => {
  const query = useQuery({
    queryKey: ["promotions", "list"],
    queryFn: () => promotionsApi.list(),
  });

  const columns: ColumnsType<Promotion> = [
    { title: "Campaign ID", dataIndex: "id", key: "id", render: (t) => <strong>#{t}</strong> },
    { title: "Campaign Name", dataIndex: "name", key: "name", render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Description", dataIndex: "description" },
    { title: "Discount Type", dataIndex: "discount_type", render: (val) => <span style={{ textTransform: "uppercase" }}>{val}</span> },
    { title: "Value", dataIndex: "discount_value" },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> }
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (
        <Table
          columns={columns}
          dataSource={getListItems(query.data)}
          loading={query.isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      )}
    </Card>
  );
};
