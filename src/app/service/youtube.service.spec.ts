import { TestBed } from '@angular/core/testing';

import { YoutubeService } from './youtube.service';
import {HttpClient} from "@angular/common/http";
import {of} from "rxjs";

describe('YoutubeService', () => {
  let service: YoutubeService;
  let http: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    http = jasmine.createSpyObj("HttpClient", ["get"]);
    service = new YoutubeService(http);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve video info from the Youtube API', () => {
    const result = of("hoi");
    http.get.and.returnValue(result);

    expect(service.getVideoInfo("code")).toEqual(result);
  });

  it('should extract video code from a Youtube URL', () => {
    const validUrl = 'https://www.youtube.com/watch?v=X6-9XvQWDHI';
    const invalidUrl = 'https://www.example.com';

    const extractedCode = service.extractCodeFromUrl(validUrl);
    const invalidExtractedCode = service.extractCodeFromUrl(invalidUrl);

    expect(extractedCode).toEqual('X6-9XvQWDHI');
    expect(invalidExtractedCode).toBeUndefined();
  });
});
