import { Component } from '@angular/core';
import { Router } from '@angular/router';

 
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  
  constructor(private router: Router) {}

  /**
   * Navigate to the knowledge library page.
   * @param link The route link to navigate to.
   */
  onClickBtnThuVienKienThuc(link: string){
    this.router.navigate(['danh-muc/'+link]);
  }

}
