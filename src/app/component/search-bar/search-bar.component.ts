import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SearchService} from "../../service/search.service";
import {Tag} from "../../model/Tag";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {Observable, of} from "rxjs";
import {TagService} from "../../service/tag.service";
import {VideoService} from "../../service/video.service";
import {YoutubeService} from "../../service/youtube.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  /** Keys that can be used to submit tne input */
  public separatorKeysCodes: number[] = [ENTER];

  /** Input field */
  public tagInput = new FormControl();
  @ViewChild('tagInputElement') tagInputElement!: ElementRef<HTMLInputElement>;

  /** Autocomplete results. */
  public autocompleteTags!: Observable<Tag[]>;

  /** All tags in user account. */
  public userTags: Tag[] = [];

  /** The selected tags shown in frontend. */
  public selectedTags: Tag[] = [];

  constructor(private searchService: SearchService, private tagService: TagService) {
    this.tagInput.valueChanges.subscribe(input => {
      // Create the list of tags that show up in autocomplete
      const filteredTags: Tag[] = this.userTags.filter(tag =>
        tag.text.toLowerCase().includes(input.toLowerCase()))
        .filter(tag => !this.isTagAlreadySelected(tag.text)); // Without this, user can select the same tag again

      this.autocompleteTags = of(filteredTags);
    });
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(tags => this.userTags = tags);
    this.searchService.getSearchFilter().subscribe(filter => this.selectedTags = filter.tags);
  }

  /**
   * Checks if a tag has already been selected.
   * @param tagText The text of the tag.
   */
  public isTagAlreadySelected(tagText: string): boolean {
    return this.selectedTags.map(tag => tag.text.toLowerCase()).includes(tagText.toLowerCase());
  }

  /**
   * Event that gets fired when a tag gets clicked in autocomplete.
   * Notifies the search service to add the selected tag to the search results.
   * @param tag The tag that was selected.
   */
  public selectedTag(tag: Tag): void {
    this.searchService.addSearchTag(tag);
    this.tagInputElement.nativeElement.value = "";
    this.tagInput.setValue(null);
    this.autocompleteTags = of([]); // Without this, user can select the same tag again
  }

  /**
   * Fired when the user presses enter on the search bar.
   */
  public pressedEnter(input: string) {
    this.searchService.setSearchQuery(input);
  }
}
