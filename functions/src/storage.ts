import * as minio from 'minio'
import { URL } from 'url'
import * as config from './config.json'

const endpoint = new URL(config.s3.endpoint)
const isSecure = endpoint.protocol === 'https'

export const client = new minio.Client({
  endPoint: endpoint.hostname,
  accessKey: config.s3.accessKey,
  secretKey: config.s3.secretKey
})

export function upload(objectName: string, buf: Buffer): Promise<string> {
  return client.putObject(config.s3.bucket, objectName, buf)
}

export function createURL(objectName: string): URL {
  return new URL(objectName, config.s3.publicEndpoint)
}
