import { Component } from '@angular/core';
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    if (this.userService.isLoggedIn() == false) {
      this.router.navigate(["/login"]);
    }
  }

}
