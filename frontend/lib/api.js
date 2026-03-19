export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/['"]/g, '').trim() ||
  'http://localhost:8000'
