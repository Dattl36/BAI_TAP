import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { employeesApi } from "../../api/employees.api";
import { ErrorState } from "../../components/common/ErrorState";
import { queryKeys } from "../../constants/queryKeys";
import type { Employee } from "../../types/employee";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

export const ManagerEmployeesPage = () => {
  const query = useQuery({
    queryKey: ["employees", "list"] as const,
    queryFn: () => employeesApi.list(),
  });

  const columns: ColumnsType<Employee> = [
    { title: "stylist Code", dataIndex: "code", key: "code", render: (t) => <strong>#{t || "ST"}</strong> },
    { title: "Specialist Name", dataIndex: "full_name", key: "full_name", render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Phone Line", dataIndex: "phone" },
    { 
      title: "Active Specialty", 
      dataIndex: "specialty", 
      key: "specialty",
      render: (val?: string) => <Tag color="gold">{val || "Stylist"}</Tag>
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
