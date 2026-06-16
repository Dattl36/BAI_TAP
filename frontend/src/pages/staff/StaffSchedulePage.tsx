import React, { useState } from "react";
import { Card, Table, Button, Space, Typography, message, Tooltip } from "antd";
import { 
  PlayCircleOutlined, 
  ScissorOutlined, 
  EyeOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { stylistApi } from "../../api/stylist.api";
import { queryKeys } from "../../constants/queryKeys";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { StatusBadge } from "../../components/staff/StatusBadge";
import { EmptyState } from "../../components/staff/EmptyState";
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";
import { BookingDetailModal } from "../../components/staff/BookingDetailModal";

export const StaffSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = dayjs().format("YYYY-MM-DD");

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch today's appointments for this stylist
  const scheduleQuery = useQuery({
    queryKey: queryKeys.appointments.list({ date: today, timeline: true }),
    queryFn: () => stylistApi.getMyTodayAppointments(),
  });

  const todaySchedule = getListItems(scheduleQuery.data);

  // Start service mutation
  const startMutation = useMutation({
    mutationFn: (appointmentId: string | number) => stylistApi.startService(appointmentId),
    onSuccess: (data) => {
      void message.success("Đã bắt đầu ca phục vụ thành công!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.serviceExecutions.all });
      navigate(`/staff/executions/${data.appointment}`);
    },
    onError: (err) => {
      void message.error(`Không thể bắt đầu phục vụ: ${getErrorMessage(err)}`);
    }
  });

  const handleStartService = (appointmentId: string | number) => {
    startMutation.mutate(appointmentId);
  };

  const showBookingDetails = (record: any) => {
    setSelectedBooking(record);
    setIsDetailOpen(true);
  };

  const columns = [
    {
      title: "Khung giờ",
      key: "time_slot",
      width: 140,
      render: (_: unknown, record: any) => (
        <span style={{ fontSize: 14 }}>
          <strong>{dayjs(record.scheduled_start).format("HH:mm")}</strong>
          <span style={{ color: "var(--color-muted)", fontSize: 12, marginLeft: 4 }}>
            - {dayjs(record.scheduled_end).format("HH:mm")}
          </span>
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer_info",
      render: (_: unknown, record: any) => {
        const name = record.customer_details?.full_name || `Khách hàng #${record.customer}`;
        const phone = record.customer_details?.phone || "Không có SĐT";
        return (
          <Space direction="vertical" size={0}>
            <strong style={{ fontSize: 14 }}>{name}</strong>
            <span style={{ fontSize: 12, color: "var(--color-muted)" }}>SĐT: {phone}</span>
          </Space>
        );
      },
    },
    {
      title: "Dịch vụ chính thực hiện",
      key: "service_info",
      render: (_: unknown, record: any) => {
        const name = record.service_details?.name || "Dịch vụ đã chọn";
        const duration = record.service_details?.duration || 45;
        return (
          <Space direction="vertical" size={0}>
            <span>{name}</span>
            <span style={{ fontSize: 11, color: "var(--color-muted)" }}>Thời lượng dự kiến: {duration} phút</span>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <StatusBadge status={s} />,
    },
    {
      title: "Hành động tác vụ",
      key: "actions",
      width: 200,
      render: (_: unknown, record: any) => (
        <Space size={8}>
          <Tooltip title="Xem chi tiết">
            <Button 
              shape="circle" 
              icon={<EyeOutlined />} 
              onClick={() => showBookingDetails(record)}
            />
          </Tooltip>

          {record.status === "arrived" && (
            <Button 
              type="primary" 
              size="small"
              className="btn-gold-premium" 
              icon={<PlayCircleOutlined />} 
              loading={startMutation.isPending && startMutation.variables === record.id}
              onClick={() => handleStartService(record.id)}
            >
              Bắt đầu
            </Button>
          )}

          {record.status === "in_service" && (
            <Link to={`/staff/executions/${record.id}`}>
              <Button 
                type="primary" 
                size="small"
                className="btn-gold-premium" 
                icon={<ScissorOutlined />}
              >
                Tiến hành
              </Button>
            </Link>
          )}

          {record.status === "confirmed" && (
            <span style={{ fontSize: 12, color: "var(--color-muted)", fontStyle: "italic" }}>
              Đang chờ check-in...
            </span>
          )}

          {["completed", "invoiced", "closed"].includes(record.status) && (
            <span style={{ fontSize: 12, color: "green", fontWeight: 500 }}>
              Đã hoàn tất
            </span>
          )}
        </Space>
      ),
    },
  ];

  if (scheduleQuery.isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  if (scheduleQuery.isError) {
    return <ErrorMessage error={scheduleQuery.error} onRetry={() => void scheduleQuery.refetch()} />;
  }

  return (
    <div className="animate-fade-in">
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: 16, 
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--app-border)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Lịch trình phục vụ ngày hôm nay
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Danh sách chi tiết các ca hẹn cần hoàn thành theo thứ tự thời gian.
            </Typography.Text>
          </div>
          <Space>
            <CalendarOutlined style={{ color: "var(--color-primary)", fontSize: 16 }} />
            <Typography.Text strong style={{ fontSize: 14 }}>
              Hôm nay: {dayjs().format("DD/MM/YYYY")}
            </Typography.Text>
          </Space>
        </div>

        {todaySchedule.length === 0 ? (
          <EmptyState 
            message="Lịch trình hôm nay trống" 
            description="Bạn chưa được phân bổ lịch hẹn nào trong ngày hôm nay." 
          />
        ) : (
          <Table 
            dataSource={todaySchedule} 
            columns={columns} 
            rowKey="id" 
            pagination={false} 
            size="middle" 
          />
        )}
      </Card>

      {/* Detail Modal */}
      <BookingDetailModal 
        appointment={selectedBooking} 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onStartService={handleStartService}
        isStarting={startMutation.isPending}
      />
    </div>
  );
};
