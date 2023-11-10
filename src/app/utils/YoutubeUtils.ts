import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export class YoutubeUtils {

  constructor(private http: HttpClient) {
  }

  public getVideoInfo(videoCode: string): Observable<any> {
    return this.http.get<any>("https://aiotube.deta.dev/video/" + videoCode);
  }

  public extractCodeFromUrl(url: string): string | undefined {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : undefined;
  }
}
