import { Component } from "@angular/core";
import { AuthService } from "@app/core/guards/auth.guard";
import { AuthStateService } from "@app/core/guards/AuthStateService";
 

 

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
isMenuOpen = false;
  
  // Sử dụng Observable để template tự động update khi giá trị thay đổi
  currentUser$ = this.authState.user$; 

  constructor(
    private authState: AuthStateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Khi app khởi chạy, nạp user từ token có sẵn (nếu có)
    this.authState.setUserFromToken();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onLogout() {
    this.authService.logout(); // Hàm logout này sẽ xóa token và gọi authState.clearUser()
    this.closeMenu();
  }
}
