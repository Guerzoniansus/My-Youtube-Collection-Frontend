import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin, map, skip, take} from "rxjs";
import {Tag} from "../model/Tag";
import {ActivatedRoute, Router} from "@angular/router";
import {TagService} from "./tag.service";
import {Location} from '@angular/common';
import {SearchFilter} from "../model/SearchFilter";



@Injectable({
  providedIn: 'root'
})
export class SearchService {

  // /** The search text that the user typed in. An empty string will get all video's. */
  // private searchQuery: BehaviorSubject<string> = new BehaviorSubject<string>("");
  // /** The tags the user wants to search for. */
  // private searchTags: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);


  private filter = new SearchFilter();
  private filterSubject: BehaviorSubject<SearchFilter> = new BehaviorSubject<SearchFilter>(this.filter);

  /**
   * All tags in the user's account to convert from IDs.
   * @private
   */
  private userTags: Tag[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private tagService: TagService, private location: Location) {
    // Get the user's tags and Read search parameters in the URL on page load
    // It's important that tags are gotten first before we can change tag IDs to Tags.
    combineLatest([
      // Skip 1 because when the URL has parameters the observable gets called twice, and only the second call has the parameters.
      this.route.queryParamMap.pipe(skip(1)), // .pipe(skip(1))
      this.tagService.getTags()
    ]).pipe(
      map(([params, userTags]) => {
        this.userTags = userTags;
        const tagIDs= params.get("tagIDs") == null ? [] : params.get("tagIDs")!.split(",");
        const tags: Tag[] = tagIDs ? this.convertTagIDsToTags(tagIDs) : [];
        const query = params.get("q") == null ? null : params.get("q")!;

        this.filter.tags = tags;
        this.filter.query = query;
        this.applySearch();
      })
    ).subscribe();
  }

  /**
   * Returns an observable for the currently active search filter.
   * Do not edit the values inside the filter directly. Use this service instead.
   */
  getSearchFilter(): BehaviorSubject<SearchFilter> {
    return this.filterSubject;
  }

  /**
   * Updates the URL and refreshes the user's video's based on the current search criteria.
   */
  applySearch() {
    this.filterSubject.next(this.filter);
    this.updateUrl();
    // TODO
  }

  /**
   * Creates a list of tags based on a list of tag IDs, matching them with tags in the user's account.
   * @param tagIDs The list of tag IDs.
   */
  convertTagIDsToTags(tagIDs: string[]) {
    return this.userTags.filter(tag => tagIDs.includes(tag.tagID!.toString()))
  }

  /**
   * Updates the search query and starts a new search.
   * @param query The new search query. Use an empty string if the user should get all video's.
   */
  setSearchQuery(query: string): void {
    this.filter.query = query;
    this.applySearch();
  }

  /**
   * Adds the given tags to the search query and fires off a new search action.
   * @param tags The tags to search for.
   */
  addSearchTags(tags: Tag[]): void {
    this.filter.addTags(tags)
    this.applySearch();
  }

  /**
   * Adds a tag to the search query and fires off a new search action.
   * @param tag The tag to search for.
   */
  addSearchTag(tag: Tag): void {
    this.filter.addTag(tag);
    this.applySearch();
  }

  /**
   * Removes a tag from the search query.
   * @param tag The tag to remove.
   */
  removeSearchTag(tag: Tag) : void {
    this.filter.removeTag(tag);
    this.applySearch()
  }

  /**
   * Clears all filter parameters from the search filter and fires off a new search action.
   */
  clear() {
    this.filter.clear();
    this.applySearch();
  }

  /**
   * Creates an URL of the home page that contains the current search options as parameters for easy bookmarking.
   */
  createUrl(): string {
    const tagIDs = this.convertTagsToStringOfTagIDs(this.filter.tags);
    const query = this.filter.query;
    return this.router.createUrlTree(["/home"], { queryParams: { q: query, tagIDs: tagIDs}}).toString();
  }

  /**
   * Updates the URL based on the current search query and tags.
   */
  private updateUrl() {
    // Using location.go instead of router.navigate in order to not trigger the URL change subscribed event
    // that the constructor listens to
    this.location.go(this.createUrl());
  }

  /**
   * Converts a list of tags to a string of tag IDs that can be used as a URL parameter.
   * @param tags The list of tags to convert.
   * @private
   */
  private convertTagsToStringOfTagIDs(tags: Tag[]): string | null {
    return tags.length == 0 ? null : tags.map(tag => tag.tagID).join(',');
  }
}
