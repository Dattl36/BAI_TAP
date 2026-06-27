import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai3Test {

    @Test
    public void testFirstNumberIsGreater() {
        Bai3 finder = new Bai3(10, 5);
        assertEquals(10, finder.max2(), "Trường hợp số thứ nhất lớn hơn số thứ hai");
    }

    @Test
    public void testSecondNumberIsGreaterOrEqual() {
        Bai3 finderGreater = new Bai3(5, 10);
        assertEquals(10, finderGreater.max2(), "Trường hợp số thứ hai lớn hơn số thứ nhất");

        Bai3 finderEqual = new Bai3(7, 7);
        assertEquals(7, finderEqual.max2(), "Trường hợp hai số bằng nhau");
    }
}
