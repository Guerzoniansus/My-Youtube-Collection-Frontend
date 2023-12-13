import {Video} from "./Video";

export interface VideoResponse {
  videos?: Video[];
  totalVideos: number;
}
