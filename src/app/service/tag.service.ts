import { Injectable } from '@angular/core';
import {Tag} from "../model/Tag";
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../model/User";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  private tagsSubject: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  private tags: Observable<Tag[]> = this.tagsSubject.asObservable();

  constructor() {
    this.tagsSubject.next( [
      {tagID: undefined, email: undefined, text: "Rock"},
      {tagID: undefined, email: undefined, text: "Pop"},
      {tagID: undefined, email: undefined, text: "Dubstep"}
    ]);
  }

  public getTags(): Observable<Tag[]> {
    return this.tags;
  }
}
