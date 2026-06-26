import java.util.Calendar;
public class Bai13 {
    public int tinhThu(int ngay, int thang, int nam) {
        if (ngay < 1 || ngay > 31 || thang < 1 || thang > 12 || nam < 0) return 0;
        Calendar cal = Calendar.getInstance();
        cal.setLenient(false);
        try {
            cal.set(nam, thang-1, ngay);
            return cal.get(Calendar.DAY_OF_WEEK);
        } catch (Exception e) {
            return 0;
        }
    }
}