import { Component } from "@angular/core";
import { AuthService } from "@app/core/guards/auth.guard";
import { AuthStateService } from "@app/core/guards/AuthStateService";
import { NewsService } from "@app/features/blog/services/News.Service";
 

 

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
isMenuOpen = false;
  
  // Sử dụng Observable để template tự động update khi giá trị thay đổi
  currentUser$ = this.authState.user$; 
  categories$ = this.newsService.categories$;
  isMegaMenuOpen: boolean = false; // Biến điều khiển Mega Menu

  constructor(
    private authState: AuthStateService,
    private authService: AuthService,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    // Khi app khởi chạy, nạp user từ token có sẵn (nếu có)
    this.authState.setUserFromToken();

    // Gọi hàm fetch khi Header được khởi tạo
    this.newsService.fetchCategories();
  }

  // Hàm bật/tắt menu
  toggleMegaMenu(): void {
    this.isMegaMenuOpen = !this.isMegaMenuOpen;
  }

  // Hàm đóng menu (khi click vào nút Đóng X hoặc click ra ngoài)
  closeMegaMenu(): void {
    this.isMegaMenuOpen = false;
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
