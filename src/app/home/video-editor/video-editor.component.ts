import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {TagService} from "../../service/tag.service";
import {Video} from "../../model/Video";
import {Tag} from "../../model/Tag";
import {Observable, of} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {FormControl} from "@angular/forms";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {YoutubeService} from "../../service/youtube.service";
import {VideoService} from "../../service/video.service";

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

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public tagCtrl = new FormControl();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoEmbed') videoEmbed!: ElementRef;

  public video: Video = {
    videoID: undefined,
    videoCode: "b-9sQsGEhEw",
    title: "",
    channel: "",
    alternativeTitle: "",
    tags: []
  }

  /** All tags in user account, for autocomplete. */
  public userTags: Tag[] = [];

  /** For autocomplete.*/
  public filteredTags!: Observable<Tag[]>;

  /** Tags that don't exist in database / userTags yet. */
  public newTags: Tag[] = [];

  /** The selected tags shown in frontend. */
  public selectedTags: Tag[] = [];

  constructor(private tagService: TagService, private videoService: VideoService, private yt: YoutubeService) {
    this.tagCtrl.valueChanges.subscribe(search => {
      this.filteredTags = of(this.userTags.filter(tag =>
        tag.text.toLowerCase().includes(search)
        && !this.selectedTags!.map(x => x.text).includes(tag.text) // Make sure user can't click same tag multiple times
      ));
    });
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(tags => this.userTags = tags);
  }

  /**
   * Event that gets fired when a tag gets typed and enter gets pressed
   * @param event
   */
  addTag(event: MatChipInputEvent): void {
    const value = event.value.trim();

    if (value && !this.selectedTags!.map(tag => tag.text.toLowerCase()).includes(value)) {
      const newTag: Tag = {
        tagID: undefined,
        text: this.sanitizeTagText(value.trim())
      };

      this.selectedTags!.push(newTag);
      this.newTags.push(newTag);
      event.chipInput!.clear();
      this.tagCtrl.setValue(null);
    }
  }

  /**
   * Event that gets fired when a tag gets clicked in autocomplete
   * @param tag
   */
  selectedTag(tag: Tag): void {
    this.selectedTags!.push(tag);
    this.tagInput.nativeElement.value = "";
    this.tagCtrl.setValue(null);
  }

  removeTag(tag: Tag): void {
    const index = this.selectedTags!.indexOf(tag);

    if (index >= 0) {
      this.selectedTags!.splice(index, 1);
    }

    const indexNewTags = this.newTags.indexOf(tag);

    if (indexNewTags >= 0) {
      this.newTags.splice(index, 1);
    }
  }

  sanitizeTagText(text: string): string {
    return text[0].toUpperCase() + text.slice(1).toLowerCase();
  }

  processYoutubeUrl() {
    const code = this.yt.extractCodeFromUrl(this.videoUrl);

    if (code != undefined) {
      this.yt.getVideoInfo(code).subscribe({
        error: () => this.setError("Could not process this URL."),
        next: (data) => {
          this.video.title = data.items[0].snippet.title;
          this.video.channel = data.items[0].snippet.channelTitle;
          this.video.videoCode = code;
          this.videoEmbed.nativeElement.innerHTML = (`<iframe width="368" height="207" src="https://www.youtube.com/embed/${this.video.videoCode}"
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
        </iframe>`)
          this.validUrl = true;
          this.setError("");
        }
      })
    }

    else this.setError("Could not parse this URL.")
  }

  saveAll() {
    this.isSaving = true;

    // We save the tags first, then if any tags were new, save and retrieve them from the backend
    // and add them to the video, but now with IDs in them
    this.saveTags(
      () => {
        this.saveVideo(
          () => {
            this.finishEditing();
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

  private saveTags(success: Function, error: Function) {
    if (this.newTags.length == 0) {
      this.video.tags = this.selectedTags;
      success();
    }

    // Save new tags to database and add them to video so we don't send tags without IDs
    else {
      this.tagService.saveTags(this.newTags).subscribe({
        next: (tagsSavedToDatabase) => {
          const videoTags: Tag[] = [
            ...this.selectedTags.filter(tag => tag.tagID),
            ...tagsSavedToDatabase
          ];
          this.video.tags = videoTags;
          success();
        },

        error: (error) => {
          error();
        }
      });
    }
  }

  private saveVideo(success: Function, error: Function) {
    this.isSaving = true;

    this.videoService.createVideo(this.video).subscribe(
      {
        complete: () => success(),
        error: (error) => {
          this.setError("There was an error saving the video, please try again later.")
          this.isSaving = false;
        }
      }
    );
  }

  finishEditing(): void {
    this.savedVideoEvent.emit("Saved video");
  }

  private setError(error: string): void {
    this.error = error;
  }
}
