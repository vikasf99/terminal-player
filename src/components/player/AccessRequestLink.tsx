'use client';

import { getAccessRequestLink } from '@/lib/accessRequest';

type AccessRequestLinkProps = {
  prefix?: string;
  compact?: boolean;
};

export function AccessRequestLink({ prefix = 'not invited yet?', compact = false }: AccessRequestLinkProps) {
  const link = getAccessRequestLink();
  const isMailto = link.href.startsWith('mailto:');
  const isExternal = !isMailto && link.href.startsWith('http');

  if (compact) {
    return (
      <a
        href={link.href}
        style={{ color: 'var(--green-mid)' }}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        request access
      </a>
    );
  }

  return (
    <p style={{ margin: '10px 0 0', fontSize: 11, lineHeight: 1.5, color: 'var(--gray-muted)' }}>
      {prefix}{' '}
      <a
        href={link.href}
        style={{ color: 'var(--green-mid)' }}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {link.label}
      </a>
    </p>
  );
}
