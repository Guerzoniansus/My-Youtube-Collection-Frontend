import { Component } from '@angular/core';
import {SocialAuthService} from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private authService: SocialAuthService) {
  }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.login(user.email, user.idToken);
    });
  }

  login(email: string, idToken: string) {

  }

}
