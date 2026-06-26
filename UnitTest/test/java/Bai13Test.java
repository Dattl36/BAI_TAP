import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai13Test {
    @Test
    public void testTinhThu() {
        Bai13 x = new Bai13();
        assertEquals(1, x.tinhThu(5, 4, 2020));
    }
    @Test
    public void testTinhThuWith6_4_2020() {
        Bai13 x = new Bai13();
        assertEquals(2, x.tinhThu(6, 4, 2020));
    }
    @Test
    public void testTinhThuWithInvalidDay() {
        Bai13 x = new Bai13();
        assertEquals(0, x.tinhThu(35, 6, 2019));
    }
    @Test
    public void testTinhThuWithInvalidMonth() {
        Bai13 x = new Bai13();
        assertEquals(0, x.tinhThu(19, 35, 2020));
    }
    @Test
    public void testTinhThuWithNegativeDay() {
        Bai13 x = new Bai13();
        assertEquals(0, x.tinhThu(-19, 35, 2020));
    }
    @Test
    public void testTinhThuWithNegativeMonth() {
        Bai13 x = new Bai13();
        assertEquals(0, x.tinhThu(19, -9, 2020));
    }
    @Test
    public void testTinhThuWithNegativeYear() {
        Bai13 x = new Bai13();
        assertEquals(0, x.tinhThu(19, 9, -2020));
    }
}