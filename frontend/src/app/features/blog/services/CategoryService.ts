import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = environment.apiServeUrl;
    
    private apiUrl = this.baseUrl + '/api/categories'; 

  constructor(private http: HttpClient) {}

  // Hàm lấy Token từ LocalStorage
    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('access_token'); // Lấy token đã lưu khi login
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  create(data: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data, { headers: this.getHeaders()});
  }

  update(id: number, data: Omit<Category, 'id'>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders()});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}