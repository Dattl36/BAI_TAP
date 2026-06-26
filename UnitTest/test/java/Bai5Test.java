import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class Bai5Test {
    @Test
    public void testNumber1IsGreaterThanNumber2() {
        Bai5.number1 = 5;
        Bai5.number2 = 2;
        Bai5.sortDesc();
        assertTrue(Bai5.number1 == 5 && Bai5.number2 == 2);
    }
    @Test
    public void testNumber1IsLessThanNumber2() {
        Bai5.number1 = 2;
        Bai5.number2 = 5;
        Bai5.sortDesc();
        assertTrue(Bai5.number1 == 5 && Bai5.number2 == 2);
    }
}