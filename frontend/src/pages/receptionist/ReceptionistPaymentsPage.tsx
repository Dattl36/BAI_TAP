import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";

import { paymentsApi } from "../../api/payments.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { Payment } from "../../types/payment";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";

export const ReceptionistPaymentsPage = () => {
  const [searchText, setSearchText] = useState("");

  const query = useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentsApi.list(),
  });

  const columns: ColumnsType<Payment> = [
    { title: "Transaction ID", dataIndex: "id", key: "id", render: (text) => <span>#TX-{text}</span> },
    { title: "Invoice ID", dataIndex: "invoice", key: "invoice", render: (text) => <span>#INV-{text}</span> },
    { title: "Amount Paid", dataIndex: "amount", key: "amount", render: (val) => formatMoney(val) },
    { title: "Method", dataIndex: "method", render: (val) => <span style={{ textTransform: "capitalize" }}>{val}</span> },
    { title: "Reference Code", dataIndex: "reference_code" },
    { title: "Status", dataIndex: "status", key: "status", render: (status?: string) => <StatusTag status={status} /> },
  ];

  const allPayments = getListItems(query.data);
  const filtered = allPayments.filter((item) => {
    return !searchText || String(item.id).includes(searchText) || String(item.reference_code).toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <Card bordered={false} style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}>
      <div className="table-toolbar">
        <Input
          placeholder="Search transaction reference..."
          prefix={<SearchOutlined style={{ color: "var(--color-muted)" }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="table-search-input"
          allowClear
          style={{ width: 320, borderRadius: 8, height: 38 }}
        />
      </div>

      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          loading={query.isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      )}
    </Card>
  );
};
