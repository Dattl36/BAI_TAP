import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class Bai11Test {
    @Test
    public void testKiemTraDoiXung() {
        Bai11 x = new Bai11();
        assertTrue(x.kiemTraDoiXung(121));
        assertFalse(x.kiemTraDoiXung(112));
    }
    @Test
    public void testKiemTraDoiXungWith12121() {
        Bai11 x = new Bai11();
        assertTrue(x.kiemTraDoiXung(12121));
    }
    @Test
    public void testKiemTraDoiXungWith0() {
        Bai11 x = new Bai11();
        assertTrue(x.kiemTraDoiXung(0));
    }
    @Test
    public void testKiemTraDoiXungWithNegative102() {
        Bai11 x = new Bai11();
        assertFalse(x.kiemTraDoiXung(-102));
    }
    @Test
    public void testKiemTraDoiXungWithNegative101() {
        Bai11 x = new Bai11();
        assertTrue(x.kiemTraDoiXung(-101));
    }
}