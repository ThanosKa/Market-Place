import dotenv from 'dotenv';
import path from 'path';

const envPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../../.env.test')
  : path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });
