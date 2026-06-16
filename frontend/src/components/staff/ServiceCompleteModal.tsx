import React, { useState } from "react";
import { Modal, Form, Input, Button, Table, Space, Select, InputNumber, Divider, Typography, message } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { ServiceIncidental } from "../../types/serviceExecution";
import { formatMoney } from "../../utils/money";

interface ServiceCompleteModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (resultNotes: string, incidentals: Partial<ServiceIncidental>[]) => void;
  isSubmitting: boolean;
}

export const ServiceCompleteModal: React.FC<ServiceCompleteModalProps> = ({
  open,
  onClose,
  onComplete,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const [incidentals, setIncidentals] = useState<Partial<ServiceIncidental>[]>([]);

  // Incidental form state
  const [incItemType, setIncItemType] = useState<"service" | "product" | "other">("service");
  const [incDesc, setIncDesc] = useState("");
  const [incPrice, setIncPrice] = useState<number>(0);
  const [incQty, setIncQty] = useState<number>(1);

  const addIncidental = () => {
    if (!incDesc.trim()) {
      void message.error("Vui lòng nhập mô tả phụ phí");
      return;
    }
    if (incPrice <= 0) {
      void message.error("Đơn giá phải lớn hơn 0");
      return;
    }

    const newItem: Partial<ServiceIncidental> = {
      id: Date.now(), // temporary local id
      item_type: incItemType,
      description: incDesc,
      unit_price: incPrice,
      quantity: incQty,
    };

    setIncidentals([...incidentals, newItem]);
    setIncDesc("");
    setIncPrice(0);
    setIncQty(1);
    void message.success("Đã thêm phụ phí phát sinh");
  };

  const removeIncidental = (tempId: number | string) => {
    setIncidentals(incidentals.filter(item => item.id !== tempId));
  };

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onComplete(values.resultNotes, incidentals);
      })
      .catch(() => {
        void message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      });
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      render: (t: string) => (t === "service" ? "Dịch vụ" : t === "product" ? "Sản phẩm" : "Khác"),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (p: number) => <span>{formatMoney(p)}</span>,
    },
    {
      title: "Tổng",
      key: "total",
      render: (_: unknown, record: Partial<ServiceIncidental>) => (
        <strong>{formatMoney((record.unit_price as number) * (record.quantity as number))}</strong>
      ),
    },
    {
      title: "Xóa",
      key: "action",
      render: (_: unknown, record: Partial<ServiceIncidental>) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeIncidental(record.id!)} 
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Hoàn thành dịch vụ & Gửi yêu cầu thanh toán
        </Typography.Title>
      }
      footer={[
        <Button key="cancel" onClick={onClose} style={{ borderRadius: 8 }}>
          Hủy bỏ
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          className="btn-gold-premium" 
          icon={<CheckCircleOutlined />} 
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Hoàn thành & Chuyển Lễ tân
        </Button>
      ]}
      width={700}
      style={{ borderRadius: 16 }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item
          label="Ghi chú dịch vụ đã thực hiện (Thời gian thực tế, tình trạng tóc/da, sản phẩm khuyên dùng)"
          name="resultNotes"
          rules={[{ required: true, message: "Vui lòng nhập ghi chú hoàn thành dịch vụ" }]}
        >
          <Input.TextArea rows={3} placeholder="Ví dụ: Đã thực hiện phục hồi tóc Keratin, cắt tỉa ngọn xơ. Khuyên khách dùng dầu gội giữ màu thảo dược. Thời gian thực tế: 50 phút." style={{ borderRadius: 8 }} />
        </Form.Item>
      </Form>

      <Divider style={{ margin: "16px 0" }}>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Chi phí & Dịch vụ phát sinh (Nếu có)</span>
      </Divider>

      <div style={{ background: "#faf9f6", padding: 16, borderRadius: 12, border: "1px solid var(--app-border)", marginBottom: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 10 }}>
          Thêm dịch vụ phát sinh hoặc sản phẩm khách mua thêm tại chỗ
        </Typography.Text>
        
        <Space wrap style={{ display: "flex", justifyContent: "space-between" }}>
          <Select 
            value={incItemType} 
            onChange={setIncItemType} 
            style={{ width: 120 }}
            options={[
              { value: "service", label: "Dịch vụ phụ" },
              { value: "product", label: "Sản phẩm" },
              { value: "other", label: "Chi phí khác" },
            ]}
          />
          <Input 
            placeholder="Tên dịch vụ/sản phẩm" 
            value={incDesc} 
            onChange={e => setIncDesc(e.target.value)} 
            style={{ width: 200 }} 
          />
          <InputNumber 
            placeholder="Đơn giá" 
            value={incPrice} 
            onChange={v => setIncPrice(v || 0)} 
            style={{ width: 130 }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={value => value ? parseFloat(value.replace(/\$\s?|(,*)/g, "")) : 0}
            addonAfter="đ"
          />
          <InputNumber 
            placeholder="SL" 
            min={1} 
            value={incQty} 
            onChange={v => setIncQty(v || 1)} 
            style={{ width: 60 }} 
          />
          <Button 
            type="primary" 
            className="btn-gold-premium" 
            icon={<PlusOutlined />} 
            onClick={addIncidental}
          >
            Thêm
          </Button>
        </Space>
      </div>

      {incidentals.length > 0 && (
        <Table 
          dataSource={incidentals} 
          columns={columns} 
          rowKey="id" 
          pagination={false} 
          size="small" 
          style={{ marginBottom: 20 }}
        />
      )}
    </Modal>
  );
};
