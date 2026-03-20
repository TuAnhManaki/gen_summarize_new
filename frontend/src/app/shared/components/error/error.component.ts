/* eslint-disable import/no-deprecated */
import { HttpStatusCode } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs'; // Thêm 'of'

// Xoá import I18nService
import { ServerService } from '@shared/services';

const ALLOWED_ERROR_CODES = [HttpStatusCode.NotFound, HttpStatusCode.GatewayTimeout];
const DEFAULT_ERROR_CODE = HttpStatusCode.NotFound;

// Tạo danh sách thông báo lỗi tĩnh (Bạn có thể sửa nội dung tại đây)
const ERROR_MESSAGES: Record<number | string, { title: string; description: string }> = {
  [HttpStatusCode.NotFound]: {
    title: 'Không tìm thấy trang',
    description: 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'
  },
  [HttpStatusCode.GatewayTimeout]: {
    title: 'Hết thời gian kết nối',
    description: 'Máy chủ phản hồi quá lâu, vui lòng thử lại sau.'
  },
  // Bây giờ key 'default' sẽ hợp lệ
  'default': {
    title: 'Lỗi không xác định',
    description: 'Đã xảy ra lỗi không mong muốn.'
  }
};

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  @Input() public errorCode = DEFAULT_ERROR_CODE;

  // Vẫn giữ Observable để file HTML không bị lỗi (nếu đang dùng async pipe)
  public errorData$: Observable<{ code: number; title: string; description: string; }> | undefined;

  // Đã xoá i18nService khỏi constructor
  constructor(private readonly serverService: ServerService) {}

  ngOnInit(): void {
    // 1. Xử lý logic set status code cho Server (SSR)
    const errorHandler: Record<number, () => void> = {
      [HttpStatusCode.NotFound]: () => this.serverService.setNotFoundResponse(),
      0: () => this.serverService.setInternalServerErrorResponse()
    };
    (errorHandler[this.errorCode] || errorHandler[0])();

    // 2. Lấy nội dung text dựa trên errorCode
    const message = ALLOWED_ERROR_CODES.includes(this.errorCode)
      ? ERROR_MESSAGES[this.errorCode]
      : ERROR_MESSAGES['default'];

    // 3. Gán dữ liệu vào Observable tĩnh
    this.errorData$ = of({
      code: this.errorCode,
      title: message.title,
      description: message.description
    });
  }
}