import JSZip from 'jszip';
import { GeneratedFile } from './codeGenerator';

export async function createProjectZip(files: GeneratedFile[]): Promise<Buffer> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return content;
}
