import React from "react";
import { Card, Button, List, Space, Typography, Badge, message, Tooltip } from "antd";
import { 
  NotificationOutlined, 
  CheckOutlined, 
  CalendarOutlined, 
  InfoCircleOutlined,
  BellOutlined,
  MailOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { notificationsApi } from "../../api/notifications.api";
import { queryKeys } from "../../constants/queryKeys";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { EmptyState } from "../../components/staff/EmptyState";
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";

export const StaffNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // 1. Fetch notifications from backend
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsApi.list({ ordering: "-created_at" }),
  });

  const alerts = getListItems(notificationsQuery.data);

  // 2. Mark single notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string | number) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (err) => {
      void message.error(`Không thể đánh dấu đã đọc: ${getErrorMessage(err)}`);
    }
  });

  // 3. Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void message.success("Đã đánh dấu đọc toàn bộ thông báo!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (err) => {
      void message.error(`Lỗi: ${getErrorMessage(err)}`);
    }
  });

  const handleMarkRead = (id: string | number) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "booking":
      case "appointment":
        return <CalendarOutlined style={{ color: "var(--color-primary)" }} />;
      case "system":
        return <InfoCircleOutlined style={{ color: "#3b82f6" }} />;
      default:
        return <BellOutlined style={{ color: "var(--color-primary)" }} />;
    }
  };

  if (notificationsQuery.isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  if (notificationsQuery.isError) {
    return <ErrorMessage error={notificationsQuery.error} onRetry={() => void notificationsQuery.refetch()} />;
  }

  const unreadCount = alerts.filter(a => a.delivery_status !== "read").length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--app-border)"
        }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Thông báo dành cho Stylist
            </Typography.Title>
            {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: "var(--color-primary)" }} />}
          </div>
        }
        extra={
          alerts.length > 0 && unreadCount > 0 && (
            <Button 
              type="text" 
              icon={<MailOutlined />} 
              onClick={handleMarkAllRead}
              loading={markAllReadMutation.isPending}
              style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}
            >
              Đọc tất cả
            </Button>
          )
        }
      >
        {alerts.length === 0 ? (
          <EmptyState 
            message="Không có thông báo" 
            description="Bạn hiện tại chưa nhận được thông báo nào từ hệ thống." 
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={alerts}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "16px 12px",
                  borderRadius: 12,
                  marginBottom: 12,
                  backgroundColor: item.delivery_status !== "read" ? "#fbfbfa" : "transparent",
                  border: item.delivery_status !== "read" ? "1px solid var(--color-accent)" : "1px solid transparent",
                  transition: "all 0.3s ease"
                }}
                actions={[
                  item.delivery_status !== "read" ? (
                    <Tooltip title="Đánh dấu đã đọc" key="mark-read">
                      <Button 
                        type="text"
                        shape="circle"
                        icon={<CheckOutlined style={{ color: "#16a34a" }} />} 
                        onClick={() => handleMarkRead(item.id)}
                        loading={markReadMutation.isPending && markReadMutation.variables === item.id}
                      />
                    </Tooltip>
                  ) : null
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "var(--color-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16
                    }}>
                      {getCategoryIcon(item.category)}
                    </div>
                  }
                  title={
                    <Space size={8}>
                      <Typography.Text strong style={{ fontSize: 14 }}>
                        {item.title}
                      </Typography.Text>
                      {item.delivery_status !== "read" && (
                        <Badge status="processing" color="var(--color-primary)" />
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: "100%", marginTop: 4 }}>
                      <Typography.Text style={{ color: "var(--color-text)", fontSize: 13 }}>
                        {item.message}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
                      </Typography.Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};
