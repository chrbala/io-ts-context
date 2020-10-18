import { pipe } from 'fp-ts/function';
import * as D from 'io-ts/Decoder';
import * as E from 'fp-ts/lib/Either';
import * as S from 'io-ts/Schemable';

export type ContextualDecoder<A, B, C> = (context: C) => D.Decoder<A, B>;

const contextualize = <A, B, C>(decoder: D.Decoder<A, B>): ContextualDecoder<A, B, C> => () => decoder;

export const literal = <A extends readonly [S.Literal, ...Array<S.Literal>]>(
  ...values: A
) => contextualize(D.literal(...values));

export const number = contextualize(D.number);
export const string = contextualize(D.string);

export const type = <C>() => <A>(
  properties: { [K in keyof A]: ContextualDecoder<unknown, A[K], C> }
): ContextualDecoder<unknown, { [K in keyof A]: A[K] }, C> => (context: C) =>
  D.type(
    Object.assign(
      {},
      ...Object.entries(properties).map(([k, v]: [k: any, v: any]) => ({ [k]: v(context) }))
    )
  );

export const compose = <X, Y, Z, C>(a: ContextualDecoder<X, Y, C>) => (
  b: ContextualDecoder<Y, Z, C>
) => (c: C) => pipe(a(c), D.compose(b(c)));

export const parse = <A, B, C, I>(
  parser: (a: A, c: C) => E.Either<D.DecodeError, B>
) => (decoder: (c: C) => D.Decoder<I, A>): ((c: C) => D.Decoder<I, B>) => (
  context: C
) =>
  pipe(
    decoder(context),
    D.parse(value => parser(value, context))
  );
