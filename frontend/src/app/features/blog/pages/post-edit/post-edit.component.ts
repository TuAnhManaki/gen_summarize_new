import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminBlogService } from '../../services/admin-blog.service';
import { Category, CategoryService } from '../../services/CategoryService';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {
  editForm: FormGroup;
  postId: string | null = null;
  categories: Category[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private postService: AdminBlogService,
    private catService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // 1. Khởi tạo Form khớp cấu trúc JSON
    this.editForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      slug: ['', Validators.required],
      content: [''],
      status: ['DRAFT'],
      categoryId: [null], // JSON gốc là category: null, ta map sang ID
      
      // Nested MetaData
      metaData: this.fb.group({
        thumbnail: [''],
        summary: [''],
        readingTime: [0],
        tags: [''], // UI hiển thị chuỗi, Logic convert sang Array
        
        // Nested SEO
        seo: this.fb.group({
          keywords: [''],
          description: ['']
        })
      })
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    // Lấy ID từ URL
    this.postId = this.route.snapshot.paramMap.get('slug');
    if (this.postId) {
      this.loadPostData(this.postId);
    }
  }

  loadCategories() {
    this.catService.getAll().subscribe(cats => this.categories = cats);
  }

  loadPostData(id: string) {
    this.isLoading = true;
    this.postService.getPostById(id).subscribe({
      next: (data: any) => {
        // Xử lý dữ liệu trước khi patch vào form
        
        // 1. Convert Tags Array -> String ("Angular, AI")
        const tagsString = data.metaData?.tags ? data.metaData.tags.join(', ') : '';

        // 2. Lấy categoryId từ object category (nếu có)
        const catId = data.category ? data.category.id : null;

        // 3. Patch value
        this.editForm.patchValue({
          id: data.id,
          title: data.title,
          slug: data.slug,
          content: data.content,
          status: data.status,
          categoryId: catId,
          metaData: {
            thumbnail: data.metaData?.thumbnail,
            summary: data.metaData?.summary,
            readingTime: data.metaData?.readingTime,
            tags: tagsString, // Đưa chuỗi vào input
            seo: {
              keywords: data.metaData?.seo?.keywords,
              description: data.metaData?.seo?.description
            }
          }
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;
    this.isLoading = true;

    const formValue = this.editForm.value;

    // Convert Tags String -> Array ["Angular", "AI"]
    const tagsArray = formValue.metaData.tags
      ? formValue.metaData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
      : [];

    // Chuẩn bị payload gửi đi
    const payload = {
      ...formValue,
      metaData: {
        ...formValue.metaData,
        tags: tagsArray
      }
    };

    // Gọi API Update
    this.postService.updatePost(this.postId!, payload).subscribe({
      next: () => {
        alert('Cập nhật thành công!');
        this.router.navigate(['blog/admin/posts']);
      },
      error: () => {
        alert('Lỗi cập nhật');
        this.isLoading = false;
      }
    });
  }
}