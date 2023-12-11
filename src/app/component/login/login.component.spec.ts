import { LoginComponent } from './login.component';
import {Observable, of, throwError} from "rxjs";
import {environment} from "../../../environments/environment";


fdescribe('LoginFormComponent', () => {
  const JWT = "jwt";

  let component: LoginComponent;

  let mockAuthService = jasmine.createSpyObj("SocialAuthService", ["authState"]);
  let mockHttp = jasmine.createSpyObj("HttpClient", ["post"]);
  let userService = jasmine.createSpyObj("UserService", ["login"]);
  let mockRouter = jasmine.createSpyObj("Router", ["navigate"]);

  beforeEach(() => {
    component = new LoginComponent(mockAuthService, mockHttp, userService, mockRouter);
    mockHttp.post.and.returnValue(of(JWT));
    mockRouter.navigate.and.returnValue(new Promise(() => {}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should do a request to the backend to login", () => {
    component.login("testIdToken");
    expect(mockHttp.post).toHaveBeenCalledWith(environment.backendUrl + "/login", "testIdToken", {responseType: 'text'});
  })

  it("should reset the error on login", () => {
    component.error = "error";
    component.login("testIdToken");
    expect(mockHttp.post).toHaveBeenCalledWith(environment.backendUrl + "/login", "testIdToken", {responseType: 'text'});
    expect(component.error).toEqual("");
  })

  it("should set the error on a failed login", () => {
    mockHttp.post.and.returnValue(throwError(() => new Error("{status: 404}")));
    component.login("testIdToken");
    expect(component.error).toEqual("An error occurred, please try again.");
  })

  it("should set connectingToBackend to false on a succesful login", () => {
    component.connectingToBackend = true;
    component.login("testIdToken");
    expect(component.connectingToBackend).toEqual(false);
  })

  it("should set connectingToBackend to false on a failed login", () => {
    component.connectingToBackend = true;
    mockHttp.post.and.returnValue(throwError(() => new Error("{status: 404}")));
    component.login("testIdToken");
    expect(component.connectingToBackend).toEqual(false);
  })

  it("should call the user service to log in on a successful login request", () => {
    component.login("testIdToken");
    expect(userService.login).toHaveBeenCalledWith(JWT);
  })

  it("navigate to home on a succesful login", () => {
    component.login("testIdToken");
    expect(mockRouter.navigate).toHaveBeenCalledWith(["home"]);
  })
});
