import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

// Hàm này bây giờ chỉ đóng vai trò "cho qua" (Pass-through)
const localizeRoute = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  
  // Luôn trả về true: Cho phép truy cập vào route mà không cần làm gì cả
  return true;
};

export { localizeRoute };