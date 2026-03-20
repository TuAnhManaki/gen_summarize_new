import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@app/core/guards/auth.guard";
import { AuthStateService } from "@app/core/guards/AuthStateService";
import { TokenService } from "@app/core/services/auth.service";
import { ToastService } from "@app/core/toast/service/toast.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private authState: AuthStateService,
    private toast: ToastService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
   // 1. Kiểm tra JWT đầu tiên - Nếu có rồi thì "đuổi" đi ngay lập tức
  if (this.tokenService.getAccessToken()) {
    this.router.navigate(['/']);
    return; // Dừng hàm tại đây, không chạy logic khởi tạo bên dưới nữa
  }

  // 2. Kiểm tra xem có email đã lưu trong localStorage không (Tính năng Remember Me)
  const savedEmail = localStorage.getItem('rememberedEmail');

  // 3. Khởi tạo form
  this.loginForm = this.fb.group({
    email: [savedEmail || '', [Validators.required, Validators.email]], 
    password: ['', Validators.required],
    rememberMe: [!!savedEmail] 
  });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value as any).subscribe({
        next: (res) => {
          this.tokenService.setAccessToken(res.accessToken);
          this.tokenService.setRefreshToken(res.refreshToken);
          this.authState.setUserFromToken();
          const { email, rememberMe } = this.loginForm.value;
          if (rememberMe) {
              localStorage.setItem('rememberedEmail', email);
            } else {
              localStorage.removeItem('rememberedEmail');
          }
          this.isLoading = false;
          this.toast.showSuccess('Đăng nhập thành công');
          setTimeout(() => {
            this.router.navigate(["/"]);
          }, 300);
        },
        error: (err) => {
          this.isLoading = false;
          // Kiểm tra nếu là lỗi 401
          if (err.status === 401) {
            this.toast.showError('Đăng nhập thất bại'); // Gọi hàm của bạn ở đây
          } else {
            this.toast.showError('Có lỗi xảy ra, vui lòng thử lại sau');
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
