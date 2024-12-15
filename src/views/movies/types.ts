export type Movie = {
  movieId: string
  name: string
  ticketsSold?: number
  releaseDate: string
  price?: number
}

export type MovieRequest = {
  movieId?: string
  name: string
  integral?: number
  time: string
  price: number
}
