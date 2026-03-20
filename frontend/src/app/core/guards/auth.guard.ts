import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenService } from "../services/auth.service";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
import { Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = environment.apiServeUrl + '/api/v1/auth';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, data);
  }

  // 1. BỔ SUNG: Hàm Refresh Token để Interceptor gọi
  refreshToken(refreshToken: string): Observable<any> {
    // Lưu ý: Request này thường không cần Header Bearer (vì Access Token đã hết hạn)
    // Nhưng nó cần Refresh Token ở body hoặc header tùy Backend
    return this.http.post<any>(`${this.API}/refresh`, { refreshToken });
  }

  // 2. CẬP NHẬT: Logout chuyên nghiệp hơn
  logout() {
    const accessToken = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();

    if (accessToken) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`
      });
      
      const body = { refreshToken: refreshToken };

      // Gửi request xong mới xóa ở Client
      this.http.post(`${this.API}/logout`, body, { headers }).subscribe({
        next: () => this.finalizeLogout(),
        error: () => this.finalizeLogout() // Lỗi cũng xóa ở client cho chắc
      });
    } else {
      this.finalizeLogout();
    }
  }

  private finalizeLogout() {
    this.tokenService.clear();
    this.router.navigate(['/auth/dang-nhap']);
  }
}