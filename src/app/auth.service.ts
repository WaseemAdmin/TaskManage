import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = false;

  login() {
    // Simulate successful login
    this.isAuthenticated = true;
  }

  logout() {
    // Simulate logout
    this.isAuthenticated = false;
  }

  constructor() { }
}
