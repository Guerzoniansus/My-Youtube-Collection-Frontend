import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Video} from "../model/Video";
import {User} from "../model/User";
import {UserService} from "./user.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private videosSubject: BehaviorSubject<Video[]> = new BehaviorSubject<Video[]>([]);
  private videos: Observable<Video[]> = this.videosSubject.asObservable();

  private URL: string = environment.backendUrl + "/videos";

  constructor(private userService: UserService, private http: HttpClient) {
    this.refreshVideos();
  }

  public getVideos(): Observable<Video[]> {
    return this.videos;
  }

  public refreshVideos(): void {
    this.http.get<Video[]>(this.URL, this.createHttpOption()).subscribe(data => this.videosSubject.next(data));
  }

  public createVideo(video: Video): Observable<any> {
    return this.http.post<Video>(this.URL, video, this.createHttpOption());
  }

  private createHttpOption() {
    return {headers: this.userService.getAuthorizationHeader()};
  }
}
