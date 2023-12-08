import { TagService } from './tag.service';
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, of} from "rxjs";
import {Tag} from "../model/Tag";
import {environment} from "../../environments/environment";

const headers = new HttpHeaders({'Content-Type': 'application/json', 'Authorization': "Bearer jwt"});

fdescribe('TagService', () => {
  let service: TagService;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let httpClientMock: jasmine.SpyObj<HttpClient>;
  let tagsFromBackend: BehaviorSubject<Tag[]>;

  beforeEach(() => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getAuthorizationHeader']);
    userServiceMock.getAuthorizationHeader.and.returnValue(headers);

    tagsFromBackend = new BehaviorSubject<Tag[]>([]);
    httpClientMock = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    httpClientMock.get.and.returnValue(tagsFromBackend);

    service = new TagService(userServiceMock, httpClientMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("should set the tags", (done) => {
    const expected: Tag = {tagID: 1, text: "test"}
    tagsFromBackend.next([expected]);

    service.getTags().subscribe(tags => {
      expect(tags.length).toEqual(1);
      expect(tags[0].tagID).toEqual(expected.tagID);
      expect(tags[0].text).toEqual(expected.text);
      done();
    })
  });

  it("should save the tags", (done) => {
    const tags: Tag[] = [{tagID: 1, text: "test1"}, {tagID: 2, text: "test2"}]
    httpClientMock.post.and.returnValue(of(tags));
    service.saveTags(tags);

    expect(httpClientMock.post).toHaveBeenCalledWith(environment.backendUrl + "/tags", tags, {headers: headers});

    service.getTags().subscribe(tags => {
      expect(tags).toEqual(tags);
      done();
    })
  })

});
