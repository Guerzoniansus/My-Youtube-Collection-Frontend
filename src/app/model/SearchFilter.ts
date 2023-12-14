import {Tag} from "./Tag";
import {Router} from "@angular/router";
import {removeElementFromArray} from "../utils/RemoveElementFromArray";
import {query} from "@angular/animations";

export interface SearchFilter {
  readonly query: string | null;
  readonly tags: Tag[];
  readonly page: number;
  readonly pageSize: number;
}
