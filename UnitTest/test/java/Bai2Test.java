import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai2Test {

    @Test
    public void testFirstNumberIsMax() {
        Bai2 finder = new Bai2();
        finder.setNumber1(10);
        finder.setNumber2(5);
        finder.setNumber3(3);
        assertEquals(10, finder.max3(), "Trường hợp số thứ nhất lớn nhất");
    }

    @Test
    public void testSecondNumberIsMax() {
        Bai2 finder = new Bai2();
        finder.setNumber1(5);
        finder.setNumber2(10);
        finder.setNumber3(3);
        assertEquals(10, finder.max3(), "Trường hợp số thứ hai lớn nhất");
    }

    @Test
    public void testThirdNumberIsMax() {
        Bai2 finder = new Bai2();
        finder.setNumber1(5);
        finder.setNumber2(3);
        finder.setNumber3(10);
        assertEquals(10, finder.max3(), "Trường hợp số thứ ba lớn nhất");
    }

    @Test
    public void testFirstAndSecondAreMax() {
        Bai2 finder = new Bai2();
        finder.setNumber1(10);
        finder.setNumber2(10);
        finder.setNumber3(5);
        assertEquals(10, finder.max3(), "Trường hợp số thứ nhất và thứ hai bằng nhau và lớn nhất");
    }

    @Test
    public void testSecondAndThirdAreMax() {
        Bai2 finder = new Bai2();
        finder.setNumber1(5);
        finder.setNumber2(10);
        finder.setNumber3(10);
        assertEquals(10, finder.max3(), "Trường hợp số thứ hai và thứ ba bằng nhau và lớn nhất");
    }

    @Test
    public void testFirstAndThirdAreMax() {
        Bai2 finder = new Bai2();
        finder.setNumber1(10);
        finder.setNumber2(5);
        finder.setNumber3(10);
        assertEquals(10, finder.max3(), "Trường hợp số thứ nhất và thứ ba bằng nhau và lớn nhất");
    }

    @Test
    public void testAllNumbersAreEqual() {
        Bai2 finder = new Bai2();
        finder.setNumber1(7);
        finder.setNumber2(7);
        finder.setNumber3(7);
        assertEquals(7, finder.max3(), "Trường hợp cả ba số bằng nhau");
    }
}
