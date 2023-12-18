import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoEditorComponent } from './video-editor.component';
import {TagService} from "../../../service/tag.service";
import {VideoService} from "../../../service/video.service";
import {YoutubeService} from "../../../service/youtube.service";
import {MatDialog} from "@angular/material/dialog";

describe('VideoEditorComponent', () => {
  let component: VideoEditorComponent;
  let tagService: jasmine.SpyObj<TagService>;
  let videoService: jasmine.SpyObj<VideoService>;
  let youtubeService: jasmine.SpyObj<YoutubeService>;
  let matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    tagService = jasmine.createSpyObj("TagService", ["getTags", "createAndSaveTags"]);
    videoService = jasmine.createSpyObj("VideoService", ["createVideo"]);
    youtubeService = jasmine.createSpyObj("YoutubeService", ["getCodeFromUrl", "getVideoInfo"])
    matDialog = jasmine.createSpyObj("MatDialog", ["open"]);
    component = new VideoEditorComponent(tagService, videoService, youtubeService, matDialog);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
