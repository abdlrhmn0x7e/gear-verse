type ElementType<A> = A extends ReadonlyArray<infer T> ? T : never;

type ElementsOfAll<
  Inputs,
  R extends ReadonlyArray<unknown> = [],
> = Inputs extends readonly [infer F, ...infer M]
  ? ElementsOfAll<M, [...R, ElementType<F>]>
  : R;

type CartesianProduct<Inputs> = ElementsOfAll<Inputs>[];

export function cartesianProduct<
  Sets extends ReadonlyArray<ReadonlyArray<unknown>>,
>(sets: Sets): CartesianProduct<Sets> {
  return sets.reduce((a, b) =>
    a.flatMap((d) => b.map((e) => [d, e].flat())),
  ) as CartesianProduct<Sets>;
}
