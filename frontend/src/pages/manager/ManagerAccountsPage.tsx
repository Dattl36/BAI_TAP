import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { accountsApi } from "../../api/accounts.api";
import { ErrorState } from "../../components/common/ErrorState";
import { queryKeys } from "../../constants/queryKeys";
import type { Account } from "../../types/account";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

export const ManagerAccountsPage = () => {
  const query = useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: () => accountsApi.list(),
  });

  const columns: ColumnsType<Account> = [
    { title: "ID", dataIndex: "id", key: "id", render: (t) => <strong>#{t}</strong> },
    { title: "Username", dataIndex: "username", key: "username", render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Email Address", dataIndex: "email", key: "email" },
    { 
      title: "System Role", 
      dataIndex: "role", 
      key: "role",
      render: (role: string) => (
        <Tag color={role === "manager" ? "purple" : role === "receptionist" ? "blue" : role === "staff" ? "cyan" : "default"}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
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
