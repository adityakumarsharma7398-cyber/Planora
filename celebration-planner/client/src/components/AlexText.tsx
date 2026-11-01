import React from 'react';

interface AlexTextProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  letterClassName?: string;
  /**
   * Optional custom optical size multiplier for the Alex Brush cursive characters.
   * Defaults to text-[1.15em] for natural optical balance with Nunito Sans.
   */
  scale?: string;
}

/**
 * Splits text into contiguous Latin alphabet segments [A-Za-z]+ (Alex Brush)
 * and non-Latin segments (Nunito Sans: spaces, digits, punctuation, currency, symbols).
 */
function segmentString(text: string): Array<{ text: string; isLatin: boolean }> {
  const segments: Array<{ text: string; isLatin: boolean }> = [];
  const regex = /([A-Za-z]+|[^A-Za-z]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[0]) {
      const isLatin = /^[A-Za-z]+$/.test(match[0]);
      segments.push({ text: match[0], isLatin });
    }
  }

  return segments;
}

/**
 * Extracts pure plain text from React nodes for screen reader accessibility.
 */
function extractPlainText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractPlainText).join('');
  if (React.isValidElement(node)) {
    return extractPlainText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

export const AlexText: React.FC<AlexTextProps> = ({
  children,
  as: Component = 'span',
  className = '',
  letterClassName = '',
  scale = 'text-[1.15em]',
}) => {
  const plainText = extractPlainText(children);

  // Recursively process nodes while preserving React elements
  const processNode = (node: React.ReactNode, keyPrefix: string): React.ReactNode => {
    if (typeof node === 'string') {
      const segments = segmentString(node);
      return segments.map((seg, idx) => {
        if (seg.isLatin) {
          return (
            <span
              key={`${keyPrefix}-${idx}`}
              className={`font-alex font-normal ${scale} leading-none tracking-normal inline ${letterClassName}`}
            >
              {seg.text}
            </span>
          );
        }
        return (
          <span key={`${keyPrefix}-${idx}`} className="font-sans inline">
            {seg.text}
          </span>
        );
      });
    }

    if (typeof node === 'number') {
      return (
        <span key={keyPrefix} className="font-sans inline">
          {node}
        </span>
      );
    }

    if (Array.isArray(node)) {
      return node.map((child, idx) => processNode(child, `${keyPrefix}-${idx}`));
    }

    if (React.isValidElement(node)) {
      const elementChildren = (node.props as { children?: React.ReactNode }).children;
      return React.cloneElement(
        node,
        { ...node.props, key: keyPrefix },
        processNode(elementChildren, `${keyPrefix}-c`)
      );
    }

    return node;
  };

  return (
    <Component className={className} aria-label={plainText}>
      <span aria-hidden="true" className="inline">
        {processNode(children, 'alex')}
      </span>
      <span className="sr-only">{plainText}</span>
    </Component>
  );
};

export default AlexText;
