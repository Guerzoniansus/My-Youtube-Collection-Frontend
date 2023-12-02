import {Tag} from "./Tag";
import {Router} from "@angular/router";
import {removeElementFromArray} from "../utils/RemoveElementFromArray";
import {query} from "@angular/animations";

export class SearchFilter {
  private readonly DEFAULT_PAGE_SIZE: number = 8;

  private _query: string = "";
  private _tags: Tag[] = [];
  private _page: number = 0;
  private _pageSize: number = this.DEFAULT_PAGE_SIZE;

  /**
   * Resets all search parameters of this filter back to their default values (such as empty);
   */
  clear() {
    this.query = "";
    this.tags = [];
    this.pageSize = this.DEFAULT_PAGE_SIZE;
  }

  /**
   * Method users to map the underscore field names to regular field names
   * to make them compatible with the Java backend.
   */
  getSearchFilterDTO() {
    return {
      query: this._query,
      tags: this._tags,
      pageNumber: this._page,
      pageSize: this._pageSize
    };
  }

  /**
   * Adds the given tags to the search query.
   * @param tags The tags to search for.
   */
  addTags(tags: Tag[]): void {
    this.tags = [...this.tags, ...tags];
  }

  /**
   * Adds a tag to the search query.
   * @param tag The tag to search for.
   */
  addTag(tag: Tag): void {
    this.addTags([tag]);
  }

  /**
   * Removes a tag from the search query.
   * @param tag The tag to remove.
   */
  removeTag(tag: Tag) : void {
    this.tags = removeElementFromArray(tag, this.tags);
  }

  get page(): number {
    return this._page;
  }

  set page(value: number) {
    this._page = value;
  }

  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(value: number) {
    this._pageSize = value;
  }

  get query(): string | null {
    return this._query;
  }

  set query(query: string | null) {
    // Set empty string to null
    this._query = query || "";
  }

  get tags(): Tag[] {
    return this._tags;
  }

  set tags(value: Tag[]) {
    this._tags = value;
  }
}
