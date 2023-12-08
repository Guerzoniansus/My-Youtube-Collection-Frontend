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

  private tags$: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);

  private readonly URL: string = environment.backendUrl + "/tags";

  constructor(private userService: UserService, private http: HttpClient) {
    this.http.get<Tag[]>(this.URL, this.userService.createHttpOptionsWithAuthHeader())
      .subscribe((tags) => this.tags$.next(tags));
  }

  /**
   * Gets all tags from the user that are currently loaded.
   */
  getTags(): Observable<Tag[]> {
    return this.tags$.asObservable();
  }

  /**
   * Saves a list of new tags to the user's account in the database.
   * @param tags
   */
  createAndSaveTags(tags: Tag[]): Observable<Tag[]> {
    // The shareReplay pipe shares the result with another subscriber
    const request = this.http.post<Tag[]>(
      this.URL,
      tags,
      this.userService.createHttpOptionsWithAuthHeader()).pipe(shareReplay(1));

    request.subscribe((tagsSavedToDatabase) => this.tags$.next([...this.tags$.value, ...tagsSavedToDatabase]));
    return request;
  }
}
