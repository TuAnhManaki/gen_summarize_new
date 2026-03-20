import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeUrl {
    // Nếu không có url thì trả về rỗng để tránh lỗi
    if (!url) return '';
    // Hàm này báo cho Angular: "Cái link blob này tôi kiểm tra rồi, an toàn nhé!"
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}