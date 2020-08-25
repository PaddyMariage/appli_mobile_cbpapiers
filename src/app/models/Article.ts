import { ArticlePicture } from './ArticlePicture';
import { ArticleDetails } from './ArticleDetails';

export class Article {

  reference: string;
  label?: string;
  unitPrice?: number;
  articleImage?: ArticlePicture;
  articleDetails?: ArticleDetails;
  AC_PrixVen?: number;
  AC_Remise?: number;
}
