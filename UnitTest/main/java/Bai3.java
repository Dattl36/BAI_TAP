public class Bai3 {
    private int number1;
    private int number2;

    public Bai3(int number1, int number2) {
        super();
        this.number1 = number1;
        this.number2 = number2;
    }

    public int max2() {
        if (number1 > number2) {
            return number1;
        } else {
            return number2;
        }
    }
}
