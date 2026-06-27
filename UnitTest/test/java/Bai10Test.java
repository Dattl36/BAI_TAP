import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class Bai10Test {
    @Test
    public void testIsPrimeNumber() {
        Bai10 x = new Bai10();
        assertTrue(x.isPrimeNumber(5));
        assertTrue(x.isPrimeNumber(11));
    }
    @Test
    public void testIsPrimeNumberWith6() {
        Bai10 x = new Bai10();
        assertFalse(x.isPrimeNumber(6));
    }
    @Test
    public void testIsPrimeNumberWithNegative3() {
        Bai10 x = new Bai10();
        assertFalse(x.isPrimeNumber(-3));
    }
}