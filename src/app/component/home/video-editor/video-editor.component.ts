import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {TagService} from "../../../service/tag.service";
import {Video} from "../../../model/Video";
import {Tag} from "../../../model/Tag";
import {Observable, of} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {FormControl} from "@angular/forms";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {YoutubeService} from "../../../service/youtube.service";
import {VideoService} from "../../../service/video.service";
import {MatTooltip} from "@angular/material/tooltip";
import {removeElementFromArray} from "../../../utils/RemoveElementFromArray";

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit {

  @Output() savedVideoEvent = new EventEmitter<string>();

  public videoUrl: string = "";
  public validUrl: boolean = false;
  public error: string = "";
  public isSaving: boolean = false;

  @ViewChild('tagInputTooltip') tagInputTooltip!: MatTooltip;
  public tagInputTooltipText: string = "";

  /** The key used for detecting when a tag has been entered */
  public separatorKeysCodes: number[] = [ENTER];

  /** Input field */
  public tagInputElement = new FormControl();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoEmbed') videoEmbed!: ElementRef;

  public video: Video = {
    videoID: undefined,
    videoCode: "",
    title: "",
    channel: "",
    alternativeTitle: "",
    tags: []
  }

  /** All tags in user account. */
  public userTags: Tag[] = [];

  /** Autocomplete results. */
  public autocompleteTags!: Observable<Tag[]>;

  /** Tags that don't exist in database / userTags yet. */
  public newTags: Tag[] = [];

  /** The selected tags shown in frontend. */
  public selectedTags: Tag[] = [];

  constructor(private tagService: TagService, private videoService: VideoService, private yt: YoutubeService) {
    this.tagInputElement.valueChanges.subscribe(input => {
      const filteredTags: Tag[] = this.userTags.filter(tag =>
        tag.text.toLowerCase().includes(input.toLowerCase()))
        .filter(tag => !this.isTagAlreadySelected(tag.text)); // Without this, user can select the same tag again

      this.autocompleteTags = of(filteredTags);

      // If input exists, autosuggests gives no options, and the tag isnt already selected
      if (input && filteredTags.length == 0 && (!this.isTagAlreadySelected(input))) {
        this.tagInputTooltipText = `Creating new tag [${input}] in your account.`;
        this.tagInputTooltip.show();
      } else this.tagInputTooltipText = "";
    });
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(tags => this.userTags = tags);
  }

  /**
   * Event that gets fired when a tag gets typed and enter gets pressed.
   * @param event
   */
  public pressEnterOnTag(event: MatChipInputEvent): void {
    const tagText = event.value.trim();

    if (tagText && (!this.isTagAlreadySelected(tagText))) {
      const userTag = this.getUserTag(tagText);

      if (userTag != undefined) {
        this.selectedTag(userTag);
      }

      else {
        const newTag: Tag = {
          tagID: undefined,
          text: this.sanitizeTagText(tagText.trim())
        };

        this.selectedTags!.push(newTag);
        this.newTags.push(newTag);

        event.chipInput!.clear();
        this.tagInputElement.setValue(null);
      }
    }
  }

  /**
   * Event that gets fired when a tag gets clicked in autocomplete.
   * @param tag The tag that got selected.
   */
  public selectedTag(tag: Tag): void {
    this.selectedTags!.push(tag);
    this.tagInput.nativeElement.value = "";
    this.tagInputElement.setValue(null);
    this.autocompleteTags = of([]); // Without this, user can select the same tag again
  }

  /**
   * Event that gets fired when the user presses X next to a tag.
   * @param tag The tag that gets removed.
   */
  public removeTag(tag: Tag): void {
    this.selectedTags = removeElementFromArray(tag, this.selectedTags);
    this.newTags = removeElementFromArray(tag, this.newTags);
  }

  /**
   * Makes it so a tag text starts with an uppercase letter and the rest is lower case.
   * @param text
   */
  public sanitizeTagText(text: string): string {
    return text[0].toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Checks if a tag has already been selected. Compares lowercase versions of text.
   * @param tagText The text of the tag.
   */
  public isTagAlreadySelected(tagText: string): boolean {
    return this.selectedTags!.map(tag => tag.text.toLowerCase()).includes(tagText.toLowerCase());
  }

  /**
   * Gets a user tag. If the tag does not exist in user tags, this will return undefined.
   * @param tagText The text of the tag that you want to find.
   */
  public getUserTag(tagText: string): Tag | undefined {
    return this.userTags.find((tag) => tag.text.toLowerCase() == tagText.toLowerCase());
  }

  /**
   * Process the Youtube URL. If it's a valid URL, it will display the editor.
   */
  public processYoutubeUrl() {
    const code = this.yt.extractCodeFromUrl(this.videoUrl);

    if (code != undefined) {
      this.yt.getVideoInfo(code).subscribe({
        error: () => this.setError("Could not process this link."),
        next: (data) => {
          this.video.title = data.items[0].snippet.title;
          this.video.channel = data.items[0].snippet.channelTitle;
          this.video.videoCode = code;
          this.videoEmbed.nativeElement.innerHTML = (`<iframe width="368" height="207" src="https://www.youtube.com/embed/${this.video.videoCode}"
              title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
        </iframe>`)
          this.validUrl = true;
          this.setError("");
        }
      })
    }

    else this.setError("Could not find a Youtube video with this link.")
  }

  public saveAll() {
    this.isSaving = true;

    // We save the tags first, then if any tags were new, save and retrieve them from the backend
    // and add them to the video, but now with IDs in them
    this.saveTags(
      () => {
        this.saveVideo(
          () => {
            this.finishEditing("Saved video");
            this.isSaving = false;
          },
          () => {
            this.setError("There was an error saving the video, please try again later.")
            this.isSaving = false;
          }
        )
      },
      () => {
        this.setError("There was an error saving the tags, please try again later.");
        this.isSaving = false;
      }
    );
  }

  private saveTags(success: Function, errorFn: Function) {
    if (this.newTags.length == 0) {
      this.video.tags = this.selectedTags;
      success();
    }

    // Save new tags to database and add them to video so we don't send tags without IDs
    else {
      this.tagService.createAndSaveTags(this.newTags).subscribe({
        next: (tagsSavedToDatabase) => {
          const videoTags: Tag[] = [
            ...this.selectedTags.filter(tag => tag.tagID),
            ...tagsSavedToDatabase
          ];
          this.video.tags = videoTags;
          success();
        },

        error: (error) => {
          errorFn();
        }
      });
    }
  }

  private saveVideo(success: Function, errorFn: Function) {
    this.isSaving = true;

    this.videoService.createVideo(this.video).subscribe(
      {
        complete: () => success(),
        error: (error) => {
          errorFn();
        }
      }
    );
  }

  public finishEditing(message: string): void {
    this.savedVideoEvent.emit(message);
  }

  private setError(error: string): void {
    this.error = error;
  }
}
