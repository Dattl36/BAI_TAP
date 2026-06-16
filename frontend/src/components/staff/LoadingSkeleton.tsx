import React from "react";
import { Skeleton, Card, Row, Col } from "antd";

interface LoadingSkeletonProps {
  type?: "stats" | "table" | "card" | "profile";
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = "card" }) => {
  if (type === "stats") {
    return (
      <Row gutter={[24, 24]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card style={{ borderRadius: 16 }}>
              <Skeleton active paragraph={{ rows: 1 }} avatar={{ shape: "circle" }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (type === "table") {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (type === "profile") {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Row gutter={24}>
          <Col span={8} style={{ textAlign: "center" }}>
            <Skeleton.Avatar size={120} shape="circle" active />
            <Skeleton active title={false} paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
          </Col>
          <Col span={16}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Col>
        </Row>
      </Card>
    );
  }

  return (
    <Card style={{ borderRadius: 16 }}>
      <Skeleton active avatar paragraph={{ rows: 3 }} />
    </Card>
  );
};
