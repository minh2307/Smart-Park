export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface KBArticle {
  id: number;
  title: string;
  content: string;
  category: 'TICKETING' | 'RIDES' | 'RULES_REGULATIONS' | 'MEMBERSHIPS' | 'PARKING' | 'SAFETY' | 'REFUNDS' | 'GENERAL';
  tags: string[];
  status: ArticleStatus;
  version: number;
  viewCount: number;
  helpfulCount: number;
  attachments?: string[];
  relatedArticleIds?: number[];
  updatedAt: string;
  updatedBy: string;
}

export interface KBArticleFilters {
  search?: string;
  category?: string;
  tag?: string;
  status?: ArticleStatus | '';
  page?: number;
  size?: number;
}
