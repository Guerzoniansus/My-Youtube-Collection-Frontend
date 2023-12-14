import {ComponentFixture, TestBed} from '@angular/core/testing';

import { UserService } from './user.service';
import {SocialAuthService} from "@abacritt/angularx-social-login";
import {HomePageComponent} from "../component/home/home-page/home-page.component";
import {User} from "../model/User";

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it("should have an undefined user by default", () => {
    let user;

    service.getUser().subscribe(x => user = x);
    expect(user).toBeUndefined();
  })

  describe("isLoggedIn()", () => {
    it("should return false when the user is undefined", () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  })
});
