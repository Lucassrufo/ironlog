import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_CACHE_PREFIX = '@ironlog/exercise-video/';
const YOUTUBE_ID_PATTERN = /"videoId":"([a-zA-Z0-9_-]{11})"/g;

function normalizeQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function uniqueVideoIds(html: string) {
  const matches = Array.from(html.matchAll(YOUTUBE_ID_PATTERN), (match) => match[1]);
  return [...new Set(matches)];
}

export function getExerciseVideoSearchUrl(exerciseName: string) {
  const query = `${exerciseName} execução correta musculação`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export async function resolveExerciseVideoId(exerciseName: string) {
  const cacheKey = `${VIDEO_CACHE_PREFIX}${normalizeQuery(exerciseName)}`;
  const cachedVideoId = await AsyncStorage.getItem(cacheKey);

  if (cachedVideoId) {
    return cachedVideoId;
  }

  const response = await fetch(getExerciseVideoSearchUrl(exerciseName), {
    headers: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const [videoId] = uniqueVideoIds(html);

  if (!videoId) {
    return null;
  }

  await AsyncStorage.setItem(cacheKey, videoId);
  return videoId;
}

export function createYoutubePlayerHtml(videoId: string, title: string) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&origin=https%3A%2F%2Fironlog.app`;

  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html, body, iframe {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #000000;
      }
      iframe {
        border: 0;
      }
    </style>
  </head>
  <body>
    <iframe
      src="${embedUrl}"
      title="${title.replace(/"/g, '&quot;')}"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </body>
</html>`;
}
