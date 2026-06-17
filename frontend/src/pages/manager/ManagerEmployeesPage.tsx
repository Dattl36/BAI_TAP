import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Drawer,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CustomerServiceOutlined,
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  ScissorOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { axiosClient, request } from "../../api/axiosClient";
import { getListItems } from "../../utils/apiResponse";
import type { ListResponse } from "../../types/common";
import type { Employee } from "../../types/employee";

const { Text, Title } = Typography;

type EmployeeRow = Employee & {
  email?: string;
  account_status?: string;
};

const ROLE_LABELS: Record<string, string> = {
  manager: "Quản lý",
  receptionist: "Lễ tân",
  staff: "Stylist",
  stylist: "Stylist",
  employee: "Nhân viên",
};

const ROLE_COLORS: Record<string, string> = {
  manager: "purple",
  receptionist: "blue",
  staff: "gold",
  stylist: "gold",
  employee: "default",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Đã khóa",
  locked: "Đã khóa",
  true: "Đang hoạt động",
  false: "Đã khóa",
};

const FALLBACK_EMPLOYEES: EmployeeRow[] = [
  { id: -1, full_name: "Nguyễn Văn Minh", role_type: "staff", employment_status: "active" },
  { id: -2, full_name: "Trần Thị Lan", role_type: "receptionist", employment_status: "active" },
  { id: -3, full_name: "Lê Hoàng Nam", role_type: "employee", employment_status: "inactive" },
  { id: -4, full_name: "Phạm Thu Hà", role_type: "staff", employment_status: "active" },
];

const getStatusLabel = (status?: string) => STATUS_LABELS[String(status ?? "active")] ?? String(status);
const getRoleLabel = (role?: string) => ROLE_LABELS[String(role ?? "employee")] ?? String(role);

const fetchEmployeesFromManagerApi = async () => {
  try {
    const staffResponse = await request<ListResponse<EmployeeRow>>(
      axiosClient.get("/api/manager/staff/", {
        params: { limit: 1000 },
        timeout: 3000,
        validateStatus: (status) => status < 500,
      }),
    );

    if (getListItems(staffResponse).length > 0) {
      return staffResponse;
    }
  } catch (staffError) {
    console.error("Không thể tải danh sách nhân viên từ /api/manager/staff/", staffError);
  }

  return request<ListResponse<EmployeeRow>>(
    axiosClient.get("/api/manager/employees/", {
      params: { limit: 1000 },
      timeout: 3000,
      validateStatus: (status) => status < 500,
    }),
  );
};

