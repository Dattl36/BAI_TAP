import { useState, useMemo } from "react";
import { Card, Table, Rate, Input, Select, Row, Col, Tag, Tooltip } from "antd";
import { SearchOutlined, CommentOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import { feedbackApi } from "../../api/feedback.api";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { queryKeys } from "../../constants/queryKeys";
import type { Feedback } from "../../types/feedback";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

const FEEDBACK_STATUS: Record<string, { label: string; color: string }> = {
  received: { label: "Đã nhận", color: "blue" },
  responded: { label: "Đã phản hồi", color: "green" },
  archived: { label: "Lưu trữ", color: "default" },
};

const formatDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const ReceptionistFeedbackPage = () => {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);

  const query = useQuery({
    queryKey: queryKeys.feedback.list(),
    queryFn: () => feedbackApi.list(),
  });

  const all = getListItems(query.data);

  const filtered = useMemo(() => all.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q || String(f.id).includes(q) || String(f.customer).includes(q) || f.comment?.toLowerCase().includes(q);
    const matchRating = ratingFilter === undefined || f.rating === ratingFilter;
    return matchSearch && matchRating;
  }), [all, search, ratingFilter]);

  const columns = [
    {
      title: "Mã phản hồi",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (id: number | string) => (
        <span style={{ fontWeight: 700, color: "#b89a63", fontFamily: "'Outfit', monospace" }}>#PH-{id}</span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: 110,
      render: (val: number | string) => (
        <Tag color="geekblue" style={{ borderRadius: 6 }}>KH #{val}</Tag>
      ),
    },
    {
      title: "Lịch hẹn",
      dataIndex: "appointment",
      key: "appointment",
      width: 100,
      render: (val: number | string | null) =>
        val ? (
          <Tag style={{ borderRadius: 6 }}>#LH-{val}</Tag>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (r: number) =>
        r ? (
          <Rate disabled defaultValue={r} style={{ fontSize: 13, color: "var(--color-primary)" }} />
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      ellipsis: { showTitle: false },
      render: (text: string) =>
        text ? (
          <Tooltip title={text} placement="topLeft">
            <span style={{ color: "#374151", cursor: "default" }}>{text}</span>
          </Tooltip>
        ) : (
          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Không có nội dung</span>
        ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (val: string) => <span style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(val)}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const s = FEEDBACK_STATUS[status] ?? { label: status || "Đã nhận", color: "blue" };
        return (
          <Tag color={s.color} style={{ borderRadius: 20, fontWeight: 600, fontSize: 11, padding: "2px 10px" }}>
            {s.label}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, color: "#1f2937" }}>
          Ý kiến phản hồi khách hàng
        </h3>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
          Theo dõi và quản lý đánh giá, phản hồi từ khách hàng sau mỗi lần sử dụng dịch vụ
        </p>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder="Tìm theo mã, khách hàng hoặc nội dung..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ borderRadius: 10, height: 40 }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Lọc theo sao"
                value={ratingFilter}
                onChange={setRatingFilter}
                allowClear
                style={{ width: "100%", height: 40 }}
                options={[
                  { label: "⭐⭐⭐⭐⭐ 5 sao", value: 5 },
                  { label: "⭐⭐⭐⭐ 4 sao", value: 4 },
                  { label: "⭐⭐⭐ 3 sao", value: 3 },
                  { label: "⭐⭐ 2 sao", value: 2 },
                  { label: "⭐ 1 sao", value: 1 },
                ]}
              />
            </Col>
          </Row>
        </div>

        {query.isError ? (
          <div style={{ padding: 32 }}>
            <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
          </div>
        ) : filtered.length === 0 && !query.isLoading ? (
          <EmptyState description="Chưa có phản hồi nào từ khách hàng." />
        ) : (
          <Table<Feedback>
            dataSource={filtered}
            columns={columns}
            loading={query.isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `Tổng cộng ${t} phản hồi`,
              style: { padding: "16px 24px" },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <CommentOutlined style={{ fontSize: 40, color: "#d1d5db", marginBottom: 12 }} />
                  <div style={{ color: "#9ca3af" }}>Chưa có phản hồi nào</div>
                </div>
              ),
            }}
            size="middle"
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </div>
  );
};
