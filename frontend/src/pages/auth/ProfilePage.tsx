import { Card, Descriptions } from "antd";

import { PageHeader } from "../../components/common/PageHeader";
import { PageLoading } from "../../components/common/PageLoading";
import { useMe } from "../../hooks/useMe";

export const ProfilePage = () => {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHeader title="Profile" description="Current authenticated user." />
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Username">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Role">{user?.role ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Status">{user?.account_status ?? "-"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};
