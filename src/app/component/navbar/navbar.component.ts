import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../service/user.service";
import {User} from "../../model/User";
import {SearchService} from "../../service/search.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  public user?: User;

  constructor(private router: Router, public userService: UserService, private searchService: SearchService) {
    this.userService.getUser().subscribe(user => this.user = user);
  }

  /**
   * Logs out the user. Refreshes the page to make sure it goes correctly.
   */
  logout() {
    this.userService.logout();
    window.location.reload();
  }

  /**
   * Returns whether the user is on the homepage.
   */
  get isHomePage(): boolean {
    return this.router.url.includes("/home");
  }

  /**
   * Event that gets fired when the user clicks on the home button.
   */
  onHomeButtonClick(): void {
    if (this.isHomePage) {
      this.searchService.clear();
    }
    else this.router.navigate(['/home']);
  }

}
