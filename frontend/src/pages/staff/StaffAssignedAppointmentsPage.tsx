import React, { useState } from "react";
import { Card, Tabs, Row, Col, Input, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { stylistApi } from "../../api/stylist.api";
import { queryKeys } from "../../constants/queryKeys";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { AssignedBookingCard } from "../../components/staff/AssignedBookingCard";
import { EmptyState } from "../../components/staff/EmptyState";
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";

export const StaffAssignedAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  // Fetch all assigned bookings
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list({ filterAll: true }),
    queryFn: () => stylistApi.getMyAssignedBookings({ ordering: "-scheduled_start" }),
  });

  const allBookings = getListItems(appointmentsQuery.data);

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

  // Filter bookings based on activeTab and searchText
  const filteredBookings = allBookings.filter((booking) => {
    // 1. Text filter (Guest Name or Booking Code)
    const guestName = booking.customer_details?.full_name?.toLowerCase() || "";
    const bookingId = String(booking.id);
    const matchesSearch = 
      guestName.includes(searchText.toLowerCase()) || 
      bookingId.includes(searchText);

    if (!matchesSearch) return false;

    // 2. Tab filter
    if (activeTab === "all") return true;

    // Waiting: requested, confirmed, arrived
    if (activeTab === "waiting") {
      return ["requested", "confirmed", "arrived"].includes(booking.status);
    }
    // In progress: in_service
    if (activeTab === "active") {
      return booking.status === "in_service";
    }
    // Awaiting checkout: completed
    if (activeTab === "billing") {
      return booking.status === "completed";
    }
    // Finalized / History: invoiced, closed, cancelled, no_show
    if (activeTab === "history") {
      return ["invoiced", "closed", "cancelled", "no_show"].includes(booking.status);
    }

    return true;
  });

  if (appointmentsQuery.isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  if (appointmentsQuery.isError) {
    return <ErrorMessage error={appointmentsQuery.error} onRetry={() => void appointmentsQuery.refetch()} />;
  }

  const tabItems = [
    { key: "all", label: `Tất cả (${allBookings.length})` },
    { key: "waiting", label: `Chờ phục vụ (${allBookings.filter(b => ["requested", "confirmed", "arrived"].includes(b.status)).length})` },
    { key: "active", label: `Đang phục vụ (${allBookings.filter(b => b.status === "in_service").length})` },
    { key: "billing", label: `Chờ thanh toán (${allBookings.filter(b => b.status === "completed").length})` },
    { key: "history", label: `Lịch sử / Hủy (${allBookings.filter(b => ["invoiced", "closed", "cancelled", "no_show"].includes(b.status)).length})` },
  ];

  return (
    <div className="animate-fade-in">
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: 16, 
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--app-border)",
          marginBottom: 24
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Danh mục đặt chỗ được giao
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Tra cứu và theo dõi toàn bộ lịch đặt chỗ trực tuyến hoặc từ quầy được chỉ định cho bạn.
            </Typography.Text>
          </div>
          <Input
            placeholder="Tìm theo tên khách hàng hoặc mã số..."
            prefix={<SearchOutlined style={{ color: "var(--color-primary)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {filteredBookings.length === 0 ? (
          <EmptyState 
            message="Không tìm thấy lịch đặt chỗ" 
            description="Không có bản ghi nào phù hợp với danh mục hoặc từ khóa tìm kiếm của bạn." 
          />
        ) : (
          <Row gutter={[20, 20]}>
            {filteredBookings.map((booking) => (
              <Col xs={24} md={12} key={booking.id}>
                <AssignedBookingCard 
                  appointment={booking} 
                  onStartService={handleStartService}
                  isStarting={startMutation.isPending && startMutation.variables === booking.id}
                />
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};
