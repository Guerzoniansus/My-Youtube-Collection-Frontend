import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import { Location } from '@angular/common';
import { SearchService } from './search.service';
import { TagService } from './tag.service';
import {last, of, skip} from "rxjs";
import {Tag} from "../model/Tag";
import {RouterTestingModule} from "@angular/router/testing";

describe('SearchService', () => {
  let service: SearchService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        SearchService,
        TagService,
        { provide: ActivatedRoute, useValue: {queryParamMap: of(convertToParamMap([]))} },
      ]
    });
    service = TestBed.inject(SearchService);
    location = TestBed.inject(Location);
    spyOn(location, "go");
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  })

  it('should return the current search filter', (done) => {
    service.getSearchFilter().subscribe(filter => {
      expect(filter).toEqual({
        query: null,
        tags: [],
        page: 0,
        pageSize: service.DEFAULT_PAGE_SIZE
      });
      done();
    });
  });

  it('should set the search query', (done) => {
    const testQuery = 'test';
    service.setSearchQuery(testQuery);
    service.getSearchFilter().subscribe(filter => {
      expect(filter.query).toEqual(testQuery);
      done();
    });
  });

  it('should add a search tag', (done) => {
    const testTag: Tag = { tagID: 1, text: 'test' };
    service.addSearchTag(testTag);
    service.getSearchFilter().subscribe(filter => {
      expect(filter.tags).toContain(testTag);
      done();
    });
  });

  it('should remove a search tag', (done) => {
    const testTag: Tag = { tagID: 1, text: 'test' };
    service.addSearchTag(testTag);
    service.removeSearchTag(testTag);
    service.getSearchFilter().subscribe(filter => {
      expect(filter.tags).not.toContain(testTag);
      done();
    });
  });

  it('should set the page size', (done) => {
    const testPageSize = 500;
    service.setPageSize(testPageSize);
    service.getSearchFilter().subscribe(filter => {
      expect(filter.pageSize).toEqual(testPageSize);
      done();
    });
  });

  it('should set the page', (done) => {
    const testPage = 7;
    service.setPage(testPage);
    service.getSearchFilter().subscribe(filter => {
      expect(filter.page).toEqual(testPage);
      done();
    });
  });

  it('should update the URL when setting the search query', () => {
    const testQuery = 'test';
    const expectedUrlParams = "?q=" + testQuery;
    service.setSearchQuery(testQuery);
    expect(location.go).toHaveBeenCalledWith(jasmine.stringContaining(expectedUrlParams));
  });

  it('should update the URL when adding a search tag', () => {
    const testTag: Tag = { tagID: 1, text: 'test' };
    const expectedUrlParams = "?tagIDs=" + testTag.tagID;
    service.addSearchTag(testTag);
    expect(location.go).toHaveBeenCalledWith(jasmine.stringContaining(expectedUrlParams));
  });

  it('should update the URL for multiple search tags', () => {
    const testTag: Tag = { tagID: 1, text: 'test' };
    const testTag2: Tag = { tagID: 2, text: 'test' };
    const expectedUrlParams = "?tagIDs=1,2";
    service.addSearchTag(testTag);
    service.addSearchTag(testTag2);
    expect(location.go).toHaveBeenCalledWith(jasmine.stringContaining(expectedUrlParams));
  });

  it('should update the URL when setting the page size', () => {
    const testPageSize = 10;
    const expectedUrlParams = "?pageSize=" + testPageSize;
    service.setPageSize(testPageSize);
    expect(location.go).toHaveBeenCalledWith(jasmine.stringContaining(expectedUrlParams));
  });

  it('should update the URL when setting the page', () => {
    const testPage = 5;
    const expectedUrlParams = "?page=" + testPage;
    service.setPage(testPage);
    expect(location.go).toHaveBeenCalledWith(jasmine.stringContaining(expectedUrlParams));
  });
});

