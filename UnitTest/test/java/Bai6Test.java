import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai6Test {
    @Test
    public void testFirstNumberIsMax() {
        Bai6 x = new Bai6(9, 4, 1);
        assertTrue(x.getNumber1() >= x.getNumber2() && x.getNumber1() > x.getNumber3());
        assertEquals(9, x.maxLength());
    }
    @Test
    public void testSecondNumberIsMax() {
        Bai6 x = new Bai6(4, 9, 1);
        assertTrue(x.getNumber2() > x.getNumber1() && x.getNumber2() > x.getNumber3());
        assertEquals(9, x.maxLength());
    }
    @Test
    public void testThirdNumberIsMax() {
        Bai6 x = new Bai6(1, 4, 9);
        assertTrue(x.getNumber3() > x.getNumber1() && x.getNumber3() > x.getNumber2());
        assertEquals(9, x.maxLength());
    }
}