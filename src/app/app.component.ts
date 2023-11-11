import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'taskapp';
  constructor(private router: Router) {}
  
  navigateToLogin() {
    // router.navigate to navigate to the 'login' route
    this.router.navigate(['login']);
  }
}
