import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
  { path: "dang-nhap", component: LoginComponent },
  { path: "dang-ky", component: RegisterComponent },
  { path: "ca-nhan", component: ProfileComponent },
  { path: "change_password", component: ChangePasswordComponent },
  { path: "forgot_password", component: ForgotPasswordComponent },
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    ChangePasswordComponent,
    EditProfileComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    RouterModule.forChild(routes),
  ],
})
export class AuthModule {}
