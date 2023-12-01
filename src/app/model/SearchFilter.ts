import {Tag} from "./Tag";
import {Router} from "@angular/router";

export class SearchFilter {
  private _query: string = "";
  private _tags: Tag[] = [];

  public clear() {
    this.query = "";
    this.tags = [];
  }

  /**
   * Converts tags to a comma separated list of tag IDs like "5,6,7".
   * Returns null if there are no tags to convert.
   */
  public convertTagsToStringOfTagIDs(): string | null {
    return this.tags.length == 0 ? null : this.tags.map(tag => tag.tagID).join(',');
  }

  /**
   * Creates an URL of the home page that contains the current search options as parameters for easy bookmarking.
   * @param router A Router object that is needed to create the url.
   */
  public createUrlFrontend(router: Router): string {
    const tagIDs = this.convertTagsToStringOfTagIDs();
    const query = this.query ? this.query : null;
    return router.createUrlTree(["/home"], { queryParams: { q: query, tagIDs: tagIDs}}).toString();
  }

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  get tags(): Tag[] {
    return this._tags;
  }

  set tags(value: Tag[]) {
    this._tags = value;
  }
}
