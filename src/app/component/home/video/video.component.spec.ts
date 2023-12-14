import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoComponent } from './video.component';
import {DomSanitizer} from "@angular/platform-browser";
import {Tag} from "../../../model/Tag";

describe('VideoComponent', () => {
  let component: VideoComponent;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    sanitizer = jasmine.createSpyObj("DomSanitizer", ["bypassSecurityTrustResourceUrl"])
    sanitizer.bypassSecurityTrustResourceUrl.and.returnValue("url");
    component = new VideoComponent(sanitizer);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should get all tags as text", () => {
    const tags: Tag[] = [{tagID: 1, text: "Tag2"}, {tagID: 2, text: "Tag2"}];
    const text: string[] = tags.map(tag => tag.text);
    component.video = {tags: tags};

    expect(component.getAllTagsText()).toEqual(text);
  })

  it("should check if a tag is a search tag", () => {
    const tags: Tag[] = [{tagID: 1, text: "Tag2"}, {tagID: 2, text: "Tag2"}];
    const searchTags: Tag[] = [{tagID: 2, text: "Tag2"}];

    component.video = {tags: tags};
    component.searchTags = searchTags;

    expect(component.isSearchTag(tags[1].text)).toBeTruthy();
  });
});
