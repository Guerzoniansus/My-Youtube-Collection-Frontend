import { VideoService } from './video.service';
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SearchService} from "./search.service";
import {of, skip} from "rxjs";
import {Video} from "../model/Video";
import any = jasmine.any;
import {fakeAsync, flush, tick} from "@angular/core/testing";

const headers = {headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': "Bearer jwt"}) };

describe('VideoService', () => {
  let service: VideoService;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let searchServiceMock: jasmine.SpyObj<SearchService>;
  let httpClientMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    userServiceMock = jasmine.createSpyObj('UserService', ['createHttpOptionsWithAuthHeader']);
    userServiceMock.createHttpOptionsWithAuthHeader.and.returnValue(headers);

    searchServiceMock = jasmine.createSpyObj('SearchService', ['getSearchFilter']);
    searchServiceMock.getSearchFilter.and.returnValue(of({tags: [], page: 0, pageSize: 8, query: ""}));

    httpClientMock = jasmine.createSpyObj('HttpClient', ['post']);

    spyOn(VideoService.prototype, "refreshVideos"); // This is so the spy can be set before the constructor happens
    service = new VideoService(userServiceMock, searchServiceMock, httpClientMock);
  });

  it('should be created', () => {
    httpClientMock.post.and.returnValue(of({ videos: [], totalVideos: 1 }));
    expect(service).toBeTruthy();
  });

  it("should call refreshVideos in the constructor", () => {
    httpClientMock.post.and.returnValue(of({ videos: [], totalVideos: 1 }));

    expect(service.refreshVideos).toHaveBeenCalled();
  })

  it('should get the videos when refreshed', fakeAsync(() => {
    const video: Video = {videoID: 1, videoCode: "code", tags: [], channel: "channel", alternativeTitle: "altTitle", title: "title"};
    httpClientMock.post.and.returnValue(of({ videos: [video], totalVideos: 1 }));

    service.refreshVideos();

    service.getVideos().pipe(skip(1)).subscribe(videos => {
      console.log('Videos:', videos);
      expect(videos[0]).toEqual(video);
    });
  }));

  it('should update the total amount of videos retrieved', fakeAsync(() => {
    const expectedAmount = 200;
    const video: Video = {videoID: 1, videoCode: "code", tags: [], channel: "channel", alternativeTitle: "altTitle", title: "title"};
    httpClientMock.post.and.returnValue(of({ videos: [video], totalVideos: expectedAmount }));

    service.refreshVideos();

    // Skip the one that gets called in constructor
    service.getTotalNumberOfVideos().pipe(skip(1)).subscribe(amount => {
      expect(amount).toEqual(expectedAmount);
    });
  }));
});
