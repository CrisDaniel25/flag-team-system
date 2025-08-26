import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';


const cfg = {
forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
region: process.env.S3_REGION || 'us-east-1',
endpoint: process.env.S3_ENDPOINT || undefined,
credentials: process.env.S3_ACCESS_KEY ? {
accessKeyId: process.env.S3_ACCESS_KEY,
secretAccessKey: process.env.S3_SECRET_KEY,
} : undefined,
};


const s3 = new S3Client(cfg);
const BUCKET = process.env.S3_BUCKET || 'flagteam';
const PUBLIC_BASE = process.env.S3_PUBLIC_BASE || '';


export async function presignPut({ filename, contentType, folder='uploads' }){
const key = `${folder}/${randomUUID()}-${filename}`;
const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
// Path-style public URL (works with MinIO when bucket is public for download)
const publicUrl = PUBLIC_BASE ? `${PUBLIC_BASE.replace(/\/$/, '')}/${BUCKET}/${key}` : '';
return { key, uploadUrl, publicUrl };
}