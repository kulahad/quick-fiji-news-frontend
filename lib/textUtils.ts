export function stripHtml(html: string) {
  // Create a temporary div element
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Get the text content
  return doc.body.textContent || "";
}

export function truncateText(text: string, maxLength: number = 200) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
