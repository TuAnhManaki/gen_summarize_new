import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminBlogService } from "../../services/admin-blog.service";
import { Category, CategoryService } from "../../services/CategoryService";

@Component({
  selector: "app-post-form",
  templateUrl: "./post-form.component.html",
  styleUrls: ["./post-form.component.scss"],
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  postId: string | null = null;
  isLoading = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminBlogService,
    private catService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Khởi tạo Form với cấu trúc khớp Model
    this.postForm = this.fb.group({
      title: ["", Validators.required],
      slug: ["", Validators.required],
      content: [""], // Nên dùng Editor (CKEditor/TinyMCE)
      categoryId: [null, Validators.required],
      status: ["DRAFT"],

      // Group con cho JSONB
      metaData: this.fb.group({
        summary: ["", Validators.required],
        thumbnail: [""],
        readingTime: [5],
        tags: [""], // Ở UI là string "Java, Spring", khi gửi đi sẽ split thành mảng
        views: [0],
        likes: [0],
      }),
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    // Kiểm tra xem đang ở chế độ Sửa hay Thêm mới
    this.postId = this.route.snapshot.paramMap.get("id");
    if (this.postId) {
      this.isEditMode = true;
      this.loadPostData(this.postId);
    }
  }

  loadCategories() {
    this.catService.getAll().subscribe((cats) => (this.categories = cats));
  }

  // 1. Auto Generate Slug từ Title
  generateSlug() {
    const title = this.postForm.get("title")?.value;
    if (title) {
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
        .replace(/[^a-z0-9\s-]/g, "") // Bỏ ký tự đặc biệt
        .trim()
        .replace(/\s+/g, "-"); // Thay khoảng trắng bằng -

      this.postForm.get("slug")?.setValue(slug);
    }
  }

  // 2. Load dữ liệu khi sửa
  loadPostData(id: string) {
    this.isLoading = true;
    this.adminService.getPostById(id).subscribe((post) => {
      // Xử lý đặc biệt: Tags mảng -> Tags chuỗi
      const tagsString = post.metaData.tags
        ? post.metaData.tags.join(", ")
        : "";

      this.postForm.patchValue({
        ...post,
        metaData: {
          ...post.metaData,
          tags: tagsString,
        },
      });
      this.isLoading = false;
    });
  }

  // 3. Submit Form
  onSubmit() {
    if (this.postForm.invalid) return;
    this.isLoading = true;

    // Chuẩn bị dữ liệu (Convert tags string -> array)
    const formValue = this.postForm.value;
    const tagsArray = formValue.metaData.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t !== "");

    const payload = {
      ...formValue,
      metaData: {
        ...formValue.metaData,
        tags: tagsArray,
      },
    };

    if (this.isEditMode && this.postId) {
      this.adminService.updatePost(this.postId, payload).subscribe({
        next: () => this.router.navigate(["/blog/admin/posts"]),
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
    } else {
      this.adminService.createPost(payload).subscribe({
        next: () => this.router.navigate(["/blog/admin/posts"]),
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }
}
