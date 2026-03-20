import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Giả sử bạn lưu Base URL ở đây

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Base URL từ environment (ví dụ: 'https://api.example.com')
  private baseUrl = environment.apiServeUrl;

  constructor(private http: HttpClient) { }

  /**
   * GET Request
   * @param endpoint - URL endpoint (vd: '/users' hoặc '/users/:id')
   * @param params - (Optional) Object chứa path params (để replace vào url) hoặc query params
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const { url, queryParams } = this.createUrlAndParams(endpoint, params);
    return this.http.get<T>(url, { params: queryParams });
  }

  /**
   * POST Request
   * @param endpoint - URL endpoint
   * @param body - Dữ liệu body
   * @param params - (Optional) Path params nếu cần replace trong URL
   */
  post<T>(endpoint: string, body: any, params?: any): Observable<T> {
    const { url } = this.createUrlAndParams(endpoint, params);
    return this.http.post<T>(url, body);
  }

  /**
   * PUT Request
   */
  put<T>(endpoint: string, body: any, params?: any): Observable<T> {
    const { url } = this.createUrlAndParams(endpoint, params);
    return this.http.put<T>(url, body);
  }

  /**
   * DELETE Request
   */
  delete<T>(endpoint: string, params?: any): Observable<T> {
    const { url, queryParams } = this.createUrlAndParams(endpoint, params);
    return this.http.delete<T>(url, { params: queryParams });
  }

  // --- HELPER FUNCTIONS ---

  /**
   * Xử lý URL:
   * 1. Thay thế Path Variable (vd: :id) bằng giá trị thực.
   * 2. Tách các tham số còn lại thành Query Params (vd: ?page=1).
   */
  private createUrlAndParams(endpoint: string, params: any): { url: string, queryParams: HttpParams } {
    let finalUrl = this.baseUrl + endpoint;
    let queryParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        // Kiểm tra xem endpoint có chứa placeholder dạng :key không (vd: :id)
        if (finalUrl.includes(`:${key}`)) {
          // Nếu có, thay thế nó bằng giá trị và KHÔNG đưa vào queryParams
          finalUrl = finalUrl.replace(`:${key}`, encodeURIComponent(params[key]));
        } else {
          // Nếu không có trong URL path, đưa vào Query Params (vd: ?key=value)
          if (params[key] !== null && params[key] !== undefined) {
             queryParams = queryParams.append(key, params[key]);
          }
        }
      });
    }

    return { url: finalUrl, queryParams };
  }
}