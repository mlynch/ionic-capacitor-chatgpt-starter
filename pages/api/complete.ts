// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest } from 'next/server';
import { ChatGPTMessage } from '../../models';
import { ChatGPT } from '../../api/chatgpt';

type Data = any;

export const config = {
  runtime: "edge"
};

export default async function handler(
  req: NextRequest,
) {
  try {
    const { messages, systemPrompt } = (await req.json()) as {
      messages: ChatGPTMessage[];
      systemPrompt: ChatGPTMessage;
    };

    const charLimit = 12000;
    let charCount = 0;
    let messagesToSend: ChatGPTMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (charCount + message.content.length > charLimit) {
        console.log('Character limit reached', charCount, message.content.length);
        break;
      }
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    messagesToSend = [systemPrompt, ...messagesToSend];

    const gpt = new ChatGPT(process.env.OPENAI_API_KEY!);
    const stream = await gpt.stream(messagesToSend);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}