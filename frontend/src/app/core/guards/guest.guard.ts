import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(): boolean {
    const token = this.tokenService.getAccessToken();

    if (token) {
      // Nếu đã có token, đẩy về trang chủ
      this.router.navigate(['/']);
      return false; // Không cho vào route này (login/register)
    }

    return true; // Cho phép vào nếu chưa login
  }
}