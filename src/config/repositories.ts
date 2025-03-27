export interface RepositoryInfo {
  name: string;
  url: string;
  files: {
    remotePath: string;
    localPath: string;
    required: boolean;
  }[];
}

export const LATEST_PROTOCOL_VERSION = "2025-03-26";

export const REPOSITORIES: RepositoryInfo[] = [
  {
    name: "specification",
    url: "https://github.com/modelcontextprotocol/specification",
    files: [
      {
        remotePath: "/raw/main/schema/schema.json",
        localPath: "specifications/schema.json",
        required: true
      },
      {
        remotePath: "/raw/main/schema/examples/resource-response.json",
        localPath: "examples/resource-response.json",
        required: false
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
        remotePath: "/raw/main/usage-guide.md",
        localPath: "documentation/usage-guide.md",
        required: true
      }
    ]
  }
];