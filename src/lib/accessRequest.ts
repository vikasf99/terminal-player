export type AccessRequestLink = {
  href: string;
  label: string;
};

const defaultGithubRequestUrl =
  'https://github.com/vikasf99/terminal-player/issues/new?title=Access%20request&body=Spotify%20account%20email%3A%0A%0A(Spotify%20Premium%3F%20yes%2Fno)%0A';

export const getAccessRequestLink = (): AccessRequestLink => {
  const url = process.env.NEXT_PUBLIC_ACCESS_REQUEST_URL?.trim();
  if (url) {
    return { href: url, label: 'request access' };
  }

  const email = process.env.NEXT_PUBLIC_ACCESS_REQUEST_EMAIL?.trim();
  if (email) {
    const subject = encodeURIComponent('terminal-playlist access request');
    const body = encodeURIComponent('Spotify account email:\n\n(Spotify Premium? yes/no)\n');
    return { href: `mailto:${email}?subject=${subject}&body=${body}`, label: 'request access by email' };
  }

  return { href: defaultGithubRequestUrl, label: 'request access' };
};