export const ManagerEmployeesPage = () => {
  const [employees, setEmployees] = useState<EmployeeRow[]>(FALLBACK_EMPLOYEES);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetchEmployeesFromManagerApi();
      const employeeItems = getListItems(response).filter((employee) => employee.role_type !== "customer");

      if (employeeItems.length > 0) {
        setEmployees(employeeItems);
        setUsingFallback(false);
      } else {
        setEmployees(FALLBACK_EMPLOYEES);
        setUsingFallback(true);
      }
    } catch (error) {
      console.error("Không thể tải danh sách nhân viên", error);
      setEmployees(FALLBACK_EMPLOYEES);
      setLoadError("Không thể tải danh sách nhân viên");
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  const baseEmployees = useMemo(
    () => employees,
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return baseEmployees.filter((employee) => {
      const status = employee.employment_status ?? employee.account_status ?? "active";
      const matchesSearch =
        normalizedSearch.length === 0 ||
        employee.full_name?.toLowerCase().includes(normalizedSearch) ||
        employee.employee_code?.toLowerCase().includes(normalizedSearch) ||
        employee.email?.toLowerCase().includes(normalizedSearch) ||
        employee.phone?.includes(normalizedSearch);

      const matchesRole = roleFilter === "all" || employee.role_type === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [baseEmployees, roleFilter, searchText, statusFilter]);

  const stats = useMemo(
    () => ({
      total: baseEmployees.length,
      active: baseEmployees.filter((employee) => (employee.employment_status ?? "active") !== "inactive").length,
      inactive: baseEmployees.filter((employee) => (employee.employment_status ?? "active") === "inactive").length,
      stylist: baseEmployees.filter((employee) => ["staff", "stylist"].includes(employee.role_type)).length,
      receptionist: baseEmployees.filter((employee) => employee.role_type === "receptionist").length,
    }),
    [baseEmployees],
  );

  const columns: ColumnsType<EmployeeRow> = [
    {
      title: "Nhân viên",
      key: "employee",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.full_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.employee_code || `#${record.id}`}
          </Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value) => value || "-",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value) => value || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "role_type",
      key: "role_type",
      render: (role) => <Tag color={ROLE_COLORS[role] || "default"}>{getRoleLabel(role)}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "employment_status",
      render: (_, record) => {
        const status = record.employment_status ?? record.account_status ?? "active";
        return <Tag color={status === "active" ? "success" : "error"}>{getStatusLabel(status)}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedEmployee(record)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Quản lý nhân viên
        </Title>
        <Text type="secondary">Theo dõi thông tin và trạng thái nhân viên trong salon</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false}>
            <Statistic title="Tổng nhân viên" value={stats.total} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false}>
            <Statistic title="Đang hoạt động" value={stats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false}>
            <Statistic title="Đã khóa" value={stats.inactive} prefix={<LockOutlined />} valueStyle={{ color: "#ff4d4f" }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false}>
            <Statistic title="Stylist" value={stats.stylist} prefix={<ScissorOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false}>
            <Statistic title="Lễ tân" value={stats.receptionist} prefix={<CustomerServiceOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {loadError ? (
            <Alert
              type="warning"
              showIcon
              message="Không thể tải danh sách nhân viên"
              description="Chưa có dữ liệu nhân viên hoặc API chưa được kết nối"
              action={<Button icon={<ReloadOutlined />} onClick={() => void fetchEmployees()}>Thử lại</Button>}
            />
          ) : null}

          {!loadError && usingFallback ? (
            <Alert
              type="info"
              showIcon
              message="Chưa có dữ liệu nhân viên hoặc API chưa được kết nối"
            />
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <Space wrap size={16}>
              <Input
                allowClear
                placeholder="Tìm theo tên, email, số điện thoại..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={{ width: 300 }}
              />
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 180 }}
                options={[
                  { value: "all", label: "Tất cả vai trò" },
                  { value: "manager", label: "Quản lý" },
                  { value: "receptionist", label: "Lễ tân" },
                  { value: "staff", label: "Stylist" },
                  { value: "employee", label: "Nhân viên" },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 170 }}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Đã khóa" },
                ]}
              />
            </Space>
            <Button icon={<ReloadOutlined />} onClick={() => void fetchEmployees()} loading={loading}>
              Tải lại
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            loading={{ spinning: loading, tip: "Đang tải danh sách nhân viên..." }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            locale={{
              emptyText: loadError
                ? "Chưa có dữ liệu nhân viên hoặc API chưa được kết nối"
                : "Chưa có nhân viên nào",
            }}
            scroll={{ x: 900 }}
          />
        </Space>
      </Card>

      <Drawer
        title="Thông tin nhân viên"
        placement="right"
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        width={400}
        destroyOnClose
      >
        {selectedEmployee ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text type="secondary">Tên nhân viên</Text>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedEmployee.full_name}</div>
            </div>
            <div>
              <Text type="secondary">Vai trò</Text>
              <div>
                <Tag color={ROLE_COLORS[selectedEmployee.role_type] || "default"}>
                  {getRoleLabel(selectedEmployee.role_type)}
                </Tag>
              </div>
            </div>
            <div>
              <Text type="secondary">Trạng thái</Text>
              <div>
                <Tag color={(selectedEmployee.employment_status ?? "active") === "active" ? "success" : "error"}>
                  {getStatusLabel(selectedEmployee.employment_status)}
                </Tag>
              </div>
            </div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Email</Text>
                <div>{selectedEmployee.email || "-"}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Số điện thoại</Text>
                <div>{selectedEmployee.phone || "-"}</div>
              </Col>
            </Row>
            <div>
              <Text type="secondary">Chuyên môn</Text>
              <div>{selectedEmployee.specialties || "-"}</div>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
};
