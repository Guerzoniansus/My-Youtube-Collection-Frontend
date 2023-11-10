import {Tag} from "./Tag";

export interface Video {
  videoID?: number;
  videoCode?: string;
  email?: string;
  title?: string;
  channel?: string;
  alternativeTitle?: string;
  dateCreated?: Date;
  tags?: Tag[];
}
