import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenService } from "../services/auth.service";// Lấy URL API của bạn

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.tokenService.getAccessToken();
  
  // KIỂM TRA: Nếu là API login hoặc refresh thì KHÔNG gắn token cũ vào header
  const isAuthRequest = req.url.includes('/api/v1/auth/');

  if (token && !isAuthRequest) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
}