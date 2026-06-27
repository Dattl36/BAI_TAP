import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai12Test {
    @Test
    public void testTinhTuoi() {
        Bai12 x = new Bai12();
        assertEquals(27, x.tinhTuoi(12, 1, 1999));
    }
    @Test
    public void testTinhTuoiWithFutureYear() {
        Bai12 x = new Bai12();
        assertEquals(-1, x.tinhTuoi(12, 1, 2030));
    }
    @Test
    public void testTinhTuoiWithNegativeDay() {
        Bai12 x = new Bai12();
        assertEquals(-1, x.tinhTuoi(-12, 1, 2030));
    }
    @Test
    public void testTinhTuoiWithNegativeMonth() {
        Bai12 x = new Bai12();
        assertEquals(-1, x.tinhTuoi(12, -1, 2030));
    }
    @Test
    public void testTinhTuoiWithNegativeYear() {
        Bai12 x = new Bai12();
        assertEquals(-1, x.tinhTuoi(12, 1, -2030));
    }
}