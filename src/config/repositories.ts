import { RepositoryInfo } from '../types/repositories';
import { LATEST_PROTOCOL_VERSION } from './constants';

export const REPOSITORIES: RepositoryInfo[] = [
  {
    name: "specification",
    url: "https://github.com/modelcontextprotocol/specification",
    files: [
      {
        remotePath: `/raw/main/schema/${LATEST_PROTOCOL_VERSION}/schema.json`,
        localPath: `specifications/${LATEST_PROTOCOL_VERSION}/schema.json`,
        required: true
      }
    ]
  },
  {
    name: "typescript-sdk",
    url: "https://github.com/modelcontextprotocol/typescript-sdk",
    files: [
      {
        remotePath: "/raw/main/README.md",
        localPath: "implementations/typescript-sdk/README.md",
        required: true
      }
    ]
  },
  {
    name: "python-sdk",
    url: "https://github.com/modelcontextprotocol/python-sdk",
    files: [
      {
        remotePath: "/raw/main/README.md",
        localPath: "implementations/python-sdk/README.md",
        required: true
      }
    ]
  },
  {
    name: "documentation",
    url: "https://github.com/modelcontextprotocol/docs",
    files: [
      {
        remotePath: "/raw/main/README.md",
        localPath: "documentation/README.md",
        required: true
      }
    ]
  }
];