import {Component, OnInit} from '@angular/core';
import {VideoService} from "../../../service/video.service";
import {SearchService} from "../../../service/search.service";
import {SearchFilter} from "../../../model/SearchFilter";
import {Tag} from "../../../model/Tag";

@Component({
  selector: 'app-search-info',
  templateUrl: './search-info.component.html',
  styleUrls: ['./search-info.component.css']
})
export class SearchInfoComponent implements OnInit {
  public numberOfVideos: number = 0;
  public filter!: SearchFilter;

  constructor(private videoService: VideoService, private searchService: SearchService) {}

  ngOnInit() {
    this.videoService.getTotalNumberOfVideos().subscribe(n => this.numberOfVideos = n);
    this.searchService.getSearchFilter().subscribe(filter => this.filter = filter);
  }

  /**
   * Event that gets fired when a search tag gets removed by the user.
   * @param tag The tag to remove.
   */
  public removeTag(tag: Tag): void {
    this.searchService.removeSearchTag(tag);
  }

  /**
   * Event that gets fired when the user clicks on the clear button.
   */
  public clearSearch() {
    this.searchService.clear();
  }
}
