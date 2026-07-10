import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { servicesApi } from "../../api/services.api";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusTag } from "../../components/common/StatusTag";
import { queryKeys } from "../../constants/queryKeys";
import type { SalonService, ServicePayload } from "../../types/service";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";
import { formatMoney } from "../../utils/money";

export const ManagerServicesPage = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ServicePayload>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<SalonService | null>(null);

  const query = useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: () => servicesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      message.success("Tạo dịch vụ thành công");
      setIsModalVisible(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.list() });
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number | string; payload: Partial<ServicePayload> }) => servicesApi.update(data.id, data.payload),
    onSuccess: () => {
      message.success("Cập nhật dịch vụ thành công");
      setIsModalVisible(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.list() });
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
    }
  });

  const handleCreate = () => {
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", active: true });
    setIsModalVisible(true);
  };

  const handleEdit = (record: SalonService) => {
    setEditingService(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSubmit = (values: ServicePayload) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, payload: { ...values, reason: "Cập nhật dịch vụ từ Dashboard" } as any });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnsType<SalonService> = [
    { title: "Service Name", dataIndex: "name", key: "name", render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: "Danh mục", dataIndex: "category" },
    { title: "Duration", dataIndex: "duration_minutes", render: (val) => `${val} Mins` },
    { title: "Base Price", dataIndex: "base_price", render: (val) => <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{formatMoney(val)}</span> },
    { title: "Trạng thái", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <Card 
      bordered={false} 
      style={{ borderRadius: 16, animation: "fadeIn 0.5s ease" }}
      title={<span style={{ fontSize: 18, fontWeight: 600 }}>Quản lý danh mục dịch vụ</span>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="login-button-gold">
          Tạo dịch vụ mới
        </Button>
      }
    >
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

      <Modal
        title={editingService ? "Sửa thông tin dịch vụ" : "Tạo dịch vụ mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okButtonProps={{ className: "login-button-gold" }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}>
            <Input placeholder="Ví dụ: Cắt tóc nam" />
          </Form.Item>
          <Form.Item name="category" label="Danh mục">
            <Input placeholder="Ví dụ: Haircut, Treatment" />
          </Form.Item>
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item name="base_price" label="Giá cơ bản (VNĐ)" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={10000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="duration_minutes" label="Thời lượng (Phút)" rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={5} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={3} placeholder="Mô tả công dụng và các bước..." />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Tạm ngưng</Select.Option>
              <Select.Option value="archived">Lưu trữ (Xóa)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
