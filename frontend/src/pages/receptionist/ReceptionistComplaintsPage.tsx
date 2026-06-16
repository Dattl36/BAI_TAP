import { useState, useMemo } from "react";
import {
  Card, Table, Tag, Button, Input, Select, Row, Col, Typography, Space,
  Drawer, Descriptions, App, Tooltip, Statistic, Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, EyeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { complaintsApi } from "../../api/complaints.api";
import { useMe } from "../../hooks/useMe";
import { ErrorState } from "../../components/common/ErrorState";
import { queryKeys } from "../../constants/queryKeys";
import type { Complaint } from "../../types/complaint";
import { getListItems } from "../../utils/apiResponse";

// ─── Status helpers ────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  received: "Đã nhận",
  assigned: "Đã tiếp nhận",
  in_review: "Đang xử lý",
  escalated: "Đã leo thang",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
  rejected: "Từ chối",
};

const STATUS_COLORS: Record<string, string> = {
  received: "blue",
  assigned: "cyan",
  in_review: "orange",
  escalated: "red",
  resolved: "green",
  closed: "default",
  rejected: "volcano",
};

const formatDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const ReceptionistComplaintsPage = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { data: currentUser } = useMe();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.complaints.list(),
    queryFn: () => complaintsApi.list(),
  });

  const all = getListItems(query.data);

  // Stats
  const total = all.length;
  const pending = all.filter((c) => c.status === "received").length;
  const inProgress = all.filter((c) => c.status === "in_review" || c.status === "assigned").length;
  const resolved = all.filter((c) => c.status === "resolved" || c.status === "closed").length;

  // Filter
  const filtered = useMemo(() => all.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(c.id).includes(q) ||
      String(c.customer).includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [all, search, statusFilter]);

  // Assign to self mutation (received → assigned)
  const assignMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      complaintsApi.assign(id, currentUser!.id, "Lễ tân tự tiếp nhận khiếu nại."),
    onSuccess: () => {
      void message.success("Đã tiếp nhận khiếu nại thành công.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.complaints.list() });
    },
    onError: () => void message.error("Không thể tiếp nhận. Vui lòng thử lại."),
  });

  // Resolve mutation (assigned / in_review / escalated → resolved)
  const resolveMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      complaintsApi.resolve(id, "Đã xử lý và giải quyết bởi lễ tân."),
    onSuccess: () => {
      void message.success("Đã đánh dấu khiếu nại là giải quyết xong.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.complaints.list() });
    },
    onError: () => void message.error("Không thể cập nhật. Vui lòng thử lại."),
  });

  const closeMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      complaintsApi.close(id, "Khiếu nại đã được đóng bởi lễ tân."),
    onSuccess: () => {
      void message.success("Đã đóng khiếu nại.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.complaints.list() });
    },
    onError: () => void message.error("Không thể đóng khiếu nại. Vui lòng thử lại."),
  });

  const openDetail = (record: Complaint) => {
    setSelectedComplaint(record);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<Complaint> = [
    {
      title: "Mã khiếu nại",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (id: number | string) => (
        <span style={{ fontWeight: 700, color: "#b89a63", fontFamily: "'Outfit', monospace" }}>
          #KN-{id}
        </span>
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
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span style={{ fontWeight: 600, color: "#1f2937", cursor: "default" }}>
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 260,
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span style={{ color: "#6b7280", cursor: "default" }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (val: string) => (
        <span style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(val)}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => (
        <Tag
          color={STATUS_COLORS[status] ?? "default"}
          style={{ borderRadius: 20, fontWeight: 600, fontSize: 11, padding: "2px 10px" }}
        >
          {STATUS_LABELS[status] ?? status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: unknown, record: Complaint) => (
        <Space size={4} wrap>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
            style={{ borderRadius: 6, background: "#b89a63", borderColor: "#b89a63", fontSize: 11 }}
          >
            Chi tiết
          </Button>

          {/* received → assign to self first */}
          {record.status === "received" && (
            <Popconfirm
              title="Tiếp nhận khiếu nại"
              description="Bạn xác nhận tiếp nhận khiếu nại này?"
              okText="Xác nhận"
              cancelText="Hủy"
              onConfirm={() => assignMutation.mutate({ id: Number(record.id) })}
            >
              <Button
                size="small"
                icon={<UserAddOutlined />}
                loading={assignMutation.isPending}
                style={{ borderRadius: 6, borderColor: "#6366f1", color: "#6366f1", fontSize: 11 }}
              >
                Tiếp nhận
              </Button>
            </Popconfirm>
          )}

          {/* assigned / in_review / escalated → resolve */}
          {(record.status === "assigned" || record.status === "in_review" || record.status === "escalated") && (
            <Button
              size="small"
              style={{ borderRadius: 6, borderColor: "#10b981", color: "#10b981", fontSize: 11 }}
              loading={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ id: Number(record.id) })}
            >
              Giải quyết
            </Button>
          )}

          {/* resolved → close */}
          {record.status === "resolved" && (
            <Button
              size="small"
              style={{ borderRadius: 6, fontSize: 11 }}
              loading={closeMutation.isPending}
              onClick={() => closeMutation.mutate({ id: Number(record.id) })}
            >
              Đóng
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title
          level={3}
          style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "#1f2937" }}
        >
          Quản lý khiếu nại
        </Typography.Title>
        <Typography.Text style={{ color: "#6b7280", fontSize: 14 }}>
          Theo dõi, tiếp nhận và xử lý phản ánh của khách hàng
        </Typography.Text>
      </div>

      {/* ── Stats Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Tổng khiếu nại", value: total, icon: <FileTextOutlined />, color: "#b89a63", bg: "#fdf6ec" },
          { label: "Chờ xử lý", value: pending, icon: <ClockCircleOutlined />, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Đang xử lý", value: inProgress, icon: <ExclamationCircleOutlined />, color: "#6366f1", bg: "#eef2ff" },
          { label: "Đã giải quyết", value: resolved, icon: <CheckCircleOutlined />, color: "#10b981", bg: "#ecfdf5" },
        ].map((s) => (
          <Col xs={12} lg={6} key={s.label}>
            <Card
              bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <Statistic
                    value={query.isLoading ? "—" : s.value}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: "#1f2937", fontFamily: "'Outfit', sans-serif" }}
                  />
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "grid", placeItems: "center", fontSize: 20, color: s.color }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Main Table Card ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={10} md={9}>
              <Input
                placeholder="Tìm theo mã, khách hàng hoặc tiêu đề..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ borderRadius: 10, height: 40 }}
              />
            </Col>
            <Col xs={24} sm={7} md={6}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: "100%", height: 40 }}
                options={[
                  { label: "Tất cả", value: undefined },
                  { label: "Đã nhận", value: "received" },
                  { label: "Đã tiếp nhận", value: "assigned" },
                  { label: "Đang xử lý", value: "in_review" },
                  { label: "Đã leo thang", value: "escalated" },
                  { label: "Đã giải quyết", value: "resolved" },
                  { label: "Đã đóng", value: "closed" },
                  { label: "Từ chối", value: "rejected" },
                ]}
              />
            </Col>
            <Col xs={24} sm={7} md={9}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => { setSearch(""); setStatusFilter(undefined); }}
                  style={{ borderRadius: 10, height: 40 }}
                >
                  Đặt lại
                </Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  style={{ borderRadius: 10, height: 40, background: "#b89a63", borderColor: "#b89a63" }}
                >
                  Tìm kiếm
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Table */}
        {query.isError ? (
          <div style={{ padding: 32 }}>
            <ErrorState message={query.error} onRetry={() => void query.refetch()} />
          </div>
        ) : (
          <Table<Complaint>
            dataSource={filtered}
            columns={columns}
            loading={query.isLoading}
            rowKey="id"
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} khiếu nại`,
              style: { padding: "16px 24px" },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <ExclamationCircleOutlined style={{ fontSize: 40, color: "#d1d5db", marginBottom: 12 }} />
                  <div style={{ color: "#9ca3af", fontWeight: 500 }}>Chưa có khiếu nại nào</div>
                </div>
              ),
            }}
            size="middle"
            style={{ borderRadius: "0 0 20px 20px" }}
          />
        )}
      </Card>

      {/* ── Detail Drawer ── */}
      <Drawer
        title={
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 16 }}>
            Chi tiết khiếu nại{" "}
            <span style={{ color: "#b89a63" }}>
              #KN-{selectedComplaint?.id}
            </span>
          </span>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          selectedComplaint && (
            <Tag
              color={STATUS_COLORS[selectedComplaint.status] ?? "default"}
              style={{ borderRadius: 20, fontWeight: 600, padding: "3px 12px" }}
            >
              {STATUS_LABELS[selectedComplaint.status] ?? selectedComplaint.status}
            </Tag>
          )
        }
      >
        {selectedComplaint && (
          <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, color: "#374151", width: 130 }}>
            <Descriptions.Item label="Mã khiếu nại">
              <span style={{ fontWeight: 700, color: "#b89a63" }}>#KN-{selectedComplaint.id}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              KH #{selectedComplaint.customer}
            </Descriptions.Item>
            {selectedComplaint.appointment && (
              <Descriptions.Item label="Lịch hẹn liên quan">
                #LH-{selectedComplaint.appointment}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tiêu đề">
              <span style={{ fontWeight: 600 }}>{selectedComplaint.title}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <span style={{ whiteSpace: "pre-wrap", color: "#374151" }}>{selectedComplaint.description}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(selectedComplaint.created_at)}
            </Descriptions.Item>
            {selectedComplaint.resolution && (
              <Descriptions.Item label="Kết quả xử lý">
                <span style={{ color: "#10b981", fontWeight: 500 }}>{selectedComplaint.resolution}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {/* Action buttons in drawer — mirror the same transition rules */}
        {selectedComplaint && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Step 1: Tiếp nhận (received → assigned) */}
            {selectedComplaint.status === "received" && (
              <Popconfirm
                title="Tiếp nhận khiếu nại"
                description="Bạn xác nhận tiếp nhận khiếu nại này?"
                okText="Xác nhận"
                cancelText="Hủy"
                onConfirm={() => {
                  assignMutation.mutate({ id: Number(selectedComplaint.id) });
                  setDrawerOpen(false);
                }}
              >
                <Button
                  block
                  icon={<UserAddOutlined />}
                  loading={assignMutation.isPending}
                  style={{ borderRadius: 10, height: 42, borderColor: "#6366f1", color: "#6366f1" }}
                >
                  Tiếp nhận khiếu nại
                </Button>
              </Popconfirm>
            )}

            {/* Step 2: Giải quyết (assigned / in_review / escalated → resolved) */}
            {(selectedComplaint.status === "assigned" ||
              selectedComplaint.status === "in_review" ||
              selectedComplaint.status === "escalated") && (
              <Button
                block
                style={{ borderRadius: 10, height: 42, borderColor: "#10b981", color: "#10b981" }}
                loading={resolveMutation.isPending}
                onClick={() => {
                  resolveMutation.mutate({ id: Number(selectedComplaint.id) });
                  setDrawerOpen(false);
                }}
              >
                Đánh dấu đã giải quyết
              </Button>
            )}

            {/* Step 3: Đóng (resolved → closed) */}
            {selectedComplaint.status === "resolved" && (
              <Button
                block
                style={{ borderRadius: 10, height: 42 }}
                loading={closeMutation.isPending}
                onClick={() => {
                  closeMutation.mutate({ id: Number(selectedComplaint.id) });
                  setDrawerOpen(false);
                }}
              >
                Đóng khiếu nại
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
