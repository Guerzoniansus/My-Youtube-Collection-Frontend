import { PaginationComponent } from './pagination.component';
import {VideoService} from "../../../service/video.service";
import {SearchService} from "../../../service/search.service";
import {of} from "rxjs";
import {SearchFilter} from "../../../model/SearchFilter";
import {PageEvent} from "@angular/material/paginator";

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let videoService: jasmine.SpyObj<VideoService>;
  let searchService: jasmine.SpyObj<SearchService>;

  beforeEach(() => {
    videoService = jasmine.createSpyObj("VideoService", ["getTotalNumberOfVideos"]);
    searchService = jasmine.createSpyObj("SearchService", ["getSearchFilter", "setPageSize", "setPage"]);

    videoService.getTotalNumberOfVideos.and.returnValue(of(10));
    searchService.getSearchFilter.and.returnValue(of({query: "query", tags: [], page: 0, pageSize: 8}));

    component = new PaginationComponent(videoService, searchService);
  });

  it('should create', () => {
    component = new PaginationComponent(videoService, searchService);
    expect(component).toBeTruthy();
  });

  it('should initialize the total number of videos', () => {
    videoService.getTotalNumberOfVideos.and.returnValue(of(10));

    component = new PaginationComponent(videoService, searchService);
    component.ngOnInit();

    expect(component.numberOfVideos).toEqual(10)
  });

  it("should initialize the searchFilter", () => {
    const filter: SearchFilter = {query: "query", tags: [], page: 5, pageSize: 8};
    searchService.getSearchFilter.and.returnValue(of(filter));

    component = new PaginationComponent(videoService, searchService);
    component.ngOnInit();

    expect(component.filter).toEqual(filter);
  });

  it('should call setPageSize when page size changes', () => {
    component.filter = {page: 0, pageSize: 10, tags: [], query: ""};
    const event: PageEvent = { pageIndex: 0, pageSize: 999, length: 20 };
    component.handlePageEvent(event);

    expect(searchService.setPageSize).toHaveBeenCalledWith(event.pageSize);
    expect(searchService.setPage).not.toHaveBeenCalled();
  });

  it('should call setPage when page index changes', () => {
    component.filter = {page: 0, pageSize: 10, tags: [], query: ""};
    const event: PageEvent = { pageIndex: 999, pageSize: 10, length: 100 };
    component.handlePageEvent(event);

    expect(searchService.setPage).toHaveBeenCalledWith(event.pageIndex);
    expect(searchService.setPageSize).not.toHaveBeenCalled();
  });

  it('should not call any service method when neither pageIndex nor pageSize changes', () => {
    component.filter = {page: 0, pageSize: 10, tags: [], query: ""};
    const event: PageEvent = { pageIndex: 0, pageSize: 10, length: 100 };
    component.handlePageEvent(event);

    expect(searchService.setPage).not.toHaveBeenCalled();
    expect(searchService.setPageSize).not.toHaveBeenCalled();
  });
});
