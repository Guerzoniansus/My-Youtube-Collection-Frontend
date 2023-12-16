import { HomePageComponent } from './home-page.component';
import {VideoService} from "../../../service/video.service";
import {SearchService} from "../../../service/search.service";
import {of} from "rxjs";
import {Router} from "@angular/router";
import {UserService} from "../../../service/user.service";
import {SearchFilter} from "../../../model/SearchFilter";
import {SearchInfoComponent} from "../search-info/search-info.component";
import {Video} from "../../../model/Video";
import {MatSnackBar} from "@angular/material/snack-bar";

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let router: jasmine.SpyObj<Router>;
  let userService: jasmine.SpyObj<UserService>;
  let videoService: jasmine.SpyObj<VideoService>;
  let searchService: jasmine.SpyObj<SearchService>;
  let snackbar: jasmine.SpyObj<MatSnackBar>;


  beforeEach(() => {
    router = jasmine.createSpyObj("Router", ["navigate"]);
    userService = jasmine.createSpyObj("UserService", ["isLoggedIn"]);
    videoService = jasmine.createSpyObj("VideoService", ["getVideos", "refreshVideos"]);
    searchService = jasmine.createSpyObj("SearchService", ["getSearchFilter", "clear", "removeSearchTag", "isSearching"]);
    snackbar = jasmine.createSpyObj("MatSnackBar", ["open"]);

    userService.isLoggedIn.and.returnValue(true);
    videoService.getVideos.and.returnValue(of([]));
    searchService.getSearchFilter.and.returnValue(of({query: "query", tags: [], page: 0, pageSize: 8}));

    component = new HomePageComponent(userService, router, searchService, videoService, snackbar);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should initialize", () => {
    const videos: Video[] = [{videoID: 1, videoCode: "code", tags: [], channel: "ch", title: "title", alternativeTitle: "altTitle"}]
    videoService.getVideos.and.returnValue(of(videos));

    const filter: SearchFilter = {query: "query", tags: [], page: 999, pageSize: 999};
    searchService.getSearchFilter.and.returnValue(of(filter));

    component = new HomePageComponent(userService, router, searchService, videoService, snackbar);
    component.ngOnInit();

    expect(component.videos).toEqual(videos);
    expect(component.filter).toEqual(filter);
  });

  it("should navigate to the login page if not logged in", () => {
    userService.isLoggedIn.and.returnValue(false);

    component = new HomePageComponent(userService, router, searchService, videoService, snackbar);
    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(["/login"]);
  })

  it("Should set editing to true", () => {
    component.isCreatingVideo = false;
    component.addVideo();
    expect(component.isCreatingVideo).toEqual(true);
  })

  it("should handle onFinishedEditingVideoEvent", () => {
    const message = "Saved video";
    searchService.isSearching.and.returnValue(false);

    component.onFinishedEditingVideoEvent(message);

    expect(component.isCreatingVideo).toEqual(false);
    expect(videoService.refreshVideos).toHaveBeenCalled();
  });

  it("should not refresh videos when the event message is not Saved video", () => {
    const message = "bla bla bla";
    searchService.isSearching.and.returnValue(false);

    component.onFinishedEditingVideoEvent(message);

    expect(component.isCreatingVideo).toEqual(false);
    expect(videoService.refreshVideos).not.toHaveBeenCalled();
  });
});
