import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../service/user.service";
import {User} from "../model/User";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  public user?: User;

  constructor(private router: Router, public userService: UserService) {
    this.userService.getUser().subscribe(user => this.user = user);
  }

  logout() {
    this.userService.logout();
    window.location.reload();
  }
}
