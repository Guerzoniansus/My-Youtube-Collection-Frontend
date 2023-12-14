import { SearchInfoComponent } from './search-info.component';
import {VideoService} from "../../../service/video.service";
import {SearchService} from "../../../service/search.service";
import {of} from "rxjs";
import {SearchFilter} from "../../../model/SearchFilter";
import {Tag} from "../../../model/Tag";

describe('SearchInfoComponent', () => {
  let component: SearchInfoComponent;
  let videoService: jasmine.SpyObj<VideoService>;
  let searchService: jasmine.SpyObj<SearchService>;

  beforeEach(() => {
    videoService = jasmine.createSpyObj("VideoService", ["getTotalNumberOfVideos"]);
    searchService = jasmine.createSpyObj("SearchService", ["getSearchFilter", "clear", "removeSearchTag"]);

    videoService.getTotalNumberOfVideos.and.returnValue(of(10));
    searchService.getSearchFilter.and.returnValue(of({query: "query", tags: [], page: 0, pageSize: 8}));

    component = new SearchInfoComponent(videoService, searchService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should initialize", () => {
    videoService.getTotalNumberOfVideos.and.returnValue(of(999));

    const filter: SearchFilter = {query: "query", tags: [], page: 999, pageSize: 999};
    searchService.getSearchFilter.and.returnValue(of(filter));

    component = new SearchInfoComponent(videoService, searchService);
    component.ngOnInit();

    expect(component.numberOfVideos).toEqual(999);
    expect(component.filter).toEqual(filter);
  });

  it("should remove tags", () => {
    const tag: Tag = {tagID: 1, text: "tagText"};
    component.removeTag(tag);
    expect(searchService.removeSearchTag).toHaveBeenCalledWith(tag);
  })

  it("should clear the search", () => {
    component.clearSearch();
    expect(searchService.clear).toHaveBeenCalled();
  })
});
