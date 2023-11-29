import { Component } from '@angular/core';
import {SearchService} from "../../service/search.service";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  public input: string = "";

  constructor(private searchService: SearchService) {}

  /**
   * Fired when the user presses enter on the search bar
   */
  pressedEnter() {
    this.searchService.updateSearchQuery(this.input);
  }
}
