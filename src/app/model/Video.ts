import {Tag} from "./Tag";

export interface Video {
  videoID?: number;
  email?: string;
  title?: string;
  alternativeTitle?: string;
  channel?: string;
  dateCreated?: Date;
  tags?: Tag[];
}
