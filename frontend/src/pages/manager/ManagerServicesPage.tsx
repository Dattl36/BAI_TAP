import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { servicesApi } from "../../api/services.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { SalonService } from "../../types/service";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";

export const ManagerServicesPage = () => {
  const query = useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: () => servicesApi.list(),
  });

  const columns: ColumnsType<SalonService> = [
    { title: "Service Name", dataIndex: "name", key: "name", render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: "Category", dataIndex: "category" },
    { title: "Duration", dataIndex: "duration_minutes", render: (val) => `${val} Mins` },
    { title: "Base Price", dataIndex: "base_price", render: (val) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{formatMoney(val)}</span> },
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
