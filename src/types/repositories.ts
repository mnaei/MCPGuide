export interface RepositoryInfo {
  name: string;
  url: string;
  files: {
    remotePath: string;
    localPath: string;
    required: boolean;
  }[];
} 