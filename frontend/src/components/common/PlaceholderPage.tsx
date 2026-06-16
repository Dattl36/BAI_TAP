import { Card, Typography } from "antd";

import { PageHeader } from "./PageHeader";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <>
    <PageHeader title={title} description={description ?? "This module screen is ready for implementation."} />
    <Card>
      <Typography.Text type="secondary">Initial frontend route is configured for this backend module.</Typography.Text>
    </Card>
  </>
);
