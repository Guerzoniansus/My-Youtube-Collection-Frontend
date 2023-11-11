import {Component, ElementRef, ViewChild} from '@angular/core';
import {TagService} from "../../service/tag.service";
import {Video} from "../../model/Video";
import {Tag} from "../../model/Tag";
import {Observable, of} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {FormControl} from "@angular/forms";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {YoutubeService} from "../../service/youtube.service";

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent {

  public videoUrl: string = "";
  public validUrl: boolean = false;

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
    dateCreated: new Date(),
    tags: []
  }

  public userTags: Tag[] = [];
  public filteredTags!: Observable<Tag[]>;
  public newTags: Tag[] = [];

  constructor(private tagService: TagService, private yt: YoutubeService) {
    this.tagCtrl.valueChanges.subscribe(search => {
      this.filteredTags = of(this.userTags.filter(tag =>
        tag.text.toLowerCase().includes(search)
        && !this.video.tags!.map(x => x.text).includes(tag.text) // Make sure user can't click same tag multiple times
      ));
    });
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(tags => this.userTags = tags);
  }

  addTag(event: MatChipInputEvent): void {
    const value = event.value.trim();

    if (value && !this.video.tags!.map(tag => tag.text.toLowerCase()).includes(value)) {
      const newTag: Tag = {
        tagID: undefined,
        text: this.sanitizeTagText(value.trim())
      };

      this.video.tags!.push(newTag);
      this.newTags.push(newTag);
      event.chipInput!.clear();
      this.tagCtrl.setValue(null);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.video.tags!.push({
      tagID: undefined,
      text: this.sanitizeTagText(event.option.viewValue)
    });
    this.tagInput.nativeElement.value = "";
    this.tagCtrl.setValue(null);
  }

  removeTag(tag: Tag): void {
    const index = this.video.tags!.indexOf(tag);

    if (index >= 0) {
      this.video.tags!.splice(index, 1);
    }
  }

  sanitizeTagText(text: string): string {
    return text[0].toUpperCase() + text.slice(1).toLowerCase();
  }

  processYoutubeUrl() {
    // TODO: display errors
    const code = this.yt.extractCodeFromUrl(this.videoUrl);

    if (code != undefined) {
      this.yt.getVideoInfo(code).subscribe(data => {
        this.video.title = data.items[0].snippet.title;
        this.video.channel = data.items[0].snippet.channelTitle;
        this.video.videoCode = code;
        this.videoEmbed.nativeElement.innerHTML = (`<iframe width="368" height="207" src="https://www.youtube.com/embed/${this.video.videoCode}"
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
        </iframe>`)
        this.validUrl = true;
      })
    }
  }

  save() {
    console.log(this.video);
  }
}
