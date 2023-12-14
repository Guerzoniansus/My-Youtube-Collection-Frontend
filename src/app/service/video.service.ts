import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, Observable, throwError} from "rxjs";
import {Video} from "../model/Video";
import {UserService} from "./user.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {SearchFilter} from "../model/SearchFilter";
import {SearchService} from "./search.service";
import {VideoResponse} from "../model/VideoResponse";

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private videos$: BehaviorSubject<Video[]> = new BehaviorSubject<Video[]>([]);
  private totalNumberOfVideos$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private URL: string = environment.backendUrl + "/videos";
  private CREATE_URL: string = this.URL + "/create"

  private searchFilter?: SearchFilter;

  constructor(private userService: UserService, private searchService: SearchService, private http: HttpClient) {
    this.searchService.getSearchFilter().subscribe(searchFilter => {
      this.searchFilter = searchFilter;
      this.refreshVideos();
    });
  }

  /**
   * Gets the most recently retrieved videos.
   */
  public getVideos(): Observable<Video[]> {
    return this.videos$.asObservable();
  }

  /**
   * Returns how many videos were found with the current search filter.
   */
  public getTotalNumberOfVideos():Observable<number> {
    return this.totalNumberOfVideos$.asObservable();
  }

  /**
   * Retrieves new videos based on the current search filter.
   */
  public refreshVideos(): void {
    this.http.post<VideoResponse>(this.URL, this.searchFilter, this.userService.createHttpOptionsWithAuthHeader())
      .subscribe(response => {
      this.videos$.next(response.videos ? response.videos : []);
      this.totalNumberOfVideos$.next(response.totalVideos);
    });
  }

  public createVideo(video: Video): Observable<any> {
    return this.http.post<Video>(this.CREATE_URL, video, this.userService.createHttpOptionsWithAuthHeader());
  }
}
