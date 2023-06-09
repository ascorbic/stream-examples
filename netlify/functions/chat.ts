import { stream } from "@netlify/functions";
export const handler = stream(async (event) => {
  // Get the request from the request query string, or use a default
  const drink =
    event.queryStringParameters?.drink ??
    "something inspired by an English garden";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Set this in your env vars
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a cocktail bartender. The user will ask you for a drink. You will respond with the recipe. Use markdown to format your response",
        },
        // Using "slice" to limit the length of the input to 500 characters
        { role: "user", content: drink.slice(0, 500) },
      ],
      // Use server-sent events to stream the response
      stream: true,
    }),
  });

  return {
    headers: {
      // This is the mimetype for server-sent events
      "content-type": "text/event-stream",
    },
    statusCode: 200,
    // Pipe the event stream from OpenAI to the client
    body: res.body,
  };
});
