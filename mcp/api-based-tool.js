import { z } from "zod";

export default function apiBasedTools(server) {
	const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:6969/api";

	async function makeRequest(method, url, data = null, options = {}) {
		const config = {
			method,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		};

		const { headers: _, ...otherOptions } = options;

		if (data) config.body = JSON.stringify(data);

		Object.assign(config, otherOptions);

		try {
			const response = await fetch(url, config);
			const result = await response.text();

			let jsonResult;

			try {
				jsonResult = JSON.parse(result);
			} catch (err) {
				jsonResult = result;
			}

			return {
				status: response.status,
				data: jsonResult,
				headers: Object.fromEntries(response.headers.entries()),
			};
		} catch (err) {
			return {
				status: 500,
				data: null,
			};
		}
	}

	server.registerTool(
		"issue-create",
		{
			title: "Create Issue",
			description: "Create a new issue in our issue tracker",
			inputSchema: {
				title: z.string().describe("Issue title"),
				description: z.string().optional().describe("The issue description"),
				status: z.enum(["not_started", "in_progress", "done"]).optional().describe("The status of the issue"),
				priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("The priority of the issue."),
				assigned_user_id: z.string().optional().describe("The assigned user to this issue"),
				tag_ids: z.array(z.number()).optional().describe("Array of tag IDs"),
				apiKey: z.string().describe("API Key for authentication"),
			},
		},
		async (params) => {
			const { apiKey, ...issueData } = params;

			const result = await makeRequest("POST", `${API_BASE_URL}/issues`, issueData, {
				headers: { "x-api-key": apiKey },
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		}
	);

	server.registerTool(
		"tags-list",
		{
			title: "List Tags",
			description: "Get all available tags",
			inputSchema: {
				apiKey: z.string().describe("API key for authentication"),
			},
		},
		async ({ apiKey }) => {
			const result = await makeRequest("GET", `${API_BASE_URL}/tags`, null, {
				headers: { "x-api-key": apiKey },
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		}
	);
}
