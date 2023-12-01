import {Tag} from "./Tag";
import {Router} from "@angular/router";
import {removeElementFromArray} from "../utils/RemoveElementFromArray";

export class SearchFilter {
  private _query: string | null = "";
  private _tags: Tag[] = [];

  /**
   * Resets  all search parameters of this filter back to their default values (such as empty or null).
   */
  clear() {
    this.query = "";
    this.tags = [];
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

  get query(): string | null {
    return this._query;
  }

  set query(query: string | null) {
    // Set empty string to null
    query ? this._query = query : this._query = null;
  }

  get tags(): Tag[] {
    return this._tags;
  }

  set tags(value: Tag[]) {
    this._tags = value;
  }
}
