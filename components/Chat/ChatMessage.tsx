/* eslint react/no-children-prop: 0 */
import { ChatGPTMessage } from "@/models";
import { FC, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { anOldHope } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import js from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import ts from "react-syntax-highlighter/dist/cjs/languages/hljs/typescript";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("typescript", ts);

interface Props {
  message: ChatGPTMessage;
}

export const ChatMessage: FC<Props> = ({ message }) => {
  const [wasCopied, setWasCopied] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState(null);

  const copyToClipboard = useCallback(
    (children: any) => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
      navigator.clipboard.writeText(children[0]);
      setWasCopied(true);
      setTimeout(() => {
        setWasCopied(false);
      }, 2500);
    },
    [copyTimeout]
  );

  return (
    <div>
      <div
        className={`${
          message.role === "assistant"
            ? "bg-neutral-100 text-neutral-900"
            : "bg-blue-500 text-white"
        } rounded-2xl px-3 py-4 px-8 whitespace-pre-wrap`}
        style={{ overflowWrap: "anywhere" }}
      >
        <ReactMarkdown
          children={message.content}
          components={{
            code({ node, inline, className, children, ...props }) {
              if (!className) {
                className = "language-typescript";
              }
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <div className="relative" {...props}>
                  <div
                    className="flex px-4 py-2 text-xs items-center rounded-t-lg justify-between bg-slate-800 text-white font-mono text-sm"
                    onClick={() => copyToClipboard(children)}
                  >
                    <div>{match[1]}</div>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={copyToClipboard}
                    >
                      {!wasCopied ? (
                        <>
                          <ClipboardIcon className="text-white w-6 h-6 mr-2" />
                          Copy code
                        </>
                      ) : (
                        <>
                          <CheckIcon className="text-white w-6 h-6 mr-2" />
                          Code copied
                        </>
                      )}
                    </div>
                  </div>
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, "")}
                    style={anOldHope as any}
                    language={match[1]}
                    {...props}
                  />
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
    </div>
  );
};
