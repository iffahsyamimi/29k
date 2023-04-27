/* eslint-disable */
/* tslint:disable */

export interface CollectionImage {
  description?: string;
  source?: string;
}

export interface Collection {
  id: any;
  name: string;
  description?: string;
  image?: CollectionImage;
  tags?: any[];
  published: boolean;
  hidden?: boolean;
  exercises: any[];
}
