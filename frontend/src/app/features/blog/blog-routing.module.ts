import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BlogDetailComponent } from "./pages/blog-detail/blog-detail.component";
import { PostFormComponent } from "./pages/post-form/post-form.component";
import { PostListComponent } from "./pages/post-list/post-list.component";
import { PostEditComponent } from "./pages/post-edit/post-edit.component";
import { CategoryManagerComponent } from "./pages/category-manager/category-manager.component";
import { PostDashboardComponent } from "./pages/post-dashboard/post-dashboard.component";
import { BlogFeedComponent } from "./pages/blog-feed/blog-feed.component";
import { BlogListComponent } from "./pages/blog-list/blog-list.component";

const routes: Routes = [
  {
    path: "chu-de/:categorySlug",
    component: BlogFeedComponent,
    title: "Danh sách bài viết",
  },
  {
    path: ":slug",
    component: BlogDetailComponent,
    title: 'Đang tải bài viết...'
  },
  {
    path: "",
    component: BlogListComponent,
    title: 'Đang tải bài viết...'
  },
  {
    path: "admin/posts/create",
    component: PostFormComponent,
    title: 'Đang tải bài viết...'
  },
  {
    path: "admin/posts",
    component: PostDashboardComponent,
    title: 'Đang tải bài viết...'
  },
  {
    path: "o/2",
    component: PostListComponent,
    title: 'Đang tải bài viết...'
  },{
    path: "admin/posts/edit/:slug",
    component: PostEditComponent,
    title: 'Đang tải bài viết...'
  },
  {
    path: "admin/category",
    component: CategoryManagerComponent,
    title: 'Đang tải bài viết...'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogsRoutingModule {}
