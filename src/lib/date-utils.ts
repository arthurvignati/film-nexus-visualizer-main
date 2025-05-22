
export function formatReleaseYear(releaseDate: string): string {
  if (!releaseDate) return 'N/A';
  
  try {
    const date = new Date(releaseDate);
    return date.getFullYear().toString();
  } catch (e) {
    console.error("Error parsing date:", releaseDate);
    return 'N/A';
  }
}
