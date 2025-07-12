// lib/agents/findRelevantImages.ts
export async function findRelevantImages(title: string): Promise<string[]> {
  try {
    const query = encodeURIComponent(title);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=3`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY || '',
        },
      }
    );

    const data = await res.json();

    if (!data.photos || data.photos.length === 0) {
      return [];
    }

    // Pick first 2 image URLs
    const images = data.photos.slice(0, 5).map((photo: any) => photo.src.large);

    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
} 