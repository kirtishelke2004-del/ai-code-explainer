import { useEffect, useRef } from 'react';
import { isSandboxMessage, type SandboxMessage } from '@/lib/sandbox';

interface SandboxFrameProps {
  srcDoc: string;
  visible: boolean;
  onMessage: (message: SandboxMessage) => void;
}

export default function SandboxFrame({ srcDoc, visible, onMessage }: SandboxFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isSandboxMessage(event.data)) return;
      onMessage(event.data);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      title="Sandboxed program output"
      className={visible ? 'h-full w-full bg-white' : 'hidden'}
    />
  );
}
