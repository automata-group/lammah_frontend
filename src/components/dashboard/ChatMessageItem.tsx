"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageItemProps {
  msg: {
    role: string;
    content: string;
  };
}

export const ChatMessageItem = React.memo(function ChatMessageItem({ msg }: ChatMessageItemProps) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[85%] p-3.5 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tl-xs shadow-md shadow-blue-500/20">
          <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base font-medium">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[85%] p-3.5 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 rounded-tr-xs shadow-2xs">
        <div className="max-w-none text-xs sm:text-sm md:text-base font-medium leading-relaxed text-right">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pr-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pr-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="list-item mr-1">{children}</li>,
              h1: ({ children }) => <h1 className="text-lg font-black text-blue-600 dark:text-blue-400 mt-5 mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-black text-blue-600 dark:text-blue-400 mt-4 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 mt-3 mb-2">{children}</h3>,
              strong: ({ children }) => (
                <strong className="font-bold text-slate-950 dark:text-white bg-slate-200/60 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/10">
                  {children}
                </strong>
              ),
              em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/50">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-right">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs font-bold text-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm">{children}</tbody>,
              tr: ({ children }) => <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">{children}</tr>,
              th: ({ children }) => <th className="px-4 py-3 text-right font-black text-slate-900 dark:text-slate-200">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{children}</td>,
              code: ({ children }) => (
                <code className="bg-slate-100 dark:bg-slate-950/60 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-800/80">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-slate-100 dark:bg-slate-950/60 p-4 rounded-xl font-mono text-xs text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-800/80 my-4 overflow-x-auto whitespace-pre">
                  {children}
                </pre>
              ),
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

export default ChatMessageItem;
