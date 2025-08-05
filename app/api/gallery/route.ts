// This file is being removed to resolve the /api/gallery conflict.
// The gallery API route is no longer needed.
// All functionality has been migrated or consolidated.
import { NextRequest, NextResponse } from 'next/server';
import { getAllGalleryItems, createGalleryItem } from '../../../lib/gallery';
import { verifyToken } from '../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const items = await getAllGalleryItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const form = formidable({ multiples: false });
    const buffer = await request.arrayBuffer();
    const formData = Buffer.from(buffer);
    const tempPath = path.join(process.cwd(), 'temp-upload');
    if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
    const fieldsAndFiles = await new Promise((resolve, reject) => {
      form.parse(
        // formidable expects a Node.js IncomingMessage, so we fake it
        Object.assign(request, {
          headers: request.headers,
          on: () => {},
          pause: () => {},
          resume: () => {},
          pipe: () => {},
          unpipe: () => {},
          destroy: () => {},
          setTimeout: () => {},
          socket: {},
          readable: true,
          readableHighWaterMark: 0,
          readableLength: 0,
          _read: () => {},
        }),
        (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        }
      );
    });
    const { fields, files } = fieldsAndFiles as any;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const title = fields.title?.[0] || '';
    const tags = fields.tags?.[0] || '';
    const chillLevel = parseInt(fields.chillLevel?.[0] || '1', 10);
    const file = files.file;

    if (!title || !tags || !chillLevel || !file) {
      return NextResponse.json(
        { error: 'Title, tags, chill level, and image file are required' },
        { status: 400 }
      );
    }

    // Save file to public/uploads
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

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllGalleryItems, createGalleryItem } from '../../../lib/gallery';
import { verifyToken } from '../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const items = await getAllGalleryItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const form = formidable({ multiples: false });
    const buffer = await request.arrayBuffer();
    const formData = Buffer.from(buffer);
    const tempPath = path.join(process.cwd(), 'temp-upload');
    if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
    const fieldsAndFiles = await new Promise((resolve, reject) => {
      form.parse(
        // formidable expects a Node.js IncomingMessage, so we fake it
        Object.assign(request, {
          headers: request.headers,
          on: () => {},
          pause: () => {},
          resume: () => {},
          pipe: () => {},
          unpipe: () => {},
          destroy: () => {},
          setTimeout: () => {},
          socket: {},
          readable: true,
          readableHighWaterMark: 0,
          readableLength: 0,
          _read: () => {},
        }),
        (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        }
      );
    });
    const { fields, files } = fieldsAndFiles as any;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const title = fields.title?.[0] || '';
    const tags = fields.tags?.[0] || '';
    const chillLevel = parseInt(fields.chillLevel?.[0] || '1', 10);
    const file = files.file;

    if (!title || !tags || !chillLevel || !file) {
      return NextResponse.json(
        { error: 'Title, tags, chill level, and image file are required' },
        { status: 400 }
      );
    }

    // Save file to public/uploads
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

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}