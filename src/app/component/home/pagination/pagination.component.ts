import {Component, OnInit} from '@angular/core';
import {PageEvent} from "@angular/material/paginator";
import {UserService} from "../../../service/user.service";
import {Router} from "@angular/router";
import {VideoService} from "../../../service/video.service";
import {SearchService} from "../../../service/search.service";
import {SearchFilter} from "../../../model/SearchFilter";

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {

  public numberOfVideos: number = 0;
  public filter!: SearchFilter;

  constructor(private videoService: VideoService, private searchService: SearchService) {}

  ngOnInit() {
    this.videoService.getTotalNumberOfVideos().subscribe(n => this.numberOfVideos = n);
    this.searchService.getSearchFilter().subscribe(filter => this.filter = filter);
  }

  /**
   * Event that gets fired when the paginator gets used.
   * @param event The page event.
   */
  public handlePageEvent(event: PageEvent) {
    if (event.pageSize != this.filter.pageSize) {
      this.searchService.setPageSize(event.pageSize);
    }

    else if (event.pageIndex != this.filter.page) {
      this.searchService.setPage(event.pageIndex);
    }
  }

}
