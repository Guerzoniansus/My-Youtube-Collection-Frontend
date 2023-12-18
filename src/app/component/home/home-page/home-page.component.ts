import {Component, HostListener, OnInit} from '@angular/core';
import {UserService} from "../../../service/user.service";
import {Router} from "@angular/router";
import {VideoService} from "../../../service/video.service";
import {Video} from "../../../model/Video";
import {SearchService} from "../../../service/search.service";
import {SearchFilter} from "../../../model/SearchFilter";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public isCreatingVideo: boolean = false;
  public videos: Video[] = [];
  public error: string = "";
  public filter!: SearchFilter;

  public videoBeingEdited: Video | undefined;

  constructor(private userService: UserService, private router: Router,
              private searchService: SearchService, private videoService: VideoService, private snackbar: MatSnackBar) {}

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
    this.isCreatingVideo = true;
  }

  /**
   * Event that gets fired when the user closes the video editor window.
   * @param message The event message.
   */
  public onFinishedEditingVideoEvent(message: string) {
    this.isCreatingVideo = false;
    this.videoBeingEdited = undefined;

    if (message.includes("Saved") || message.includes("Deleted") || message.includes("Updated")) {
      this.snackbar.open(message, undefined, {duration: 3000})
      this.videoService.refreshVideos();
    }
  }

  /**
   * Event that gets fired when the user clicks on a video to edit it.
   * @param video The video that was clicked on.
   */
  public editVideoClickEvent(video: Video) {
    this.videoBeingEdited = video;
  }

  /**
   * Event that gets fired when the user presses keys.
   * @param event The key press event.
   */
  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if((event.ctrlKey || event.metaKey) && event.keyCode == 86) {
      this.isCreatingVideo = true; // Control + V was pressed
    }
  }

  /**
   * Function to close the video editor.
   */
  public closeEditor() {
    this.isCreatingVideo = false;
    this.videoBeingEdited = undefined;
  }
}
