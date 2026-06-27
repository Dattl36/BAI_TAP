import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class Bai4Test {
    @Test
    public void testNumber1IsGreaterThanNumber2() {
        Bai4 x = new Bai4();
        x.setNumber1(5);
        x.setNumber2(2);
        x.sortAsc();
        assertTrue(x.getNumber1() == 2 && x.getNumber2() == 5);
    }
    @Test
    public void testNumber1IsLessThanNumber2() {
        Bai4 x = new Bai4();
        x.setNumber1(2);
        x.setNumber2(5);
        x.sortAsc();
        assertTrue(x.getNumber1() == 2 && x.getNumber2() == 5);
    }
}