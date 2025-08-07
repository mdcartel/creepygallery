import { sqlQuery } from './db';

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
  // First, ensure the user exists in the users table
  try {
    await sqlQuery`
      INSERT INTO users (id, email, username, password) 
      VALUES (${userId}, ${userId + '@creepygallery.com'}, ${author}, 'temp-password')
      ON CONFLICT (id) DO NOTHING
    `;
  } catch (userError) {
    console.log('User creation skipped (might already exist):', userError);
  }
  
  // Now insert the gallery item
  const result = await sqlQuery<GalleryItem>`
    INSERT INTO gallery_items (title, image_url, author, tags, chill_level, user_id) 
    VALUES (${title}, ${imageUrl}, ${author}, ${tags}, ${chillLevel}, ${userId}) 
    RETURNING *
  `;
  
  if (!result[0]) {
    throw new Error('Failed to create gallery item');
  }
  
  return result[0];
}

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  return await sqlQuery<GalleryItem>`
    SELECT * FROM gallery_items ORDER BY date_uploaded DESC
  `;
}

export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  const result = await sqlQuery<GalleryItem>`
    SELECT * FROM gallery_items WHERE id = ${id}
  `;
  
  return result[0] || null;
}

export async function getGalleryItemsByUser(userId: string): Promise<GalleryItem[]> {
  return await sqlQuery<GalleryItem>`
    SELECT * FROM gallery_items WHERE user_id = ${userId} ORDER BY date_uploaded DESC
  `;
}

export async function updateGalleryItemDownloads(id: number): Promise<void> {
  await sqlQuery`
    UPDATE gallery_items SET downloads = downloads + 1 WHERE id = ${id}
  `;
}

export async function deleteGalleryItem(id: number, userId: string): Promise<boolean> {
  const result = await sqlQuery`
    DELETE FROM gallery_items WHERE id = ${id} AND user_id = ${userId}
  `;
  
  return result.length > 0;
} 