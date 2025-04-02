# MCPGuide

MCPGuide is a Node.js implementation of the Model Context Protocol (MCP) for Large Language Models (LLMs). It provides a framework for managing and providing context to LLMs through a standardized protocol.

## Features

- Implementation of the Model Context Protocol (MCP) SDK
- Knowledge base management for LLM context
- Event-driven architecture for real-time updates
- TypeScript support with full type safety
- Command-line interface for easy interaction

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

```bash
npm install mcpguide
```

## Usage

### Command Line Interface

```bash
mcpguide [options]
```

### Development Mode

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcpguide.git
cd mcpguide
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the development server:
```bash
npm run start
```

## Available Scripts

- `npm run build` - Compiles TypeScript to JavaScript
- `npm run start` - Starts the production server
- `npm run test` - Runs all tests
- `npm run test:client` - Runs client-specific tests
- `npm run listener` - Starts the development listener

## Project Structure

```
mcpguide/
├── src/
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   ├── host.ts         # Main host implementation
│   ├── listener.ts     # Event listener implementation
│   ├── knowledgebase.ts # Knowledge base management
│   └── test-logger.ts  # Test logging utilities
├── test/              # Test files
├── dist/              # Compiled JavaScript files
└── data/              # Data files
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK implementation
- `commander`: Command-line interface framework
- `eventsource`: Event source implementation
- `mcps-logger`: Logging utilities
- `zod`: Runtime type checking and validation

## Development

The project uses TypeScript for type safety and better development experience. Jest is used for testing.

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
