import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../toast/service/toast.service';
import { TokenService } from '../services/auth.service';
import { AuthService } from '../guards/auth.guard';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          // 1. Xử lý lỗi 401: Hết hạn Token
          if (error.status === 401) {
            // Nếu đang ở trang login mà lỗi 401 (sai pass) thì không refresh
            if (request.url.includes('/auth/login')) {
              return throwError(() => error);
            }
            return this.handle401Error(request, next);
          }

          // 2. Xử lý lỗi 403: Không có quyền (Ví dụ: Tính năng dành cho VIP 99k)
          if (error.status === 403) {
            this.toast.showError("Bạn không có quyền sử dụng chức năng này!");
          }
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken : any = this.tokenService.getRefreshToken();

      // Gọi API refresh token từ AuthService
      return this.authService.refreshToken(refreshToken).pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;

          // FIX LỖI TẠI ĐÂY: Lưu cặp token mới vào Storage
          this.tokenService.setAccessToken(res.accessToken);
          this.tokenService.setRefreshToken(res.refreshToken);
          
          this.refreshTokenSubject.next(res.accessToken);
          
          // Gửi lại request bị lỗi ban đầu với token mới
          return next.handle(this.addToken(request, res.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          // Nếu refresh cũng thất bại (token hết hạn hẳn) -> Xóa trắng và về Login
          this.tokenService.clear(); 
          this.router.navigate(['/auth/dang-nhap']);
          this.toast.showError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
          return throwError(() => err);
        })
      );
    }

    // Các request khác đang "xếp hàng" chờ lấy token mới
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((jwt) => next.handle(this.addToken(request, jwt)))
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
}