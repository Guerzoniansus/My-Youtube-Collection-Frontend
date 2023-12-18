import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
import {MatDialog} from "@angular/material/dialog";
import {ConfirmationWindowComponent} from "../../confirmation-window/confirmation-window.component";
import {tick} from "@angular/core/testing";

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements OnInit {

  @Input() public isEditingExistingVideo: boolean = false;

  @Output() finishedEditingEvent = new EventEmitter<string>();

  public videoUrl: string = "";
  public validUrl: boolean = false;
  public error: string = "";
  public isLoading: boolean = false;

  @ViewChild('tagInputTooltip') tagInputTooltip!: MatTooltip;
  public tagInputTooltipText: string = "";

  /** The key used for detecting when a tag has been entered */
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  /** Input field */
  public tagInputElement = new FormControl();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoEmbed') videoEmbed!: ElementRef;

  @Input() public video: Video = {
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

  constructor(private tagService: TagService, private videoService: VideoService, private yt: YoutubeService, public dialog: MatDialog) {
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

    if (this.isEditingExistingVideo) {
      this.selectedTags = this.video.tags!;
      // Without a delay there will be a weird bug where the HTML will be completely broken
      setTimeout(() => this.embedYoutubeVideo(this.video), 100);
    }

    // Read URL from clipboard
    else {
      navigator.clipboard.readText().then(text => {
        if (this.yt.extractCodeFromUrl(text) != undefined) {
          this.videoUrl = text;
          this.processYoutubeUrl();
        }
      });
    }
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
          this.embedYoutubeVideo(this.video);
          this.validUrl = true;
          this.setError("");
        }
      })
    }

    else this.setError("Could not find a Youtube video with this link.")
  }

  public saveAll() {
    this.isLoading = true;

    // We save the tags first, then if any tags were new, save and retrieve them from the backend
    // and add them to the video, but now with IDs in them
    this.saveTags(
      () => {
        this.saveVideo(
          () => {
            this.finishEditing("Saved video");
            this.isLoading = false;
          },
          () => {
            this.setError("There was an error saving the video, please try again later.")
            this.isLoading = false;
          }
        )
      },
      () => {
        this.setError("There was an error saving the tags, please try again later.");
        this.isLoading = false;
      }
    );
  }

  /**
   * Saves the tags of the video.
   * @param success The function to execute when the request to the backend is successful.
   * @param errorFn The function to execute when the request to the backend has an error.
   * @private
   */
  private saveTags(success: Function, errorFn: Function) {
    if (this.newTags.length == 0) {
      this.video.tags = this.selectedTags;
      success();
    }

    // Save new tags to database and add them to video, so we don't send tags without IDs
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

  /**
   * Saves a new video or updates an existing video.
   * @param success The function to execute when the request to the backend is successful.
   * @param errorFn The function to execute when the request to the backend has an error.
   * @private
   */
  private saveVideo(success: Function, errorFn: Function) {
    const request = this.isEditingExistingVideo
      ? this.videoService.updateVideo(this.video)
      : this.videoService.createVideo(this.video);

    request.subscribe(
      {
        complete: () => success(),
        error: (error) => {
          errorFn();
        }
      }
    );
  }

  /**
   * Fires off an event to the parent that this window is ready to close.
   * @param message The event that caused editing to finish. Can be "Deleted video", "Exited editor", "Saved video" or "Edited video".
   */
  public finishEditing(message: string): void {
    this.finishedEditingEvent.emit(message);
  }

  /**
   * Sets the error message in the HTML.
   * @param error The error to show.
   * @private
   */
  private setError(error: string): void {
    this.error = error;
  }

  /**
   * Deletes a video.
   * @param video The video to delete.
   */
  public deleteVideo(video: Video): void {
    this.isLoading = true;

    this.videoService.deleteVideo(video).subscribe(
      {
        next: () => {
          this.finishEditing("Deleted video");
          this.isLoading = false;
        },
        error: () => {
          this.setError("Could not delete the video");
          this.isLoading = false;
        }
      }
    )
  }

  /**
   * Embeds the youtube video into the #videoEmbed element.
   * @param video The video to embed.
   * @private
   */
  private embedYoutubeVideo(video: Video): void {
    this.videoEmbed.nativeElement.innerHTML = (`<iframe width="368" height="207" src="https://www.youtube.com/embed/${video.videoCode!}"
              title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
        </iframe>`);
  }

  /**
   * Opens the confirmation dialogue.
   * @param confirmFunction The function to execute when the user presses confirm.
   * @private
   */
  public openConfirmationDialog(confirmFunction: Function = () => {this.deleteVideo(this.video)}): void {
    const dialogRef = this.dialog.open(ConfirmationWindowComponent, {
      data: {
        text: 'Are you sure you want to delete this video?',
        confirmationText: 'Delete',
        confirmationIcon: 'delete',
        confirmationColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        confirmFunction();
      }
    });
  }
}
