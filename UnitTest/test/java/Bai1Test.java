import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai1Test {

    @Test
    public void testMultiRoots() {
        Bai1 solver = new Bai1();
        String result = solver.linearEquation(0, 0);
        assertEquals("Multi roots", result);
    }

    @Test
    public void testNoRoot() {
        Bai1 solver = new Bai1();
        String result = solver.linearEquation(0, 5);
        assertEquals("No root", result);
    }

    @Test
    public void testOneRoot() {
        Bai1 solver = new Bai1();
        String result = solver.linearEquation(3, 7);
        assertEquals("One root", result);
    }
}
