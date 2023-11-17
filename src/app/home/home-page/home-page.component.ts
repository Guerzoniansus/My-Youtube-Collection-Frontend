import { Component } from '@angular/core';
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {VideoService} from "../../service/video.service";
import {Video} from "../../model/Video";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {

  public editingVideo: boolean = false;
  public videos: Video[] = [];
  public error: String = "";

  constructor(private userService: UserService, private router: Router, private videoService: VideoService) {}

  ngOnInit() {
    if (this.userService.isLoggedIn() == false) {
      this.router.navigate(["/login"]);
    }

    this.videoService.getVideos().subscribe({
      next: videos => this.videos = videos,
      // TODO: Error doesn't work
      error: () => this.error = "An error occured, videos could not be retrieved."
    })
  }

  public addVideo() {
    this.editingVideo = !this.editingVideo;
  }

  onSavedVideoEvent() {
    this.editingVideo = false;
    this.videoService.refreshVideos();
  }

  protected readonly undefined = undefined;
}
