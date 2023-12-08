  import { Injectable } from '@angular/core';
  import {BehaviorSubject, combineLatest, forkJoin, map, Observable, skip, take} from "rxjs";
  import {Tag} from "../model/Tag";
  import {ActivatedRoute, Router} from "@angular/router";
  import {TagService} from "./tag.service";
  import {Location} from '@angular/common';
  import {SearchFilter} from "../model/SearchFilter";
  import {removeElementFromArray} from "../utils/RemoveElementFromArray";

  @Injectable({
    providedIn: 'root'
  })
  export class SearchService {
    public readonly DEFAULT_PAGE_SIZE: number = 8;

    /**
     * All tags in the user's account to convert from IDs.
     * @private
     */
    private userTags: Tag[] = [];

    private filter$: BehaviorSubject<SearchFilter> = new BehaviorSubject<SearchFilter>({
      query: null,
      tags: [],
      page: 0,
      pageSize: this.DEFAULT_PAGE_SIZE
    });

    constructor(private route: ActivatedRoute, private router: Router, private tagService: TagService, private location: Location) {
      // Get the user's tags and read search parameters in the URL on page load.
      // It's important that tags are gotten first before we can convert tag IDs to Tags.
      combineLatest([
        // Skip 1 because when the URL has parameters the observable gets called twice, and only the second call has the parameters.
        this.route.queryParamMap,
        this.tagService.getTags()
      ]).pipe(

        map(([params, userTags]) => {
          this.userTags = userTags;

          if (params.keys.length > 0) { // Don't search when there is nothing to search for
            const tagIDs= params.get("tagIDs") == null ? [] : params.get("tagIDs")!.split(",");
            const tags: Tag[] = tagIDs ? this.convertTagIDsToTags(tagIDs) : [];
            const query = params.get("q") || null;
            const page = params.get("page") == null ? 0 : Number.parseInt(params.get("page")!);
            const pageSize = params.get("pageSize") == null ? this.DEFAULT_PAGE_SIZE : Number.parseInt(params.get("pageSize")!);

            this.filter = {query: query, tags: tags, page: page, pageSize: pageSize};
          }
        })

      ).subscribe();
    }

    /**
     * Gets the current value of the Search Filter observable.
     * @private
     */
    private get filter(): SearchFilter {
      return this.filter$.value;
    }

    /**
     * Sets a new search filter, notifies subscribers and updates the URL.
     * @param filter The new filter.
     * @private
     */
    private set filter(filter: SearchFilter) {
      this.filter$.next(filter);
      this.updateUrl(filter);
    }

    /**
     * Returns an observable for the currently active search filter.
     */
    getSearchFilter(): Observable<SearchFilter> {
      return this.filter$.asObservable();
    }

    /**
     * Returns whether the user is currently searching for something by checking
     * if any search filter parameters differ from their default states.
     */
    isSearching(): boolean {
      if (this.filter.tags.length > 0 || this.filter.query || this.filter.page > 0) {
        return true;
      }

      return false;
    }

    /**
     * Creates a list of tags based on a list of tag IDs, matching them with tags in the user's account.
     * @param tagIDs The list of tag IDs.
     */
    private convertTagIDsToTags(tagIDs: string[]) {
      return this.userTags.filter(tag => tagIDs.includes(tag.tagID!.toString()))
    }

    /**
     * Updates the URL based on the given search filter.
     * @param filter The filter to put in the URL.
     * @private
     */
    private updateUrl(filter: SearchFilter) {
      // Using location.go instead of router.navigate in order to not trigger the URL change subscribed event
      // that the constructor listens to
      this.location.go(this.createUrl(filter));
    }

    /**
     * Creates a URL of the home page that contains the current search options as parameters for easy bookmarking.
     * @param filter The filter to put in the URL.
     * @private
     */
    private createUrl(filter: SearchFilter): string {
      const tagIDs = this.convertTagsToStringOfTagIDs(this.filter.tags);
      const query = this.filter.query || null;
      const page = this.filter.page || null;
      const pageSize = this.filter.pageSize == this.DEFAULT_PAGE_SIZE ? null : this.filter.pageSize;

      return this.router.createUrlTree(["/home"], { queryParams: {
          q: query,
          tagIDs: tagIDs,
          page: page,
          pageSize: pageSize
      }}).toString();
    }

    /**
     * Converts a list of tags to a string of tag IDs that can be used as a URL parameter.
     * @param tags The list of tags to convert.
     * @private
     */
    private convertTagsToStringOfTagIDs(tags: Tag[]): string | null {
      return tags.length == 0 ? null : tags.map(tag => tag.tagID).join(',');
    }

    /**
     * Resets the search filter back to default state.
     */
    clear(): void {
      this.filter = {
        query: null,
        tags: [],
        page: 0,
        pageSize: this.DEFAULT_PAGE_SIZE
      };
    }

    /**
     * Updates the search query and starts a new search.
     * @param query The new search query. Use an empty string if the user should get all video's.
     */
    setSearchQuery(query: string): void {
      this.filter = {...this.filter, query: query};
    }

    /**
     * Adds a tag to the search query.
     * @param tag The tag to search for.
     */
    addSearchTag(tag: Tag): void {
      const currentTags = this.filter.tags;
      this.filter = {...this.filter, tags: [...currentTags, ...[tag]]};
    }

    /**
     * Removes a tag from the search query.
     * @param tag The tag to remove.
     */
    removeSearchTag(tag: Tag) : void {
      const newTags: Tag[] = removeElementFromArray(tag, this.filter.tags);
      this.filter = {...this.filter, tags: newTags};
    }

    /**
     * Sets the page size for the search filter.
     * @param pageSize The page size.
     */
    setPageSize(pageSize: number): void {
      this.filter = {...this.filter, pageSize: pageSize};
    }

    /**
     * Sets the page for the search filter.
     * @param page The page number, starting from 0.
     */
    setPage(page: number): void {
      this.filter = {...this.filter, page: page};
    }
  }
