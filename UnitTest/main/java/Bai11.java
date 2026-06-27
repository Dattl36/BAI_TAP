public class Bai11 {
    public boolean kiemTraDoiXung(int number) {
        if (number < 0) number = -number;
        StringBuilder xau = new StringBuilder();
        String str = number + "";
        xau.append(str);
        String check = xau.reverse().toString();
        if (str.equals(check))
            return true;
        return false;
    }
}