import mitt, { Emitter } from 'mitt'

type Events = {
  'member-change': void
  'card-change': void
  'movie-change': void
}

const emitter: Emitter<Events> = mitt<Events>()

// 为了兼容老项目的 $on 和 $emit 写法
const bus = {
  $on: emitter.on,
  $emit: emitter.emit,
  $off: emitter.off,
}

export default bus
