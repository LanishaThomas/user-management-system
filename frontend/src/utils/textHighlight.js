export const highlightTextParts = (text, query) => {
  if (!query) {
    return [{ text, match: false }];
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = String(text).split(regex).filter((part) => part !== '');

  return parts.map((part) => ({
    text: part,
    match: part.toLowerCase() === query.toLowerCase()
  }));
};
