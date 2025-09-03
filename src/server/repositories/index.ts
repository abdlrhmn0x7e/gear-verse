import { _categoriesRepository } from "./categories";
import { _mediaRepository } from "./media";

export const DB = {
  categories: _categoriesRepository,
  media: _mediaRepository,
};
