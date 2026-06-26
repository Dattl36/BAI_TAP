import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai8Test {
    @Test
    public void testSum() {
        Bai8 x = new Bai8();
        assertEquals(23, x.sum(5765));
    }
    @Test
    public void testSumWithNegativeNumber() {
        Bai8 x = new Bai8();
        assertEquals(23, x.sum(-5765));
    }
    @Test
    public void testSumWith0Number() {
        Bai8 x = new Bai8();
        assertEquals(0, x.sum(0));
    }
}