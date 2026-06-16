import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="page-header">
    <div>
      <h1 className="page-header__title">{title}</h1>
      {description ? <p className="page-header__description">{description}</p> : null}
    </div>
    {actions ? <div>{actions}</div> : null}
  </div>
);
