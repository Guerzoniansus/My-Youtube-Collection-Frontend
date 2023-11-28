import { Injectable } from '@angular/core';
import {Tag} from "../model/Tag";
import {BehaviorSubject, Observable, shareReplay} from "rxjs";
import {User} from "../model/User";
import {UserService} from "./user.service";
import {HttpClient} from "@angular/common/http";
import {Video} from "../model/Video";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  private tagsSubject: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  private tags: Observable<Tag[]> = this.tagsSubject.asObservable();

  private URL: string = environment.backendUrl + "/tags";

  constructor(private userService: UserService, private http: HttpClient) {
    this.http.get<Tag[]>(this.URL, this.createHttpOption()).subscribe((tags) => this.tagsSubject.next(tags));
  }

  public getTags(): Observable<Tag[]> {
    return this.tags;
  }

  public saveTags(tags: Tag[]): Observable<Tag[]> {
    // The shareReplay pipe shares the result with another subscriber
    const request = this.http.post<Tag[]>(this.URL, tags, this.createHttpOption()).pipe(shareReplay(1));
    request.subscribe((tagsSavedToDatabase) => this.tagsSubject.next(tagsSavedToDatabase));
    return request;
  }

  private createHttpOption() {
    return {headers: this.userService.getAuthorizationHeader()};
  }
}
