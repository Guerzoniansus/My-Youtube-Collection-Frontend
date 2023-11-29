import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Tag} from "../model/Tag";
import {ActivatedRoute, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private query: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private tags: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);

  constructor(private route: ActivatedRoute, private router: Router) {
    // Read URL on page load
    this.updateSearchQuery(this.route.snapshot.params['q']);
    this.addSearchTags(this.route.snapshot.params['tags']);
  }

  /**
   * Gets the current search query.
   */
  getSearchQuery(): BehaviorSubject<string> {
    return this.query;
  }

  /**
   * Updates the search query and starts a new search.
   * @param query The new search query.
   */
  updateSearchQuery(query: string): void {
    this.query.next(query);
    this.updateUrl();
  }

  /**
   * Gets the tags that are currently being searched for.
   */
  getSearchTags(): BehaviorSubject<Tag[]> {
    return this.tags;
  }

  /**
   * Adds the given tags to the search query.
   * @param tags The tags to search for.
   */
  addSearchTags(tags: Tag[]): void {
    const updatedTags: Tag[] = tags ?  [...this.tags.value, ...tags] : [];
    this.tags.next(updatedTags);
    this.updateUrl();
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
    const newTags: Tag[] = this.tags.value.filter(x => x !== tag);
    this.tags.next(newTags);
    this.updateUrl()
  }

  /**
   * Updates the URL based on the current search query and tags
   */
  updateUrl() {
    this.router.navigate(['/home'], { queryParams: { q: this.query.value, tags: this.tags.value } });
  }
}
