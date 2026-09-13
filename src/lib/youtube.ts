/**
 * Busca no YouTube filtrada por "Vídeo" (exclui Shorts, playlists e canais), pra
 * reduzir a chance de abrir uma tela de Shorts sem contexto de qual exercício é.
 * `sp=EgIQAQ%3D%3D` é o parâmetro de filtro "Tipo: Vídeo" da busca do YouTube.
 */
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`
}
