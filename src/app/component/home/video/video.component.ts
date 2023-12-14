import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Video} from "../../../model/Video";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Tag} from "../../../model/Tag";

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  @Input() video?: Video;

  /** A list of tags that the user is currently searching for. */
  @Input() searchTags?: Tag[]

  public videoUrl: SafeResourceUrl = "";

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    // Dom sanitizer is needed or embeds will fail. I don't know why.
    const videoUrl = `https://www.youtube.com/embed/${this.video?.videoCode}`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  /**
   * Returns a list with each text of all tags.
   */
  public getAllTagsText(): string[] {
    return this.video!.tags!.map(tag => tag.text);
  }

  /**
   * Checks if a tag is part of the tags currently being searched for,
   * @param tagText The tag to check if it is being searched for.
   */
  public isSearchTag(tagText: string): boolean {
    return this.searchTags!.map(tag => tag.text).indexOf(tagText) != -1;
  }
}
