import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class Bai7Test {
    @Test
    public void testUSCLN() {
        Bai7 x = new Bai7();
        assertEquals(4, x.USCLN(8, 12));
    }
    @Test
    public void testBSCNN() {
        Bai7 x = new Bai7();
        assertEquals(24, x.BSCNN(8, 12));
    }
    @Test
    public void testUSCLNWithA0() {
        Bai7 x = new Bai7();
        assertThrows(Exception.class, () -> x.USCLN(0, 4));
    }
    @Test
    public void testBSCNNWithB0() {
        Bai7 x = new Bai7();
        assertThrows(Exception.class, () -> x.BSCNN(4, 0));
    }
    @Test
    public void testUSCLNWithNegativeA() {
        Bai7 x = new Bai7();
        assertThrows(Exception.class, () -> x.USCLN(-4, 4));
    }
}