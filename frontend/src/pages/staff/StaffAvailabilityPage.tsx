import React, { useState } from "react";
import { Card, Calendar, message, Typography, Modal, Button, Form, Select, TimePicker, Input, Space, Divider, Table, Popconfirm, Row, Col, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";

import { stylistApi } from "../../api/stylist.api";
import { queryKeys } from "../../constants/queryKeys";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

// Import custom components
import { LoadingSkeleton } from "../../components/staff/LoadingSkeleton";
import { ErrorMessage } from "../../components/staff/ErrorMessage";

export const StaffAvailabilityPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. Fetch current Stylist profile
  const profileQuery = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: () => stylistApi.getMyProfile(),
  });

  const stylist = profileQuery.data;

  // 2. Fetch availability blocks for this stylist
  const availabilityQuery = useQuery({
    queryKey: queryKeys.employees.list({ availability: stylist?.id }),
    queryFn: () => stylistApi.getMyAvailability(stylist!.id),
    enabled: !!stylist?.id,
  });

  const blocks = getListItems(availabilityQuery.data) as any[];

  // 3. Add availability block mutation
  const addMutation = useMutation({
    mutationFn: (payload: any) => stylistApi.addAvailabilityBlock(stylist!.id, payload),
    onSuccess: () => {
      void message.success("Đăng ký khung giờ làm việc/nghỉ thành công!");
      setIsModalOpen(false);
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
    onError: (err) => {
      void message.error(`Không thể lưu khung giờ: ${getErrorMessage(err)}`);
    }
  });

  // 4. Delete availability block mutation
  const deleteMutation = useMutation({
    mutationFn: (blockId: string | number) => stylistApi.deleteAvailabilityBlock(blockId),
    onSuccess: () => {
      void message.success("Đã xóa khung giờ làm việc thành công!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
    onError: (err) => {
      void message.error(`Không thể xóa: ${getErrorMessage(err)}`);
    }
  });

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handleOpenModal = () => {
    form.setFieldsValue({
      date: selectedDate,
      availability_type: "available",
      start_time: dayjs("09:00", "HH:mm"),
      end_time: dayjs("18:00", "HH:mm"),
    });
    setIsModalOpen(true);
  };

  const handleSaveBlock = (values: any) => {
    const payload = {
      date: values.date.format("YYYY-MM-DD"),
      start_time: values.start_time.format("HH:mm:ss"),
      end_time: values.end_time.format("HH:mm:ss"),
      availability_type: values.availability_type,
      reason: values.reason || "",
    };
    addMutation.mutate(payload);
  };

  const handleDeleteBlock = (blockId: string | number) => {
    deleteMutation.mutate(blockId);
  };

  // Render events in calendar cells
  const dateCellRender = (current: Dayjs) => {
    const dateStr = current.format("YYYY-MM-DD");
    const dayBlocks = blocks.filter((b) => b.date === dateStr);

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {dayBlocks.map((b) => (
          <li key={b.id} style={{ margin: "2px 0" }}>
            <span className={`availability-shift-tag ${b.availability_type}`}>
              {b.availability_type === "available" ? "Ca: " : "Bận: "}
              {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Find blocks for the selected date to show in detail list below calendar
  const selectedDateStr = selectedDate.format("YYYY-MM-DD");
  const selectedDayBlocks = blocks.filter((b) => b.date === selectedDateStr);

  const detailColumns = [
    {
      title: "Loại ca",
      dataIndex: "availability_type",
      key: "availability_type",
      render: (type: string) => (
        <span className={`availability-shift-tag ${type}`} style={{ display: "inline-block", marginTop: 0 }}>
          {type === "available" ? "Ca làm việc (Rảnh)" : "Vắng mặt (Nghỉ / Khóa)"}
        </span>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_: unknown, record: any) => (
        <strong>
          {record.start_time.substring(0, 5)} - {record.end_time.substring(0, 5)}
        </strong>
      ),
    },
    {
      title: "Lý do / Mô tả",
      dataIndex: "reason",
      key: "reason",
      render: (r: string) => r || "Không có",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: any) => (
        <Popconfirm
          title="Xác nhận xóa?"
          description="Bạn có chắc chắn muốn xóa khung giờ này không?"
          onConfirm={() => handleDeleteBlock(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
          />
        </Popconfirm>
      ),
    },
  ];

  if (profileQuery.isLoading) {
    return <LoadingSkeleton type="profile" />;
  }

  if (profileQuery.isError) {
    return <ErrorMessage error={profileQuery.error} onRetry={() => void profileQuery.refetch()} />;
  }

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Lịch trống & Quản lý Ca làm việc
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Kiểm tra các ca làm việc, đăng ký lịch rảnh hoặc thiết lập khung giờ bận cá nhân.
            </Typography.Text>
          </div>
          <Button 
            type="primary" 
            className="btn-gold-premium" 
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            Đăng ký ca làm / Nghỉ
          </Button>
        </div>

        {availabilityQuery.isLoading ? (
          <LoadingSkeleton type="table" />
        ) : availabilityQuery.isError ? (
          <ErrorMessage error={availabilityQuery.error} onRetry={() => void availabilityQuery.refetch()} />
        ) : (
          <Calendar 
            onSelect={handleSelectDate} 
            cellRender={dateCellRender} 
            style={{ border: "1px solid var(--app-border)", borderRadius: 12, padding: 12 }}
          />
        )}
      </Card>

      {/* Selected Date Details Panel */}
      <Card 
        bordered={false} 
        style={{ 
          borderRadius: 16, 
          boxShadow: "var(--shadow-card)", 
          border: "1px solid var(--app-border)" 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Space>
            <CalendarOutlined style={{ color: "var(--color-primary)", fontSize: 18 }} />
            <Typography.Title level={5} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Khung giờ đăng ký ngày {selectedDate.format("DD/MM/YYYY")}
            </Typography.Title>
          </Space>
          <Button size="small" className="btn-gold-outline" icon={<PlusOutlined />} onClick={handleOpenModal}>
            Thêm mới
          </Button>
        </div>

        {selectedDayBlocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-muted)", fontSize: 13, background: "#faf9f6", borderRadius: 8, border: "1px dashed var(--app-border)" }}>
            Chưa đăng ký ca làm hoặc báo bận cho ngày này. Lễ tân hoặc khách hàng sẽ không thể đặt lịch hẹn với bạn.
          </div>
        ) : (
          <Table 
            dataSource={selectedDayBlocks} 
            columns={detailColumns} 
            rowKey="id" 
            pagination={false} 
            size="middle" 
          />
        )}
      </Card>

      {/* Register Block Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={
          <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Đăng ký ca làm việc / Báo bận
          </Typography.Title>
        }
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            className="btn-gold-premium" 
            loading={addMutation.isPending}
            onClick={() => form.submit()}
          >
            Đăng ký
          </Button>
        ]}
        width={480}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSaveBlock} 
          style={{ marginTop: 20 }}
        >
          <Form.Item label="Ngày thực hiện" name="date" rules={[{ required: true }]}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            <Typography.Text strong>{selectedDate.format("DD/MM/YYYY")}</Typography.Text>
            {/* We keep date hidden or just display it as text */}
          </Form.Item>

          <Form.Item label="Loại đăng ký" name="availability_type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "available", label: "Ca làm việc (Mở lịch nhận khách)" },
                { value: "unavailable", label: "Khung giờ bận (Khóa giờ / Nghỉ phép)" },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giờ bắt đầu" name="start_time" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} minuteStep={15} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giờ kết thúc" name="end_time" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} minuteStep={15} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Lý do / Ghi chú chi tiết" name="reason">
            <Input.TextArea rows={2} placeholder="Ví dụ: Nghỉ phép cá nhân, Khóa ca phục vụ tiệc khách vip..." style={{ borderRadius: 6 }} />
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Đăng ký ca làm việc mở sẽ cho phép khách hàng đặt online. Thiết lập vắng mặt sẽ khóa giờ này để tránh chồng chéo lịch hẹn."
            type="warning"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ borderRadius: 8 }}
          />
        </Form>
      </Modal>
    </div>
  );
};
