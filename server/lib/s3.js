const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({});
const REGION = process.env.AWS_REGION || "us-east-1";

async function presignUpload(bucket, key, contentType) {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `https://${bucket}.s3.${REGION}.amazonaws.com/${key}`;
  return { uploadUrl, publicUrl };
}

async function uploadObject(bucket, key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

async function presignDownload(bucket, key, filename) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : undefined,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

module.exports = { presignUpload, uploadObject, presignDownload };
