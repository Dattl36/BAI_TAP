public class Bai8 {
    public int sum(long number) {
        int sum = 0;
        long index;
        number = Math.abs(number);
        while (number != 0) {
            index = number % 10;
            sum += index;
            number /= 10;
        }
        return sum;
    }
}