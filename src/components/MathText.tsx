import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text?: string | null;
  className?: string;
}

interface TextSegment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

function parseLatexSegments(input: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /(\$\$[\s\S]+?\$\$|\$(?:\\.|[^$\\])+\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: input.slice(lastIndex, match.index),
      });
    }
    const token = match[0];
    if (token.startsWith('$$') && token.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: token.slice(2, -2).trim(),
      });
    } else {
      segments.push({
        type: 'inline-math',
        content: token.slice(1, -1).trim(),
      });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
  }

  return segments;
}

function renderLatex(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return expr;
  }
}

export const MathText: React.FC<MathTextProps> = React.memo(({ text, className }) => {
  const segments = useMemo(() => {
    if (!text) return [];
    return parseLatexSegments(text);
  }, [text]);

  if (!text) return null;

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }
        const html = renderLatex(seg.content, seg.type === 'block-math');
        if (seg.type === 'block-math') {
          return (
            <span
              key={idx}
              dir="ltr"
              className="katex-ltr-block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <span
            key={idx}
            dir="ltr"
            className="katex-ltr-inline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
});

MathText.displayName = 'MathText';
