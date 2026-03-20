import { Component, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../services/CategoryService';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.scss']
})
export class CategoryManagerComponent implements OnInit {
  
  categories: Category[] = [];
  
  // Model cho Form (Không có ID vì ID tự sinh)
  formModel = {
    name: '',
    slug: ''
  };

  isEditMode = false;
  selectedId: number | null = null; // Lưu ID đang sửa
  isLoading = false;

  constructor(private catService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.catService.getAll().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Lỗi tải danh mục', err)
    });
  }

  // --- LOGIC TẠO SLUG TỰ ĐỘNG ---
  generateSlug() {
    // Chỉ tự tạo slug nếu đang thêm mới hoặc người dùng chưa tự sửa slug
    if (this.formModel.name) {
      this.formModel.slug = this.toSlug(this.formModel.name);
    }
  }

  toSlug(str: string): string {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, '-'); // Thay khoảng trắng bằng dấu gạch ngang
  }

  // --- SUBMIT FORM ---
  onSubmit() {
    if (!this.formModel.name || !this.formModel.slug) return;
    this.isLoading = true;

    if (this.isEditMode && this.selectedId) {
      // UPDATE
      this.catService.update(this.selectedId, this.formModel).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      // CREATE
      this.catService.create(this.formModel).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  // --- ACTIONS ---
  onEdit(cat: Category) {
    this.isEditMode = true;
    this.selectedId = cat.id;
    // Copy dữ liệu vào form
    this.formModel = {
      name: cat.name,
      slug: cat.slug
    };
  }

  onDelete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.catService.delete(id).subscribe(() => this.loadCategories());
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedId = null;
    this.formModel = { name: '', slug: '' };
  }
}