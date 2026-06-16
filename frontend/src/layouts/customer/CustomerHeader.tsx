import { LogoutOutlined, UserOutlined, TrophyOutlined } from "@ant-design/icons";
import { Button, Space, Typography, Badge } from "antd";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useMe } from "../../hooks/useMe";
import { useCustomerHomeData } from "../../hooks/queries/useCustomerHomeData";
import { ROUTES } from "../../constants/routes";

export const CustomerHeader = () => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const { currentPoints } = useCustomerHomeData();
  const navigate = useNavigate();

  return (
    <header 
      className="app-header" 
      style={{ 
        background: "var(--color-surface)", 
        borderBottom: "1px solid var(--app-border)",
        padding: "0 40px"
      }}
    >
      <div 
        style={{ 
          fontFamily: "'Outfit', serif", 
          fontSize: 22, 
          fontWeight: 600, 
          letterSpacing: "0.15em", 
          color: "var(--color-primary)",
          cursor: "pointer"
        }}
        onClick={() => navigate("/customer")}
      >
        S A L O N
      </div>

      <Space size={24}>
        {/* Dynamic Rewards Points Badge */}
        <Badge 
          count={
            <span style={{ 
              background: "linear-gradient(135deg, #bca374 0%, #a38b5f 100%)", 
              color: "#ffffff", 
              padding: "4px 12px", 
              borderRadius: 20, 
              fontSize: 12, 
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(188, 163, 116, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <TrophyOutlined /> {currentPoints} pts
            </span>
          }
        />

        <Space 
          onClick={() => navigate("/customer/profile")}
          style={{ cursor: "pointer", padding: "6px 12px", borderRadius: 20, background: "var(--color-bg)", border: "1px solid var(--app-border)" }}
        >
          <UserOutlined style={{ color: "var(--color-primary)" }} />
          <Typography.Text style={{ fontWeight: 500, fontSize: 13 }}>
            Hello, {user?.first_name || user?.username || "Guest"}
          </Typography.Text>
        </Space>

        <Button 
          type="text" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={logout}
          style={{ fontSize: 13, fontWeight: 500 }}
        >
          Logout
        </Button>
      </Space>
    </header>
  );
};
