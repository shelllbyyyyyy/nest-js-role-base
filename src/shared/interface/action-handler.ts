export interface IActionHandler<T, D, E> {
  handle(data: T, payload: D): E | Promise<E>;
}
