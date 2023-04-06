import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { ChatGPTCompletion, ChatGPTMessage } from "../models";

export class ChatGPT {
  API_URL = "https://api.openai.com/v1/chat/completions";
  constructor(public apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(
    messages: ChatGPTMessage[],
    options: any = {}
  ): Promise<ChatGPTCompletion> {
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        ...options,
      }),
    });

    return res.json();
  }

  async stream(
    messages: ChatGPTMessage[],
    options: any = {}
  ): Promise<ReadableStream> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    console.log("Requesting", [
      {
        role: "system",
          content: `You are a helpful, friendly, assistant`
      },
      ...messages,
    ]);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful, friendly, assistant`
          },
          ...messages,
        ],
        temperature: 0.0,
        stream: true,
      }),
    });

    if (res.status !== 200) {
      throw new Error("OpenAI API returned an error");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const onParse = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data;

            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };

        const parser = createParser(onParse);

        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    return stream;
  }
}
