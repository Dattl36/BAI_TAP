import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai14Test {
    @Test
    void testCalculateSum_positiveNumbers() {
        int[] sum1 = {1, 2, 3, 4, 5};
        assertEquals(15, Bai14.calculateSum(sum1), "Test với mảng số dương");
    }
    @Test
    void testCalculateSum_withZeroAndNegative() {
        int[] sum2 = {-1, 0, 1};
        assertEquals(0, Bai14.calculateSum(sum2));
    }
    @Test
    void testCalculateSum_largeNumbers() {
        int[] sum3 = {10, 20, 30, 40, 50};
        assertEquals(150, Bai14.calculateSum(sum3));
    }
}