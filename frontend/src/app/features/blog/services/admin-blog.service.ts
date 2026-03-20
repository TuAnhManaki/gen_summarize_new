import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AdminBlogService {
  private baseUrl = environment.apiServeUrl;
  
  private apiUrl = this.baseUrl + '/api/admin/posts';

  constructor(private http: HttpClient) {}

  // Hàm lấy Token từ LocalStorage
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); // Lấy token đã lưu khi login
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  // 1. Lấy danh sách (Có phân trang)
  getPosts(
    keyword: string, 
    categoryId: number | null, 
    status: string | null, 
    page: number, 
    size: number,
    sortBy: string,   // Thêm tham số sort
    sortDir: string   // asc hoặc desc
  ): Observable<any> {
    
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortBy},${sortDir}`); // Spring Boot format: field,dir

    if (keyword) params = params.set('keyword', keyword);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (status) params = params.set('status', status);

    return this.http.get<any>(this.apiUrl, { params , headers: this.getHeaders()});
  }

  // 2. Lấy chi tiết để sửa
  getPostById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // 3. Tạo mới
  createPost(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 4. Cập nhật
  updatePost(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // 5. Xóa
  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}