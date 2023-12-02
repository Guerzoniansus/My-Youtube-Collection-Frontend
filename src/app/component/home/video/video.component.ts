import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Video} from "../../../model/Video";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  @Input() video?: Video;

  public videoUrl: SafeResourceUrl = "";

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    const videoUrl = `https://www.youtube.com/embed/${this.video?.videoCode}`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  /**
   * Returns a list with each text of all tags.
   */
  getAllTagsText(): string[] {
    return this.video!.tags!.map(tag => tag.text);
  }
}
