import { Injectable } from '@angular/core';
import jwtDecode from "jwt-decode";
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../model/User";
import {HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user$: BehaviorSubject<User|undefined> = new BehaviorSubject<User|undefined>(undefined);

  constructor() {
    this.initFromLocalStorage();
  }

  /**
   * Gets the current user.
   * @private
   */
  private get user(): User | undefined {
    return this.user$.value;
  }

  /**
   * Sets a new user.
   * @param user The user to set.
   * @private
   */
  private set user(user: User | undefined) {
    this.user$.next(user);
  }

  /**
   * Returns an Observable User object that can be subscribed to.
   */
  public getUser(): Observable<User | undefined> {
    return this.user$.asObservable();
  }

  /**
   * Stores a JWT to local storage and updates the observable User object.
   * @param jwt The jwt to store.
   */
  public login(jwt: string): void {
    localStorage.setItem("jwt", jwt);
    this.user = this.createUser();
  }

  /**
   * Removes the JWT from local storage and sets the observable user to undefined.
   */
  public logout(): void {
    localStorage.removeItem("jwt");
    this.user = undefined;
  }

  /**
   * Checks whether the user is currently logged in or not.
   */
  public isLoggedIn() {
    return this.user != undefined;
  }

  /**
   * Creates a HTTP option for requests. It includes a header for authorization.
   */
  public createHttpOptionsWithAuthHeader(): {headers: HttpHeaders} {
    return {headers: this.getAuthorizationHeader()};
  }

  /**
   * Creates a HTTP option that includes the JWT token for authentication.
   */
  public getAuthorizationHeader(): HttpHeaders {
    const jwt = this.getJwt();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + jwt
    });
  }

  /**
   * Checks if the user currently has a JWT in local storage or not.
   */
  public hasJwt(): boolean {
    return localStorage.getItem("jwt") != null;
  }

  /**
   * Retrieves the JWT from local storage.
   */
  public getJwt(): string | null {
    return localStorage.getItem("jwt");
  }

  /**
   * Extracts the user's email from the given JWT.
   * @param jwt The JWT to extract the email from.
   * @private
   */
  private extractEmailFromJwt(jwt: string): string {
    const decoded: any = jwtDecode(jwt);
    return decoded.sub;
  }

  /**
   * Logs the user in if there's a JWT stored in local storage.
   * @private
   */
  private initFromLocalStorage(): void {
    if (this.hasJwt()) {
      this.user = this.createUser();
    }
  }

  /**
   * Create a user object based on the JWT stored in local storage.
   * @private
   */
  private createUser(): User {
    const jwt = this.getJwt();
    const email = this.extractEmailFromJwt(jwt!);

    return {email: email, jwt: jwt!};
  }

}
