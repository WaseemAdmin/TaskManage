import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  title = 'LOGIN';
  readonly APIurl = "http://localhost:5000/api/taskapp/"; //variable to save the API url

  showSignupForm = false;

  username: string = ''; // storing the login username
  password: string = ''; // storing the login password
  signupUsername: string = '';  // storing the signup username
  signupPassword: string = ''; // storing the signup password

  // Signup div messages
  errorMsg=false;
  errorMessage='';
  signUpFail(message:string)
  {
    this.errorMessage = message;
    this.errorMsg = true;
    setTimeout(() => {
      this.errorMsg = false;
      this.errorMessage = ''; 
    }, 5000);
  }

  // Login div messages
  missMsg=false;
  missingData='';
  loginFail(message:string)
  {
    this.missingData = message;
    this.missMsg = true;
    setTimeout(() => {
      this.missMsg = false;
      this.missingData = ''; 
    }, 5000);
  }

  // Sucessfully added user Message
  showAMessage=false;
  theMessage='';
  showMessage(message:string)
  {
    this.theMessage = message;
    this.showAMessage = true;
    setTimeout(() => {
      this.showAMessage = false;
      this.theMessage = ''; 
    }, 5000); // 5 seconds
  }

  constructor(private http: HttpClient, private router: Router,private authService: AuthService) { }

  // Signup Function
  signup() {
    if(!this.signupUsername && !this.signupPassword){
      this.signUpFail('Username and password are empty');
      return;
    }
    else if (!this.signupUsername && this.signupPassword) {
      this.signUpFail('Missing Username');
      return;
    }
    else if (!this.signupPassword && this.signupUsername) {
      this.signUpFail('Missing Password');
      return;
    }

    const formData = new FormData();
    formData.append('userName', this.signupUsername);
    formData.append('password', this.signupPassword);

  
    const headers = new HttpHeaders({
      'Accept': 'text/plain', // Expect plain text response
    });
  
    this.http.post(this.APIurl + 'AddUser', formData, { headers, responseType: 'text' }).subscribe(
      (response) => {
        if (response === 'User added successfully') {
          console.log("User added successfully");
          this.showMessage('User Added. Log in now.');

          this.showAMessage = true; 
          this.showSignupForm=false;
          this.signupUsername='';
          this.signupPassword='';
          this.errorMsg=false;
        } else {
          console.error("User not added");
        }
      },
      (error) => {
        this.showAMessage = false;
        this.errorMsg=true;
        if(error.status==500){this.signUpFail("User already taken");}
      }
    );
  }

  // Login Funtion 
  login() {
    if(!this.username && !this.password){
      this.loginFail('Username and password are empty');
      return;
    }
    else if (!this.username && this.password) {
      this.loginFail('Missing Username');
      return;
    }
    else if (!this.password && this.username) {
      this.loginFail('Missing Password');
      return;
    }
    // Send username and password exactly as entered by the user
    const body = {
      userName: this.username,
      password: this.password
    };

    this.http.post(this.APIurl + 'GetUser', body).subscribe(
      (data: any) => {
        if (data === 'User Found') {
          // The user found in the database.
          console.log('User found');
          this.authService.login();
          this.router.navigate(['/taskManagement']); // Navigate to the app component
        } else {
            // The user was not found or authentication failed
          this.loginFail(' Invalid Username or Password');
        }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
  
}

