export abstract class IUseCase<T, D> {
  abstract execute(data: T): D | Promise<D>;
}
