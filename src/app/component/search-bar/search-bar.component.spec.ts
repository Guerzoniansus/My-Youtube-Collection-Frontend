import { SearchBarComponent } from './search-bar.component';
import {SearchService} from "../../service/search.service";
import {TagService} from "../../service/tag.service";
import {of} from "rxjs";
import {Tag} from "../../model/Tag";
import {ElementRef} from "@angular/core";

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let searchService: jasmine.SpyObj<SearchService>;
  let tagService: jasmine.SpyObj<TagService>;
  let tagInputElement: jasmine.SpyObj<ElementRef<HTMLInputElement>>;

  beforeEach(() => {
    searchService = jasmine.createSpyObj("SearchService", ["getSearchFilter", "addSearchTag", "setSearchQuery"]);
    tagService = jasmine.createSpyObj("TagService", ["getTags"]);
    tagInputElement = jasmine.createSpyObj("ElementRef<HTMLInputElement>", ["nativeElement"]);

    searchService.getSearchFilter.and.returnValue(of({tags: [], page: 0, pageSize: 8, query: ""}));
    tagService.getTags.and.returnValue(of([]));

    component = new SearchBarComponent(searchService, tagService);
    component.tagInputElement = tagInputElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize', () => {
    const userTags: Tag[] = [{ tagID: 1, text: 'tag1' }, { tagID: 2, text: 'tag2' }];
    tagService.getTags.and.returnValue(of(userTags));
    searchService.getSearchFilter.and.returnValue(of({ tags: userTags, page: 0, pageSize: 8, query: '' }));

    component.ngOnInit();

    expect(component.userTags).toEqual(userTags);
    expect(component.selectedTags).toEqual(userTags);
  });

  it('should add selected tag to search results', () => {
    const selectedTag: Tag = { tagID: 1, text: 'selectedTag' };
    component.selectedTag(selectedTag);

    expect(searchService.addSearchTag).toHaveBeenCalledWith(selectedTag);
  });

  it('should set search query on pressing enter', () => {
    const query = 'searchQuery';
    component.pressedEnter(query);

    expect(searchService.setSearchQuery).toHaveBeenCalledWith(query);
  });

  it('should filter autocomplete tags based on input and is case-insensitive', (done) => {
    const input = 'tAg';
    const tags: Tag[] = [{ tagID: 1, text: 'tag1' }, { tagID: 2, text: 'tag2' }];

    tagService.getTags.and.returnValue(of(tags));
    component.ngOnInit();

    component.tagInput.setValue(input);
    component.tagInput.updateValueAndValidity();

    component.autocompleteTags.subscribe(tags => {
      expect(tags).toEqual(tags);
      done();
    })
  });

  it("should check if a tag is already selected: return true", () => {
    component.selectedTags.push({tagID: 1, text: "pizza"});
    expect(component.isTagAlreadySelected("pizza")).toEqual(true);
  });

  it("should check if a tag is already selected: return false", () => {
    component.selectedTags.push({tagID: 1, text: "pizza"});
    expect(component.isTagAlreadySelected("hamburger")).toEqual(false);
  });

  it('should not include already selected tags in autocomplete suggestions', (done) => {
    const input = 'tag';
    const userTags: Tag[] = [
      { tagID: 1, text: 'tag1' },
      { tagID: 2, text: 'tag2' },
      { tagID: 3, text: 'different' }
    ];

    const selectedTags: Tag[] = [
      { tagID: 1, text: 'tag1' },
      { tagID: 2, text: 'tag2' }
    ];

    const expectedFilteredTags: Tag[] = [];

    tagService.getTags.and.returnValue(of(userTags));
    searchService.getSearchFilter.and.returnValue(of({ tags: selectedTags, page: 0, pageSize: 8, query: '' }));
    component.ngOnInit();

    component.tagInput.setValue(input);
    component.tagInput.updateValueAndValidity();

    component.autocompleteTags.subscribe(tags => {
      expect(tags).toEqual(expectedFilteredTags);
      done();
    })
  });
});
