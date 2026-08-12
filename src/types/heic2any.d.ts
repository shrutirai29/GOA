declare module "heic2any" {
  interface Heic2AnyOptions {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }
  type Result = Blob | Blob[];
  export default function heic2any(options: Heic2AnyOptions): Promise<Result>;
}
