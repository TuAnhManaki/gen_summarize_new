import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "@app/shared/shared.module";

import { BlogsRoutingModule as BlogsRoutingModule } from "./blog-routing.module";
import { BlogListComponent } from "./pages/blog-list/blog-list.component";
import { BlogDetailComponent } from "./pages/blog-detail/blog-detail.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommentSectionComponent } from "./pages/comment-section/comment-section.component";
import { PostFormComponent } from "./pages/post-form/post-form.component";
import { RouterModule } from "@angular/router";
import { PostListComponent } from "./pages/post-list/post-list.component";
import { CategoryManagerComponent } from "./pages/category-manager/category-manager.component";
import { PostEditComponent } from "./pages/post-edit/post-edit.component";
import { PostDashboardComponent } from "./pages/post-dashboard/post-dashboard.component";
import { BlogFeedComponent } from './pages/blog-feed/blog-feed.component';

@NgModule({
  declarations: [
    BlogListComponent,
    BlogDetailComponent,
    CommentSectionComponent,
    PostFormComponent,
    PostListComponent,
    CategoryManagerComponent,
    PostEditComponent,
    PostDashboardComponent,
    BlogFeedComponent,
  ],
  imports: [
    CommonModule,
    BlogsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DatePipe,
    DecimalPipe,
  ],
  providers: [DatePipe,]
})
export class BlogModule {}

