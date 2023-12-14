import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  private GOOGLE_API_KEY: string = "AIzaSyB4qFwFnmjS4SFOPKva4jqRdaZ6qNReU_o";

  constructor(private http: HttpClient) {
  }

  /**
   * Consults Youtube's API to get info about a video.
   * For the data representation, see: https://developers.google.com/youtube/v3/docs/videos
   */
  public getVideoInfo(videoCode: string): Observable<any> {
    return this.http.get<any>(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoCode}&key=${this.GOOGLE_API_KEY}`);
  }

  /**
   * Extracts the video code from a youtube url.
   * Returns undefined when the URL does not contain a valid youtube video.
   */
  public extractCodeFromUrl(url: string): string | undefined {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length==11) ? match[7] : undefined;
  }
}
