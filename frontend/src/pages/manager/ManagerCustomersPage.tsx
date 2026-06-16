import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { customersApi } from "../../api/customers.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { Customer } from "../../types/customer";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

export const ManagerCustomersPage = () => {
  const query = useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: () => customersApi.list(),
  });

  const columns: ColumnsType<Customer> = [
    { title: "Code", dataIndex: "code", key: "code", render: (t) => <strong>#{t || "CUST"}</strong> },
    { title: "Client Name", dataIndex: "full_name", key: "full_name", render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Phone Line", dataIndex: "phone" },
    { title: "Email Account", dataIndex: "email" },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <StatusTag status={s} /> }
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
