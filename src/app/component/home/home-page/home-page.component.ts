import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../service/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {VideoService} from "../../../service/video.service";
import {Video} from "../../../model/Video";
import {SearchService} from "../../../service/search.service";
import {Tag} from "../../../model/Tag";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public editingVideo: boolean = false;
  public videos: Video[] = [];
  public error: string = "";

  public searchTags: Tag[] = [];

  constructor(private userService: UserService, private router: Router, private videoService: VideoService,
              private searchService: SearchService) {}

  ngOnInit() {
    if (this.userService.isLoggedIn() == false) {
      this.router.navigate(["/login"]);
    }

    this.videoService.getVideos().subscribe({
      next: videos => this.videos = videos,
      // TODO: Error doesn't work
      error: () => this.error = "An error occured, videos could not be retrieved."
    })

    this.searchService.getSearchTags().subscribe(searchTags => this.searchTags = searchTags);
  }

  /** Event that gets fired when the user clicks on the add video button. */
  addVideo() {
    this.editingVideo = !this.editingVideo;
  }

  /**
   * Event that gets fired when the user closes the video editor window.
   * @param message The event message.
   */
  onFinishedEditingVideoEvent(message: string) {
    this.editingVideo = false;

    if (message == "Saved video") {
      this.videoService.refreshVideos();
    }
  }

  removeTag(tag: Tag): void {
    this.searchService.removeSearchTag(tag);
  }

  protected readonly environment = environment;
}
