public class Bai6 {
    public int number1;
    public int number2;
    public int number3;
    
    public Bai6(int n1, int n2, int n3) {
        this.number1 = n1;
        this.number2 = n2;
        this.number3 = n3;
    }

    public int getNumber1() { return number1; }
    public int getNumber2() { return number2; }
    public int getNumber3() { return number3; }

    public int maxLength() {
        if (number1 >= number2) {
            if (number1 > number3) return number1;
            else return number3;
        } else {
            if (number2 > number3) return number2;
            else return number3;
        }
    }
}