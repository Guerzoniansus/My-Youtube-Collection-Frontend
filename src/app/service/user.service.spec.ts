import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';

fdescribe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("isLoggedIn()", () => {
    it("should return false when the user is undefined", () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  })
});
