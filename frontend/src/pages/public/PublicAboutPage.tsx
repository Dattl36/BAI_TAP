import { Typography, Row, Col, Card, Divider } from "antd";

export const PublicAboutPage = () => {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", animation: "fadeIn 0.5s ease", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <Typography.Title level={1} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0 }}>
          Về Chúng Tôi
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, fontSize: 15 }}>
          Tìm hiểu thêm câu chuyện, sứ mệnh và không gian thư giãn đẳng cấp tại Salon.
        </Typography.Paragraph>
      </div>

      <Row gutter={[40, 40]} align="middle" style={{ marginBottom: 60 }}>
        <Col xs={24} md={12}>
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-primary-dark)", margin: "0 0 16px" }}>
            Câu Chuyện S A L O N
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: "1.8", color: "var(--color-text)", textAlign: "justify" }}>
            Được thành lập từ năm 2020, S A L O N bắt nguồn từ khát khao định nghĩa lại trải nghiệm làm đẹp tại Việt Nam. Chúng tôi tin rằng làm tóc không chỉ đơn thuần là cắt hay nhuộm, mà đó là hành trình khai phá vẻ đẹp tự nhiên ẩn giấu của mỗi cá nhân.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: "1.8", color: "var(--color-text)", textAlign: "justify" }}>
            Với không gian thiết kế sang trọng, tinh tế cùng đội ngũ chuyên gia được đào tạo bài bản, S A L O N mang tới một "ốc đảo" thư giãn lý tưởng, nơi bạn có thể rũ bỏ mọi lo toan thường nhật để tận hưởng những phút giây chăm sóc bản thân trọn vẹn nhất.
          </Typography.Paragraph>
        </Col>
        <Col xs={24} md={12}>
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop"
            alt="Salon Story"
            style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 16, boxShadow: "var(--shadow-card)" }}
          />
        </Col>
      </Row>

      <Divider style={{ borderColor: "var(--app-border)" }} />

      {/* Core values */}
      <div style={{ padding: "40px 0" }}>
        <Typography.Title level={3} style={{ fontFamily: "'Playfair Display', serif", textAlign: "center", marginBottom: 40 }}>
          Giá Trị Cốt Lõi
        </Typography.Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 16, height: "100%" }} bordered>
              <Typography.Title level={4} style={{ color: "var(--color-primary-dark)", fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
                Sự Chuyên Nghiệp
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: "1.6" }}>
                Đội ngũ Stylist luôn cập nhật liên tục các xu hướng và kỹ thuật hiện đại nhất, cam kết mang đến chất lượng dịch vụ hoàn hảo và cá nhân hóa tối đa cho từng khách hàng.
              </Typography.Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 16, height: "100%" }} bordered>
              <Typography.Title level={4} style={{ color: "var(--color-primary-dark)", fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
                Sản Phẩm Cao Cấp
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: "1.6" }}>
                Chúng tôi cam kết 100% sử dụng mỹ phẩm tóc chính hãng từ các thương hiệu hàng đầu thế giới (L'Oréal, Goldwell, Olaplex...) để bảo vệ sức khỏe mái tóc của quý khách.
              </Typography.Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 16, height: "100%" }} bordered>
              <Typography.Title level={4} style={{ color: "var(--color-primary-dark)", fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
                Không Gian Trải Nghiệm
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: "1.6" }}>
                Không gian thiết kế sang trọng, hương tinh dầu tự nhiên dịu nhẹ cùng tiếng nhạc nhẹ nhàng, mang lại cảm giác dễ chịu nhất ngay khi bạn đặt chân tới salon.
              </Typography.Text>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider style={{ borderColor: "var(--app-border)" }} />

      {/* Gallery space images */}
      <div style={{ padding: "40px 0" }}>
        <Typography.Title level={3} style={{ fontFamily: "'Playfair Display', serif", textAlign: "center", marginBottom: 40 }}>
          Không Gian Salon
        </Typography.Title>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={8}>
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
              alt="Salon Space 1"
              style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 12, boxShadow: "var(--shadow-card)" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <img
              src="https://images.unsplash.com/photo-1605497746445-97d1b0a9eaf4?w=600&auto=format&fit=crop&q=80"
              alt="Salon Space 2"
              style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 12, boxShadow: "var(--shadow-card)" }}
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <img
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80"
              alt="Salon Space 3"
              style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 12, boxShadow: "var(--shadow-card)" }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};
