import { useState, useEffect } from "react";
import { LogoutOutlined, UserOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { useAuth } from "../../hooks/useAuth";
import { useMe } from "../../hooks/useMe";

const PAGE_TITLES: Record<string, string> = {
  "/receptionist": "Reception Operation Center",
  "/receptionist/today": "Today's Service Queue",
  "/receptionist/calendar": "Appointments Calendar",
  "/receptionist/appointments/create": "New Booking",
  "/receptionist/customers": "Client Database",
  "/receptionist/invoices": "Invoices & Billing",
  "/receptionist/payments": "Transaction Register",
  "/receptionist/feedback": "Guest Feedback",
  "/receptionist/complaints": "Client Disputes",
  "/receptionist/notifications": "Alerts & Notifications",
};

export const ReceptionistHeader = () => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const location = useLocation();
  const navigate = useNavigate();
  const [clock, setClock] = useState(dayjs().format("HH:mm"));

  useEffect(() => {
    const timer = setInterval(() => setClock(dayjs().format("HH:mm")), 30_000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    for (const [route, title] of Object.entries(PAGE_TITLES)) {
      if (route === "/receptionist" ? path === route : path.startsWith(route)) {
        return title;
      }
    }
    return "Operations Desk";
  };

  return (
    <header className="rcpt-header">
      <div className="rcpt-header-left">
        <Typography.Text className="rcpt-header-title">
          {getPageTitle()}
        </Typography.Text>
      </div>

      <div className="rcpt-header-right">
        <span className="rcpt-header-clock">{clock}</span>

        <div className="rcpt-header-actions">
          <Button
            size="small"
            className="rcpt-btn-gold"
            icon={<PlusOutlined />}
            onClick={() => navigate("/receptionist/appointments/create")}
          >
            Walk-in
          </Button>
          <Button
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => navigate("/receptionist/appointments/create")}
            style={{ borderRadius: 8 }}
          >
            Book
          </Button>
        </div>

        <div className="header-user-profile" style={{ background: "var(--color-bg)", border: "1px solid var(--app-border)" }}>
          <UserOutlined style={{ color: "var(--rcpt-gold)" }} />
          <Typography.Text style={{ fontWeight: 500, fontSize: 12 }}>
            {user?.first_name || user?.username || "Receptionist"}
          </Typography.Text>
        </div>

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={logout}
          style={{ fontSize: 12 }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};
