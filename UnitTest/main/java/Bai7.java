public class Bai7 {
    public int USCLN(int a, int b) {
        if (a <= 0 || b <= 0) throw new IllegalArgumentException("Inputs must be positive integers");
        while(a != b) {
            if(a > b) a = a - b;
            else b = b - a;
        }
        return a;
    }
    public int BSCNN(int a, int b) {
        return (a * b) / USCLN(a, b);
    }
}