import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai9Test {
    @Test
    public void testFibonacci() {
        Bai9 x = new Bai9();
        assertEquals(2, x.fibonacci(3));
        assertEquals(55, x.fibonacci(10));
    }
    @Test
    public void testFibonacciWithNegativeNumber() {
        Bai9 x = new Bai9();
        assertEquals(-1, x.fibonacci(-5));
    }
    @Test
    public void testFibonacciWith0Number() {
        Bai9 x = new Bai9();
        assertEquals(0, x.fibonacci(0));
    }
}