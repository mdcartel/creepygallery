import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { getAllGalleryItems, createGalleryItem } from '../../lib/gallery';
import { verifyToken } from '../../lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await getAllGalleryItems();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gallery items' });
    }
    return;
  }

  if (req.method === 'POST') {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing form data' });
        return;
      }
      // Auth
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization required' });
        return;
      }
      const token = authHeader.substring(7);
      const user = verifyToken(token);
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      const title = fields.title as string;
      const tags = fields.tags as string;
      const chillLevel = parseInt(fields.chillLevel as string, 10);
      const file = files.file as formidable.File;
      if (!title || !tags || !chillLevel || !file) {
        res.status(400).json({ error: 'Title, tags, chill level, and image file are required' });
        return;
      }
      // Save file
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const fileExt = path.extname(file.originalFilename || '');
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.copyFileSync(file.filepath, filePath);
      const imageUrl = `/uploads/${fileName}`;
      // Create gallery item
      const item = await createGalleryItem(
        title,
        imageUrl,
        user.username,
        tags,
        chillLevel,
        user.id
      );
      res.status(201).json(item);
    });
    return;
  }
  res.status(405).json({ error: 'Method not allowed' });
}
