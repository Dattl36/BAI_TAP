import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import org.junit.jupiter.api.DisplayName;

public class Bai16Test {
    @Test
    @DisplayName("Test case 1: Đăng nhập thành công")
    void testLogin_success() {
        assertTrue(Bai16.login("user", "password"), "Đăng nhập thành công nên trả về true");
    }
    @Test
    @DisplayName("Test case 2: Sai tên người dùng")
    void testLogin_invalidUsername() {
        assertFalse(Bai16.login("invalidUser", "password"));
    }
    @Test
    @DisplayName("Test case 3: Sai mật khẩu")
    void testLogin_incorrectPassword() {
        assertFalse(Bai16.login("user", "wrongPassword"));
    }
    @Test
    @DisplayName("Test case 4: Sai cả hai")
    void testLogin_invalidBoth() {
        assertFalse(Bai16.login("guest", "123456"));
    }
    @Test
    @DisplayName("Test case 5: Cả hai rỗng")
    void testLogin_emptyBoth() {
        assertFalse(Bai16.login("", ""));
    }
    @Test
    @DisplayName("Test case 6: Tên người dùng rỗng")
    void testLogin_emptyUsername() {
        assertFalse(Bai16.login("", "password"));
    }
    @Test
    @DisplayName("Test case 7: Mật khẩu rỗng")
    void testLogin_emptyPassword() {
        assertFalse(Bai16.login("user", ""));
    }
    @Test
    @DisplayName("Test case 8: Có khoảng trắng")
    void testLogin_withSpaces() {
        assertFalse(Bai16.login(" user ", " pass word "));
    }
}