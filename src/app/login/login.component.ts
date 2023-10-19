import { Component } from '@angular/core';
import {SocialAuthService} from "@abacritt/angularx-social-login";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import jwtDecode from "jwt-decode";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  private loginUrl: string = environment.backendUrl + "/login"

  public error: string = "";

  constructor(private authService: SocialAuthService, private http: HttpClient) {}

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.login(user.idToken);
    });
  }

  login(idToken: string) {
    this.http.post(this.loginUrl, idToken, {responseType: 'text'}).subscribe({
      next: jwt => {
        this.error = "";
        this.test(jwt);
      },
      error: error => {
        this.error = "An error occurred, please try again.";
      }
    });
  }

  test(jwt: string) {
    const decoded: any = jwtDecode(jwt);
    console.log("Token info: ");
    console.log(jwt);
    console.log(decoded);
    console.log("Email: " + decoded.sub);
  }

}
