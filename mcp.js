import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod"

const server = new McpServer({
  name: "add-server",
  version: "1.0.0"
})

// Register the addition tool
server.registerTool(
  "add", // Tool name
  // This is the tool schema
  {
    title: "Addition Tool",
    description: "Add two numbers together",
    inputSchema: {
      a: z.number(), 
      b: z.number()
    },
  },
  // This will run when the tool is called
  async ({ a, b}) => {
    return {
      content: [{type: "text", text: String(a + b)}]
    }
  }
)

// The method in which the messages will be transported, and then start the server with the transport
const transport = new StdioServerTransport()
await server.connect(transport)



