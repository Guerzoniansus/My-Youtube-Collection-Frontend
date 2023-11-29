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

  getSearchQuery(): BehaviorSubject<string> {
    return this.query;
  }

  updateSearchQuery(query: string): void {
    this.query.next(query);
    this.updateUrl();
  }

  getSearchTags(): BehaviorSubject<Tag[]> {
    return this.tags;
  }

  addSearchTags(tags: Tag[]): void {
    const updatedTags: Tag[] = [...this.tags.value, ...tags];
    this.tags.next(updatedTags);
    this.updateUrl();
  }

  addSearchTag(tag: Tag): void {
    const tags: Tag[] = [...this.tags.value, tag];
    this.tags.next(tags);
    this.updateUrl();
  }

  /**
   * Updates the URL based on the current search query and tags
   */
  updateUrl() {
    this.router.navigate(['/home'], { queryParams: { q: this.query.value, tags: this.tags.value } });
  }
}
