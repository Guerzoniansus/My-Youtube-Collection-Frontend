import {Component, OnInit} from '@angular/core';
import {SocialAuthService} from "@abacritt/angularx-social-login";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private loginUrl: string = environment.backendUrl + "/login"

  public error: string = "";
  public connectingToBackend: boolean = false;

  constructor(private authService: SocialAuthService, private http: HttpClient,
              private userService: UserService, private router: Router) {}

  ngOnInit() {
    // The SocialAuthService is from https://github.com/abacritt/angularx-social-login
    // Using that because the official google API wouldn't work
    this.authService.authState.subscribe((user) => {
      this.login(user.idToken);
    });
  }

  /**
   * Logs in the user and redirects them to home.
   * @param idToken The google ID token received from Google's API.
   */
  public login(idToken: string) {
    this.connectingToBackend = true;

    this.http.post(this.loginUrl, idToken, {responseType: 'text'}).subscribe({
      next: jwt => {
        this.error = "";
        this.userService.login(jwt);
        this.connectingToBackend = false;
        this.router.navigate(["home"]).then(() => window.location.reload());
      },
      error: error => {
        this.connectingToBackend = false;
        this.error = "An error occurred, please try again.";
      }
    });
  }

}
