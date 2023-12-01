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

  /** The search text that the user typed in. An empty string will get all video's. */
  private searchQuery: BehaviorSubject<string> = new BehaviorSubject<string>("");
  /** The tags the user wants to search for. */
  private searchTags: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);

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
        alert("params");
        this.userTags = userTags;
        const tagIDs= params.get("tagIDs") == null ? [] : params.get("tagIDs")!.split(",");
        const tags: Tag[] = tagIDs ? this.convertTagIDsToTags(tagIDs) : [];
        const query = params.get("q") == null ? "" : params.get("q")!;

        this.searchTags.next(tags);
        this.searchQuery.next(query);
        this.applySearch();
      })
    ).subscribe();
  }

  /**
   * Gets the current search query.
   */
  getSearchQuery(): BehaviorSubject<string> {
    return this.searchQuery;
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
    this.searchQuery.next(query);
    this.applySearch();
  }

  /**
   * Gets the tags that are currently being searched for.
   */
  getSearchTags(): BehaviorSubject<Tag[]> {
    return this.searchTags;
  }

  /**
   * Adds the given tags to the search query.
   * @param tags The tags to search for.
   */
  addSearchTags(tags: Tag[]): void {
    const updatedTags: Tag[] = tags ?  [...this.searchTags.value, ...tags] : [];
    this.searchTags.next(updatedTags);
    this.applySearch();
  }

  /**
   * Adds a tag to the search query.
   * @param tag The tag to search for.
   */
  addSearchTag(tag: Tag): void {
    this.addSearchTags([tag]);
  }

  /**
   * Removes a tag from the search query.
   * @param tag The tag to remove.
   */
  removeSearchTag(tag: Tag) : void {
    const newTags: Tag[] = this.searchTags.value.filter(x => x !== tag);
    this.searchTags.next(newTags);
    this.applySearch()
  }

  clear() {
    this.searchTags.next([]);
    this.searchQuery.next("");
    this.applySearch();
  }

  /**
   * Updates the URL based on the current search query and tags.
   */
  private updateUrl() {
    const tagIDs = this.convertTagsToUrlParameter(this.searchTags.value);
    const query = this.searchQuery.value ? this.searchQuery.value : null;
    const url = this.router.createUrlTree(["/home"], { queryParams: { q: query, tagIDs: tagIDs}}).toString();
    this.location.go(url); // Using this instead of router.navigate in order to not trigger the URL change subscribed event
  }

  /**
   * Updates the URL and refreshes the user's video's based on the current search criteria.
   */
  applySearch() {
    this.updateUrl();
    // TODO
  }

  /**
   * Converts a list of tags to a string of tag IDs that can be used as a URL parameter.
   * @param tags The list of tags to convert.
   * @private
   */
  private convertTagsToUrlParameter(tags: Tag[]): string | null {
    return tags.length == 0 ? null : tags.map(tag => tag.tagID).join(',');
  }
}
