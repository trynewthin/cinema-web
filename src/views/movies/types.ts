export type Movie = {
  movieId: string
  name: string
  ticketsSold?: number
  releaseDate: string
  price?: number
}

export type MovieApiResponse = {
  movieId: string
  name: string
  integral?: number | string
  time?: string
  price?: number | string
}

export type PageResult<T> = {
  code: number
  message: string
  data?: {
    list: T[]
    pageTotal: number
  }
}
