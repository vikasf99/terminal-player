'use client';

import { getAccessRequestLink } from '@/lib/accessRequest';

type AccessRequestLinkProps = {
  prefix?: string;
};

export function AccessRequestLink({ prefix = 'not invited yet?' }: AccessRequestLinkProps) {
  const link = getAccessRequestLink();
  const isMailto = link.href.startsWith('mailto:');
  const isExternal = !isMailto && link.href.startsWith('http');

  return (
    <p style={{ margin: '10px 0 0', fontSize: 11, lineHeight: 1.6, color: 'var(--gray-muted)' }}>
      {prefix}{' '}
      <a
        href={link.href}
        style={{ color: 'var(--green-mid)' }}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        [{link.label}]
      </a>
      <span style={{ display: 'block', marginTop: 4 }}>
        include your spotify account email · owner adds you in the spotify developer dashboard (max 5 until
        extended quota is approved)
      </span>
    </p>
  );
}
