import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class Bai15Test {
    @Test
    void testReverseString_normalString() {
        assertEquals("olleh", Bai15.reverseString("hello"), "Test với chuỗi thông thường");
    }
    @Test
    void testReverseString_otherString() {
        assertEquals("dlrow", Bai15.reverseString("world"));
    }
    @Test
    void testReverseString_emptyString() {
        assertEquals("", Bai15.reverseString(""));
    }
    @Test
    void testReverseString_singleChar() {
        assertEquals("a", Bai15.reverseString("a"));
    }
    @Test
    void testReverseString_withSpaces() {
        assertEquals("dlrow olleh", Bai15.reverseString("hello world"));
    }
}