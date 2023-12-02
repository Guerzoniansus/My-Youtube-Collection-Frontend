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

  private videosSubject: BehaviorSubject<Video[]> = new BehaviorSubject<Video[]>([]);
  private videos: Observable<Video[]> = this.videosSubject.asObservable();

  private totalNumberOfVideos: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private URL: string = environment.backendUrl + "/videos";
  private CREATE_URL: string = URL + "/create"

  private searchFilter?: SearchFilter;

  constructor(private userService: UserService, private searchService: SearchService, private http: HttpClient) {
    this.searchService.getSearchFilter().subscribe(searchFilter => {
      this.searchFilter = searchFilter;
      this.refreshVideos();
    });
  }

  public getVideos(): Observable<Video[]> {
    return this.videos;
  }

  public refreshVideos(): void {
    this.http.post<VideoResponse>(this.URL, this.searchFilter?.getSearchFilterDTO(), this.createHttpOption()).pipe(
      catchError(error => {
        console.error('An error occurred while fetching videos:', error);
        return throwError(() =>'An error occurred while fetching videos.');
      })
    ).subscribe(response => {
      this.videosSubject.next(response.videos ? response.videos : []);
      this.totalNumberOfVideos.next(response.totalVideos);
    });
  }

  public createVideo(video: Video): Observable<any> {
    return this.http.post<Video>(this.CREATE_URL, video, this.createHttpOption());
  }

  private createHttpOption() {
    return {headers: this.userService.getAuthorizationHeader()};
  }
}
