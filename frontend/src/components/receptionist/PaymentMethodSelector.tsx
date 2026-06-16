import {
  DollarOutlined,
  BankOutlined,
  CreditCardOutlined,
  MobileOutlined,
} from "@ant-design/icons";

const METHODS = [
  { key: "cash", label: "Cash", icon: <DollarOutlined /> },
  { key: "bank_transfer", label: "Bank Transfer", icon: <BankOutlined /> },
  { key: "credit_card", label: "Credit Card", icon: <CreditCardOutlined /> },
  { key: "e_wallet", label: "E-Wallet", icon: <MobileOutlined /> },
];

interface PaymentMethodSelectorProps {
  value?: string;
  onChange?: (method: string) => void;
}

export const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => (
  <div className="rcpt-payment-methods">
    {METHODS.map((m) => (
      <div
        key={m.key}
        className={`rcpt-payment-method ${value === m.key ? "selected" : ""}`}
        onClick={() => onChange?.(m.key)}
      >
        <span className="method-icon">{m.icon}</span>
        <span>{m.label}</span>
      </div>
    ))}
  </div>
);
