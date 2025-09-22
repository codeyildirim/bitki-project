import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getUploadsDir = () => {
  return process.env.NODE_ENV === 'production'
    ? '/opt/render/project/uploads'
    : join(__dirname, '../../uploads');
};

export const getUploadPath = (subDir = '') => {
  const uploadsDir = getUploadsDir();
  return subDir ? join(uploadsDir, subDir) : uploadsDir;
};