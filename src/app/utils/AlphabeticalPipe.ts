import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "alphabetical"
})
/**
 * Class used for sorting things alphabetically.
 */
export class AlphabeticalPipe implements PipeTransform {
  public transform(value: string[], ascending = true): string[] {
    return [...value].sort((a, b) => {
      a = a.toLowerCase();
      b = b.toLowerCase();
      return ascending ? a.localeCompare(b) : b.localeCompare(a);
    });
  }
}
