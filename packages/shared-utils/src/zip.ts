import archiver from 'archiver';
import { Readable } from 'stream';

export interface ZipFile {
  path: string;
  content: string;
}

export async function createZipStream(files: ZipFile[]): Promise<Readable> {
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  files.forEach(({ path, content }) => {
    archive.append(content, { name: path });
  });

  await archive.finalize();

  return archive;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
