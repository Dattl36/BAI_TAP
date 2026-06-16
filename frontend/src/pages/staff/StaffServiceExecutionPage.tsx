import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Steps, Space, Typography, message, Spin, Descriptions, Table, Select, Input, InputNumber, Divider, Alert, Tag } from "antd";
import { ScissorOutlined, ArrowLeftOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { appointmentsApi } from "../../api/appointments.api";
import { serviceExecutionsApi } from "../../api/serviceExecutions.api";
import { ErrorState } from "../../components/common/ErrorState";
import { queryKeys } from "../../constants/queryKeys";
import { getErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/date";
import { formatMoney } from "../../utils/money";
import { getListItems } from "../../utils/apiResponse";


export const StaffServiceExecutionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [resultNotes, setResultNotes] = useState("");

  // Incidental form state
  const [incItemType, setIncItemType] = useState<"service" | "product" | "other">("service");
  const [incDesc, setIncDesc] = useState("");
  const [incPrice, setIncPrice] = useState<number>(0);
  const [incQty, setIncQty] = useState<number>(1);

  // 1. Load appointment details
  const appointmentQuery = useQuery({
    queryKey: queryKeys.appointments.detail(id ?? ""),
    queryFn: () => appointmentsApi.detail(id!),
    enabled: !!id,
  });

  const appointment = appointmentQuery.data;

  // 2. Fetch all service executions to find the one for this appointment
  const executionsQuery = useQuery({
    queryKey: queryKeys.serviceExecutions.all,
    queryFn: () => serviceExecutionsApi.list(),
    enabled: !!id,
  });

  const executions = getListItems(executionsQuery.data);
  const execution = executions.find((e: any) => e.appointment === Number(id));

  // Auto-advance step if already started
  useEffect(() => {
    if (appointment) {
      if (appointment.status === "in_service") {
        setCurrentStep(1);
      } else if (["completed", "invoiced", "closed"].includes(appointment.status)) {
        setCurrentStep(2);
      }
    }
  }, [appointment]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.serviceExecutions.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.staffDashboard });
  };

  // 3. Start service mutation
  const startMutation = useMutation({
    mutationFn: () => serviceExecutionsApi.start(id!),
    onSuccess: () => {
      void message.success("Đã bắt đầu ca phục vụ!");
      setCurrentStep(1);
      invalidate();
    },
    onError: (err) => {
      void message.error(`Không thể bắt đầu: ${getErrorMessage(err)}`);
    },
  });

  // 4. Add incidental mutation
  const addIncidentalMutation = useMutation({
    mutationFn: (payload: { item_type: "service" | "product" | "other"; description: string; unit_price: number; quantity: number }) => {
      if (!execution) throw new Error("Không tìm thấy tiến trình dịch vụ");
      return serviceExecutionsApi.addIncidental(execution.id, payload);
    },
    onSuccess: () => {
      void message.success("Đã thêm phụ phí thành công!");
      setIncDesc("");
      setIncPrice(0);
      setIncQty(1);
      invalidate();
    },
    onError: (err) => {
      void message.error(`Không thể thêm phụ phí: ${getErrorMessage(err)}`);
    }
  });

  // 5. Complete service mutation
  const completeMutation = useMutation({
    mutationFn: () => {
      if (!execution) throw new Error("Không tìm thấy tiến trình dịch vụ");
      return serviceExecutionsApi.complete(execution.id, resultNotes || undefined);
    },
    onSuccess: () => {
      void message.success("Dịch vụ đã hoàn tất! Thông tin checkout đã chuyển sang quầy Lễ tân.");
      invalidate();
      navigate("/staff");
    },
    onError: (err) => {
      void message.error(`Không thể hoàn thành: ${getErrorMessage(err)}`);
    },
  });

  const handleAddIncidental = () => {
    if (!incDesc.trim()) {
      void message.error("Vui lòng nhập mô tả phụ phí");
      return;
    }
    if (incPrice <= 0) {
      void message.error("Đơn giá phải lớn hơn 0");
      return;
    }
    addIncidentalMutation.mutate({
      item_type: incItemType,
      description: incDesc,
      unit_price: incPrice,
      quantity: incQty
    });
  };

  if (appointmentQuery.isLoading || executionsQuery.isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80, background: "#ffffff", borderRadius: 16 }}>
        <Spin size="large" />
        <Typography.Paragraph style={{ marginTop: 16, color: "var(--color-muted)" }}>
          Đang tải chi tiết dịch vụ...
        </Typography.Paragraph>
      </div>
    );
  }

  if (appointmentQuery.isError) {
    return <ErrorState message={appointmentQuery.error} onRetry={() => void appointmentQuery.refetch()} />;
  }

  const customerName = appointment?.customer_details?.full_name || `Khách hàng #${appointment?.customer}`;
  const serviceName = appointment?.service_details?.name || "Dịch vụ đã đặt";
  const duration = appointment?.service_details?.duration || 45;

  const incidentalsColumns = [
    {
      title: "Loại phát sinh",
      dataIndex: "item_type",
      key: "item_type",
      render: (t: string) => (t === "service" ? "Dịch vụ phụ" : t === "product" ? "Sản phẩm mua" : "Khác"),
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
      render: (p: any) => <span>{formatMoney(p)}</span>,
    },
    {
      title: "Tổng cộng",
      key: "total",
      render: (_: unknown, record: any) => (
        <strong>{formatMoney(Number(record.unit_price) * Number(record.quantity))}</strong>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/staff" style={{ color: "var(--color-primary-dark)", fontWeight: 500 }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Quay lại Bàn làm việc
        </Link>
      </div>

      <Card variant="borderless" style={{ borderRadius: 16, marginBottom: 24, boxShadow: "var(--shadow-card)", border: "1px solid var(--app-border)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Typography.Title level={3} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, margin: 0 }}>
            Tiến trình Thực hiện Dịch vụ — Lịch đặt #{id}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            Thực hiện các bước phục vụ khách hàng, bổ sung phụ phí nếu có và kết thúc dịch vụ để lễ tân thanh toán.
          </Typography.Paragraph>
        </div>

        <Steps
          current={currentStep}
          style={{ maxWidth: 650, margin: "0 auto 40px" }}
          items={[
            { title: "Bắt đầu ca" },
            { title: "Đang phục vụ & Phụ phí" },
            { title: "Hoàn tất & Chuyển Lễ tân" },
          ]}
        />

        {/* Client & Booking Summary Card */}
        {appointment && (
          <Card 
            variant="borderless" 
            style={{ 
              maxWidth: 650, 
              margin: "0 auto 24px", 
              background: "var(--color-bg)", 
              border: "1px solid var(--app-border)", 
              borderRadius: 12 
            }}
          >
            <Descriptions size="small" column={2} title="Thông tin cuộc hẹn">
              <Descriptions.Item label="Khách hàng">
                <strong>{customerName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ đã đặt">
                <Tag color="gold">{serviceName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời lượng dự kiến">
                {duration} phút
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái lịch">
                <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{appointment.status}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <div style={{ minHeight: 160, maxWidth: 650, margin: "0 auto 40px" }}>
          {/* STEP 0: Start Session */}
          {currentStep === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>
                Xác nhận bắt đầu thực hiện phục vụ
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ maxWidth: 500, margin: "0 auto 24px" }}>
                Đảm bảo khách hàng đã được check-in, đang ngồi tại bàn phục vụ của bạn và sẵn sàng thực hiện liệu trình.
              </Typography.Paragraph>
              <Button
                type="primary"
                size="large"
                className="btn-gold-premium"
                icon={<ScissorOutlined />}
                loading={startMutation.isPending}
                onClick={() => startMutation.mutate()}
                style={{ height: 46, borderRadius: 8, padding: "0 40px" }}
              >
                Bắt đầu thực hiện dịch vụ
              </Button>
            </div>
          )}

          {/* STEP 1: In Progress & Incidentals */}
          {currentStep === 1 && (
            <div>
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <ClockCircleOutlined style={{ fontSize: 36, color: "#7c3aed", marginBottom: 12 }} />
                <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                  Liệu trình đang diễn ra
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginTop: 4 }}>
                  Thêm các phụ thu, nâng cấp liệu trình hoặc sản phẩm đi kèm bên dưới nếu khách yêu cầu thêm.
                </Typography.Paragraph>
              </div>

              {/* Incidental Adder Form */}
              <div style={{ background: "#faf9f6", padding: 20, borderRadius: 12, border: "1px solid var(--app-border)", marginBottom: 20 }}>
                <Typography.Text strong style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
                  + Thêm dịch vụ phụ hoặc sản phẩm phát sinh:
                </Typography.Text>
                
                <Space wrap style={{ display: "flex", justifyContent: "space-between" }}>
                  <Select 
                    value={incItemType} 
                    onChange={setIncItemType} 
                    style={{ width: 120 }}
                    options={[
                      { value: "service", label: "Dịch vụ phụ" },
                      { value: "product", label: "Sản phẩm" },
                      { value: "other", label: "Khác" },
                    ]}
                  />
                  <Input 
                    placeholder="Tên sản phẩm/dịch vụ phụ..." 
                    value={incDesc} 
                    onChange={e => setIncDesc(e.target.value)} 
                    style={{ width: 180, borderRadius: 6 }} 
                  />
                  <InputNumber 
                    placeholder="Đơn giá" 
                    value={incPrice} 
                    onChange={v => setIncPrice(v || 0)} 
                    style={{ width: 120, borderRadius: 6 }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={value => value ? parseFloat(value.replace(/\$\s?|(,*)/g, "")) : 0}
                    addonAfter="đ"
                  />
                  <InputNumber 
                    placeholder="SL" 
                    min={1} 
                    value={incQty} 
                    onChange={v => setIncQty(v || 1)} 
                    style={{ width: 60, borderRadius: 6 }} 
                  />
                  <Button 
                    type="primary" 
                    className="btn-gold-premium"
                    icon={<PlusOutlined />} 
                    loading={addIncidentalMutation.isPending}
                    onClick={handleAddIncidental}
                  >
                    Thêm
                  </Button>
                </Space>
              </div>

              {/* Incidental Items Table */}
              <Typography.Title level={5} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, marginBottom: 8 }}>
                Phụ lục phụ phí phát sinh cho Lễ tân thanh toán:
              </Typography.Title>
              {execution?.incidentals && execution.incidentals.length > 0 ? (
                <Table 
                  dataSource={execution.incidentals} 
                  columns={incidentalsColumns} 
                  rowKey="id" 
                  pagination={false} 
                  size="small" 
                  style={{ border: "1px solid var(--app-border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "16px", border: "1px dashed var(--app-border)", borderRadius: 8, color: "var(--color-muted)", fontSize: 13, marginBottom: 20 }}>
                  Không có phụ phí phát sinh nào được ghi nhận.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <Button 
                  type="primary" 
                  className="btn-gold-premium" 
                  size="large"
                  onClick={() => setCurrentStep(2)}
                  style={{ height: 44, padding: "0 32px" }}
                >
                  Tiếp theo: Hoàn tất dịch vụ
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Finalize & Complete */}
          {currentStep === 2 && (
            <div style={{ padding: "10px 0" }}>
              <Typography.Title level={4} style={{ fontFamily: "'Outfit', sans-serif", marginBottom: 12, textAlign: "center" }}>
                Ghi chú & Hoàn tất liệu trình
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 20, textAlign: "center" }}>
                Nhập các ghi chú thực tế để lễ tân kiểm tra trước khi lập hóa đơn cho khách.
              </Typography.Paragraph>
              
              <div style={{ marginBottom: 20 }}>
                <Typography.Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                  Ghi chú kết quả dịch vụ (Bắt buộc)
                </Typography.Text>
                <textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  placeholder="Ví dụ: Đã cắt tỉa layer nhẹ, sấy tạo kiểu bồng bềnh. Khuyên khách dưỡng ẩm ngọn tóc. Sử dụng 50ml tinh chất dưỡng phục hồi..."
                  style={{
                    width: "100%",
                    minHeight: 100,
                    borderRadius: 8,
                    border: "1px solid var(--app-border)",
                    padding: "12px 16px",
                    fontSize: 14,
                    marginBottom: 16,
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>

              {execution?.incidentals && execution.incidentals.length > 0 && (
                <Alert
                  message={
                    <span>
                      Đã bao gồm <strong>{execution.incidentals.length} khoản phụ phí phát sinh</strong> trị giá{" "}
                      <strong>
                        {formatMoney(
                          execution.incidentals.reduce(
                            (acc: number, curr: any) => acc + Number(curr.unit_price) * Number(curr.quantity),
                            0
                          )
                        )}
                      </strong>.
                    </span>
                  }
                  type="info"
                  showIcon
                  style={{ borderRadius: 8, marginBottom: 20 }}
                />
              )}

              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <Button onClick={() => setCurrentStep(1)}>Quay lại phụ phí</Button>
                <Button
                  type="primary"
                  size="large"
                  className="btn-gold-premium"
                  loading={completeMutation.isPending}
                  onClick={() => completeMutation.mutate()}
                  style={{ height: 46, borderRadius: 8, padding: "0 40px" }}
                >
                  Xác nhận hoàn thành & Gửi Lễ tân
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
