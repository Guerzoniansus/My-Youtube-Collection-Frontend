import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../service/user.service";
import {Router} from "@angular/router";
import {VideoService} from "../../../service/video.service";
import {Video} from "../../../model/Video";
import {SearchService} from "../../../service/search.service";
import {Tag} from "../../../model/Tag";
import {SearchFilter} from "../../../model/SearchFilter";
import {PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public editingVideo: boolean = false;
  public videos: Video[] = [];
  public error: string = "";
  public filter!: SearchFilter;

  constructor(private userService: UserService, private router: Router,
              private searchService: SearchService, private videoService: VideoService) {}

  ngOnInit() {
    if (this.userService.isLoggedIn() == false) {
      this.router.navigate(["/login"]);
      return;
    }

    this.videoService.getVideos().subscribe({
      next: videos => this.videos = videos,
      error: () => this.error = "An error occured, videos could not be retrieved."
    })

    this.searchService.getSearchFilter().subscribe(filter => this.filter = filter);
  }

  /** Event that gets fired when the user clicks on the add video button. */
  public addVideo() {
    this.editingVideo = true;
  }

  /**
   * Event that gets fired when the user closes the video editor window.
   * @param message The event message.
   */
  public onFinishedEditingVideoEvent(message: string) {
    this.editingVideo = false;

    if (message == "Saved video" && this.searchService.isSearching() == false) {
      this.videoService.refreshVideos();
    }
  }
}
