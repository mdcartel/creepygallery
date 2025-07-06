import { executeQuery, executeQuerySingle } from './db';

export interface GalleryItem {
  id: number;
  title: string;
  image_url: string | null;
  date_uploaded: Date;
  downloads: number;
  author: string;
  tags: string[];
  chill_level: number;
  user_id: string;
}

export async function createGalleryItem(
  title: string,
  imageUrl: string | null,
  author: string,
  tags: string[],
  chillLevel: number,
  userId: string
): Promise<GalleryItem> {
  const result = await executeQuerySingle<GalleryItem>(
    `INSERT INTO gallery_items (title, image_url, author, tags, chill_level, user_id) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [title, imageUrl, author, tags, chillLevel, userId]
  );
  
  if (!result) {
    throw new Error('Failed to create gallery item');
  }
  
  return result;
}

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  return await executeQuery<GalleryItem>(
    'SELECT * FROM gallery_items ORDER BY date_uploaded DESC'
  );
}

export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  return await executeQuerySingle<GalleryItem>(
    'SELECT * FROM gallery_items WHERE id = $1',
    [id]
  );
}

export async function getGalleryItemsByUser(userId: string): Promise<GalleryItem[]> {
  return await executeQuery<GalleryItem>(
    'SELECT * FROM gallery_items WHERE user_id = $1 ORDER BY date_uploaded DESC',
    [userId]
  );
}

export async function updateGalleryItemDownloads(id: number): Promise<void> {
  await executeQuery(
    'UPDATE gallery_items SET downloads = downloads + 1 WHERE id = $1',
    [id]
  );
}

export async function deleteGalleryItem(id: number, userId: string): Promise<boolean> {
  const result = await executeQuery(
    'DELETE FROM gallery_items WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  
  return result.length > 0;
} 