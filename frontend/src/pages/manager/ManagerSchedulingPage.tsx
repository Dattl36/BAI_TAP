import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Table,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  message,
  Tag,
  Badge,
  Col,
  Row,
  Typography,
  Alert,
  Tooltip,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { employeesApi } from "../../api/employees.api";
import { appointmentsApi } from "../../api/appointments.api";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import type { Employee, StaffAvailability } from "../../types/employee";
import type { Appointment } from "../../types/appointment";
import { getListItems } from "../../utils/apiResponse";
import { getErrorMessage } from "../../utils/error";

// Predefined shifts
const SHIFT_TEMPLATES = [
  { label: "Morning Shift (08:00 - 14:00)", value: "morning", start: "08:00:00", end: "14:00:00", type: "available" },
  { label: "Afternoon Shift (14:00 - 20:00)", value: "afternoon", start: "14:00:00", end: "20:00:00", type: "available" },
  { label: "Evening Shift (17:00 - 22:00)", value: "evening", start: "17:00:00", end: "22:00:00", type: "available" },
  { label: "Day Off", value: "off", start: "00:00:00", end: "23:59:59", type: "unavailable" },
  { label: "Custom Available Hours", value: "custom", type: "available" },
];

export const ManagerSchedulingPage = () => {
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("week").add(1, "day")); // Default to Monday
  
  // Shift Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<StaffAvailability | null>(null);
  const [conflictAlerts, setConflictAlerts] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [shiftValue, setShiftValue] = useState<string>("morning");

  // Queries
  const employeesQuery = useQuery({
    queryKey: ["employees", "list"],
    queryFn: () => employeesApi.list({ limit: 100 }),
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability", "list"],
    queryFn: () => employeesApi.listAvailability({ limit: 200 }),
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => appointmentsApi.list({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: Partial<StaffAvailability>) => employeesApi.createAvailability(payload),
    onSuccess: () => {
      message.success("Shift assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(getErrorMessage(err) || "Failed to assign shift");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<StaffAvailability> }) =>
      employeesApi.updateAvailability(id, payload),
    onSuccess: () => {
      message.success("Shift updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(getErrorMessage(err) || "Failed to update shift");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => employeesApi.deleteAvailability(id),
    onSuccess: () => {
      message.success("Shift cleared successfully!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(getErrorMessage(err) || "Failed to clear shift");
    },
  });

  // Data processing
  const employeesList = getListItems(employeesQuery.data).filter(e => e.role_type === "staff");
  const availabilities = getListItems(availabilityQuery.data);
  const appointmentsList = getListItems(appointmentsQuery.data);

  // Generate 7 days of the week starting from currentWeekStart
  const weekDays = Array.from({ length: 7 }).map((_, i) => currentWeekStart.add(i, "day"));

  // Check conflicts with bookings
  const checkShiftConflicts = (
    employeeId: any,
    dateStr: string,
    startTime: string,
    endTime: string,
    availabilityType: string
  ) => {
    // Find all bookings for this stylist on this day
    const bookings = appointmentsList.filter(
      (apt) =>
        String(apt.staff) === String(employeeId) &&
        apt.status !== "cancelled" &&
        apt.scheduled_start &&
        dayjs(apt.scheduled_start).format("YYYY-MM-DD") === dateStr
    );

    if (bookings.length === 0) return [];

    const conflicts: string[] = [];

    // If setting to Day Off (unavailable), all bookings conflict
    if (availabilityType === "unavailable") {
      bookings.forEach((b) => {
        const timeStr = dayjs(b.scheduled_start).format("HH:mm");
        conflicts.push(`Booking #${b.id} scheduled at ${timeStr}`);
      });
      return conflicts;
    }

    // If setting to available custom/shift hours, check if any booking falls outside those hours
    const shiftStart = dayjs(`${dateStr}T${startTime}`);
    const shiftEnd = dayjs(`${dateStr}T${endTime}`);

    bookings.forEach((b) => {
      const bStart = dayjs(b.scheduled_start);
      const bEnd = dayjs(b.scheduled_end);

      // Conflict if booking starts before shift, or ends after shift
      if (bStart.isBefore(shiftStart) || bEnd.isAfter(shiftEnd)) {
        const timeStr = `${bStart.format("HH:mm")} - ${bEnd.format("HH:mm")}`;
        conflicts.push(`Booking #${b.id} (${timeStr}) falls outside the new shift hours.`);
      }
    });

    return conflicts;
  };

  const handleCellClick = (employee: Employee, date: dayjs.Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");
    // Find if there is an availability block for this employee on this date
    const block = availabilities.find(
      (a) => String(a.employee) === String(employee.id) && a.date === dateStr
    );

    setSelectedEmployee(employee);
    setSelectedDate(date);
    setSelectedBlock(block || null);
    setConflictAlerts([]);

    form.resetFields();

    if (block) {
      // Find template
      const matchedTemplate = SHIFT_TEMPLATES.find(
        (t) =>
          t.start === block.start_time &&
          t.end === block.end_time &&
          t.type === block.availability_type
      );
      
      const templValue = matchedTemplate ? matchedTemplate.value : "custom";
      setShiftValue(templValue);

      form.setFieldsValue({
        shift: templValue,
        start_time: dayjs(`2026-01-01T${block.start_time}`),
        end_time: dayjs(`2026-01-01T${block.end_time}`),
        availability_type: block.availability_type,
        reason: block.reason,
      });
    } else {
      setShiftValue("morning");
      form.setFieldsValue({
        shift: "morning",
        start_time: dayjs("2026-01-01T08:00:00"),
        end_time: dayjs("2026-01-01T14:00:00"),
        availability_type: "available",
        reason: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleShiftTypeChange = (val: string) => {
    setShiftValue(val);
    const template = SHIFT_TEMPLATES.find((t) => t.value === val);
    if (template && val !== "custom") {
      form.setFieldsValue({
        start_time: dayjs(`2026-01-01T${template.start}`),
        end_time: dayjs(`2026-01-01T${template.end}`),
        availability_type: template.type,
      });
    } else {
      form.setFieldsValue({
        availability_type: "available",
      });
    }
    // Recheck conflicts
    recalculateConflicts();
  };

  const recalculateConflicts = () => {
    if (!selectedEmployee || !selectedDate) return;
    const values = form.getFieldsValue();
    const dateStr = selectedDate.format("YYYY-MM-DD");
    
    let startStr = "08:00:00";
    let endStr = "14:00:00";
    let typeStr = values.availability_type;

    if (values.shift !== "custom") {
      const template = SHIFT_TEMPLATES.find((t) => t.value === values.shift);
      if (template) {
        startStr = template.start || "00:00:00";
        endStr = template.end || "23:59:59";
        typeStr = template.type;
      }
    } else {
      if (values.start_time) startStr = values.start_time.format("HH:mm:ss");
      if (values.end_time) endStr = values.end_time.format("HH:mm:ss");
    }

    const conflicts = checkShiftConflicts(selectedEmployee.id, dateStr, startStr, endStr, typeStr);
    setConflictAlerts(conflicts);
  };

  const handleSaveShift = () => {
    if (!selectedEmployee || !selectedDate) return;
    
    form.validateFields().then((values) => {
      const dateStr = selectedDate.format("YYYY-MM-DD");
      let startStr = "";
      let endStr = "";
      let typeStr = values.availability_type;

      if (values.shift !== "custom") {
        const template = SHIFT_TEMPLATES.find((t) => t.value === values.shift);
        if (template) {
          startStr = template.start || "00:00:00";
          endStr = template.end || "23:59:59";
          typeStr = template.type;
        }
      } else {
        startStr = values.start_time.format("HH:mm:ss");
        endStr = values.end_time.format("HH:mm:ss");
      }

      // Check conflicts one final time
      const conflicts = checkShiftConflicts(selectedEmployee.id, dateStr, startStr, endStr, typeStr);
      if (conflicts.length > 0) {
        setConflictAlerts(conflicts);
        Modal.error({
          title: "Scheduling Conflict Detected",
          content: (
            <div>
              <p>Cannot assign this shift. The stylist has customer bookings scheduled during hours outside this shift:</p>
              <ul>
                {conflicts.map((c, i) => (
                  <li key={i}><strong>{c}</strong></li>
                ))}
              </ul>
              <p>Please reschedule those bookings to other hours or another stylist first.</p>
            </div>
          ),
        });
        return;
      }

      const payload: Partial<StaffAvailability> = {
        employee: selectedEmployee.id,
        date: dateStr,
        start_time: startStr,
        end_time: endStr,
        availability_type: typeStr as any,
        reason: values.reason || "",
      };

      if (selectedBlock) {
        updateMutation.mutate({ id: selectedBlock.id, payload });
      } else {
        createMutation.mutate(payload);
      }
    });
  };

  const handleClearShift = () => {
    if (!selectedBlock) return;
    // Check conflicts (clearing shift means stylist has no hours, so any booking on that day conflicts)
    const dateStr = selectedBlock.date;
    const conflicts = checkShiftConflicts(selectedBlock.employee, dateStr, "00:00:00", "00:00:00", "unavailable");
    
    if (conflicts.length > 0) {
      Modal.error({
        title: "Cannot Clear Roster Shift",
        content: (
          <div>
            <p>Cannot clear shift because there are customer bookings scheduled for this stylist on this day:</p>
            <ul>
              {conflicts.map((c, i) => (
                <li key={i}><strong>{c}</strong></li>
              ))}
            </ul>
            <p>Please reschedule these bookings before removing the stylist from the work schedule.</p>
          </div>
        ),
      });
      return;
    }

    Modal.confirm({
      title: "Clear Shift",
      content: "Are you sure you want to clear this shift assignment? The stylist will have no scheduled hours on this day.",
      okText: "Clear Shift",
      okType: "danger",
      onOk: () => {
        deleteMutation.mutate(selectedBlock.id);
      },
    });
  };

  // Render cell details
  const renderShiftCell = (employee: Employee, date: dayjs.Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");
    const block = availabilities.find(
      (a) => String(a.employee) === String(employee.id) && a.date === dateStr
    );

    // Bookings count on this day
    const bookings = appointmentsList.filter(
      (apt) =>
        String(apt.staff) === String(employee.id) &&
        apt.status !== "cancelled" &&
        apt.scheduled_start &&
        dayjs(apt.scheduled_start).format("YYYY-MM-DD") === dateStr
    );

    if (!block) {
      return (
        <div
          className="shift-cell-empty"
          onClick={() => handleCellClick(employee, date)}
          style={{
            padding: 12,
            minHeight: 72,
            cursor: "pointer",
            borderRadius: 8,
            transition: "all 0.2s",
            border: "1px dashed var(--app-border)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--color-muted)" }}>No shift set</span>
          {bookings.length > 0 && (
            <Badge count={`${bookings.length} bookings`} style={{ backgroundColor: "#ef4444", fontSize: 10 }} />
          )}
        </div>
      );
    }

    // Styling logic
    let color: string = "default";
    let text = `${block.start_time.substring(0, 5)} - ${block.end_time.substring(0, 5)}`;
    
    if (block.availability_type === "unavailable") {
      color = "error";
      text = "DAY OFF";
    } else {
      const template = SHIFT_TEMPLATES.find(
        (t) => t.start === block.start_time && t.end === block.end_time
      );
      if (template) {
        if (template.value === "morning") color = "warning";
        else if (template.value === "afternoon") color = "processing";
        else color = "purple";
      } else {
        color = "success";
      }
    }

    return (
      <div
        className="shift-cell-active"
        onClick={() => handleCellClick(employee, date)}
        style={{
          padding: 12,
          minHeight: 72,
          cursor: "pointer",
          borderRadius: 8,
          background: block.availability_type === "unavailable" ? "#fef2f2" : "#fbfbf7",
          border: `1px solid ${block.availability_type === "unavailable" ? "#fca5a5" : "var(--color-primary)"}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(188, 163, 116, 0.05)",
          transition: "all 0.2s",
        }}
      >
        <Tag color={color} style={{ margin: 0, fontSize: 10, fontWeight: 600, alignSelf: "flex-start" }}>
          {text}
        </Tag>
        {bookings.length > 0 ? (
          <Tooltip title={`${bookings.length} booking(s) scheduled during this shift`}>
            <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: "var(--color-primary-dark)", fontWeight: 500 }}>
              <CheckCircleOutlined style={{ color: "green" }} /> {bookings.length} Bookings
            </span>
          </Tooltip>
        ) : (
          <span style={{ fontSize: 11, color: "var(--color-muted)" }}>Free (No bookings)</span>
        )}
      </div>
    );
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(currentWeekStart.subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(1, "week"));
  };

  const handleToday = () => {
    setCurrentWeekStart(dayjs().startOf("week").add(1, "day"));
  };

  const columnsDef: ColumnsType<Employee> = [
    {
      title: "Stylist Name",
      dataIndex: "full_name",
      key: "name",
      width: 180,
      fixed: "left",
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: 600 }}>{text}</span>
          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{record.specialties || "General Stylist"}</div>
        </div>
      ),
    },
    ...weekDays.map((day) => ({
      title: (
        <div style={{ textAlign: "center" }}>
          <div>{day.format("ddd")}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: day.isSame(dayjs(), "day") ? "var(--color-primary-dark)" : "inherit" }}>
            {day.format("D")}
          </div>
        </div>
      ),
      key: day.format("YYYY-MM-DD"),
      width: 150,
      render: (_: unknown, record: Employee) => renderShiftCell(record, day),
    })),
  ];

  const isQueryLoading = employeesQuery.isLoading || availabilityQuery.isLoading || appointmentsQuery.isLoading;

  return (
    <div>
      <PageHeader
        title="Staff Scheduling"
        description="Roster stylist shifts, assign days off, and lock availability with real-time customer booking validation."
      />

      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
            <Button onClick={handleToday}>Today</Button>
            <Button icon={<RightOutlined />} onClick={handleNextWeek} />
            <Typography.Text strong style={{ fontSize: 15 }}>
              Week of {currentWeekStart.format("MMMM D, YYYY")} — {currentWeekStart.add(6, "day").format("MMMM D, YYYY")}
            </Typography.Text>
          </Space>
          
          <Space>
            <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Badge status="warning" /> Morning
            </span>
            <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Badge status="processing" /> Afternoon
            </span>
            <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Badge color="purple" /> Evening
            </span>
            <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Badge status="error" /> Day Off
            </span>
          </Space>
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: 16, overflow: "hidden" }}>
        {employeesQuery.isError ? (
          <ErrorState
            message="Failed to load staff roster data."
            onRetry={() => {
              void employeesQuery.refetch();
              void availabilityQuery.refetch();
            }}
          />
        ) : (
          <Table
            columns={columnsDef as any}
            dataSource={employeesList}
            loading={isQueryLoading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        )}
      </Card>

      {/* Shift Edit Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOutlined style={{ color: "var(--color-primary-dark)" }} />
            <span>Assign Shift: {selectedEmployee?.full_name}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSaveShift}
        onCancel={() => setIsModalOpen(false)}
        okText={selectedBlock ? "Update Shift" : "Assign Shift"}
        okButtonProps={{ className: "login-button-gold", loading: createMutation.isPending || updateMutation.isPending }}
        footer={[
          selectedBlock && (
            <Button
              key="delete"
              danger
              onClick={handleClearShift}
              style={{ float: "left" }}
              loading={deleteMutation.isPending}
            >
              Clear Shift
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" className="login-button-gold" onClick={handleSaveShift}>
            Save
          </Button>,
        ]}
        width={500}
        destroyOnClose
      >
        {selectedDate && selectedEmployee && (
          <div style={{ marginTop: 16 }}>
            <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: 8, marginBottom: 20 }}>
              <Typography.Paragraph style={{ margin: 0 }}>
                <strong>Date:</strong> {selectedDate.format("dddd, MMMM D, YYYY")}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ margin: "4px 0 0" }}>
                <strong>Stylist:</strong> {selectedEmployee.full_name} ({selectedEmployee.specialties || "Specialist"})
              </Typography.Paragraph>
            </div>

            {/* Conflict Alert Panel */}
            {conflictAlerts.length > 0 && (
              <Alert
                message="Scheduling Conflicts Found"
                description={
                  <div>
                    <p style={{ margin: "0 0 6px" }}>The stylist has active customer appointments during these hours:</p>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {conflictAlerts.map((c, i) => (
                        <li key={i}><strong>{c}</strong></li>
                      ))}
                    </ul>
                  </div>
                }
                type="error"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 20 }}
              />
            )}

            <Form form={form} layout="vertical" onValuesChange={recalculateConflicts}>
              <Form.Item name="shift" label="Shift Template" rules={[{ required: true }]}>
                <Select onChange={handleShiftTypeChange}>
                  {SHIFT_TEMPLATES.map((t) => (
                    <Select.Option key={t.value} value={t.value}>
                      {t.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {shiftValue === "custom" && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="start_time" label="Start Time" rules={[{ required: true }]}>
                      <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="end_time" label="End Time" rules={[{ required: true }]}>
                      <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Form.Item name="availability_type" label="Work Status" rules={[{ required: true }]}>
                <Select disabled={shiftValue !== "custom"}>
                  <Select.Option value="available">Available for Bookings</Select.Option>
                  <Select.Option value="unavailable">Unavailable (Off Duty)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="reason" label="Shift Notes / Reason for Day Off">
                <Input placeholder="e.g. Weekly rotation, personal matter" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};
