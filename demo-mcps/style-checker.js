import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "fs";

const airbnbStyleGuidePath = "/Users/michaelhenderson/dev/personal/mcp-intro/demo-mcps/style-guide.md";
const airbnbStyleGuide = readFileSync(airbnbStyleGuidePath, "utf-8");

const server = new McpServer({
	name: "code-review-server",
	version: "1.0.0",
});

server.registerPrompt(
	"review-code",
	{
		title: "Code Review",
		description: "Review code for best practices and potential issues",
		argsSchema: { code: z.string() },
	},
	({ code }) => ({
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: `Please review this code to see if it follows our best practices. 
					Use this airbnb style guide as a reference and the rules: 
					\n\n =============== ${airbnbStyleGuide} \n\n ===============
					here is the code to review: \n\n ${code}
					`,
				},
			},
		],
	})
);

const transport = new StdioServerTransport();
await server.connect(transport);
