import java.time.LocalDate;
import java.time.Period;
import java.time.DateTimeException;

public class Bai12 {
    public int tinhTuoi(int ngay, int thang, int nam) {
        if (nam <= 0) return -1;
        try {
            LocalDate ngaySinh = LocalDate.of(nam, thang, ngay);
            LocalDate ngayHienTai = LocalDate.now();
            if (ngaySinh.isAfter(ngayHienTai)) return -1;
            return Period.between(ngaySinh, ngayHienTai).getYears();
        } catch (DateTimeException e) {
            return -1;
        }
    }
}