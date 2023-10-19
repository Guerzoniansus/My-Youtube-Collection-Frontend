import { Injectable } from '@angular/core';
import jwtDecode from "jwt-decode";
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../model/User";
import {SocialAuthService} from "@abacritt/angularx-social-login";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject: BehaviorSubject<User|undefined> = new BehaviorSubject<User|undefined>(undefined);
  private user: Observable<User | undefined> = this.userSubject.asObservable();

  constructor(private authService: SocialAuthService) {
    this.initFromLocalStorage();
  }

  public getUser(): Observable<User | undefined> {
    return this.user;
  }

  public login(jwt: string): void {
    localStorage.setItem("jwt", jwt);
    this.userSubject.next(this.createUser());
  }

  public logout(): void {
    localStorage.removeItem("jwt");
    this.userSubject.next(undefined);
  }

  public isLoggedIn() {
    return this.userSubject.value != undefined;
  }

  public hasJwt(): boolean {
    return localStorage.getItem("jwt") != null;
  }

  public getJwt(): string | null {
    return localStorage.getItem("jwt");
  }

  private extractEmailFromJwt(jwt: string): string {
    const decoded: any = jwtDecode(jwt);
    return decoded.sub;
  }

  private initFromLocalStorage(): void {
    if (this.hasJwt()) {
      this.userSubject.next(this.createUser());
    }
  }

  private createUser(): User {
    const jwt = this.getJwt();
    const email = this.extractEmailFromJwt(jwt!);

    return {email: email, jwt: jwt!};
  }

}
