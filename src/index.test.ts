import { pipe } from 'fp-ts/function';
import * as D from 'io-ts/Decoder';
import * as C from './';
import * as E from 'fp-ts/Either';

const unsafeParse = <T, C>(
  decoder: C.ContextualDecoder<unknown, T, C>,
  context: C,
  value: unknown
) => {
  const result = decoder(context).decode(value);
  if (E.isLeft(result)) throw new Error(D.draw(result.left));

  return result.right;
};

describe('literal', () => {
  const literal = C.literal('A', 'B', 'C');

  test('valid', () => {
    const actual = unsafeParse(literal, null, 'A');
    const expected = 'A';
    expect(actual).toEqual(expected);
  });

  test('invalid', () => {
    expect(() =>
      unsafeParse(literal, null, 'D')
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('number', () => {
  type Context = {
    validateNumber: (num: number) => null | string;
  };
  const num = pipe(
    C.number,
    C.parse((s, c: Context) => {
      const error = c.validateNumber(s);
      return error ? D.failure(s, error) : D.success(s);
    })
  );

  const context: Context = {
    validateNumber: num => (num > 0 ? null : 'positive'),
  };

  test('valid', () => {
    const actual = unsafeParse(num, context, 5);
    const expected = 5;

    expect(actual).toEqual(expected);
  });

  test('invalid', () => {
    expect(() => unsafeParse(num, context, -5)).toThrowErrorMatchingSnapshot();
  });
});

describe('string', () => {
  type Context = {
    validateString: (str: string) => string | null;
  };
  const num = pipe(
    C.string,
    C.parse((s, c: Context) => {
      const error = c.validateString(s);
      return error ? D.failure(s, error) : D.success(s);
    })
  );

  const context: Context = {
    validateString: str => (str.match(/^[A-Z]*$/) ? null : 'capitalized'),
  };

  test('valid', () => {
    const actual = unsafeParse(num, context, 'CAPS');
    const expected = 'CAPS';

    expect(actual).toEqual(expected);
  });

  test('invalid', () => {
    expect(() =>
      unsafeParse(num, context, 'lowercase')
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('type', () => {
  type Context = {
    validateNumber: (num: number) => null | string;
  };
  const num = pipe(
    C.number,
    C.parse((s, c: Context) => {
      const error = c.validateNumber(s);
      return error ? D.failure(s, error) : D.success(s);
    })
  );

  const context: Context = {
    validateNumber: num => (num > 0 ? null : 'positive'),
  };

  const obj = C.type<Context>()({
    num,
  });

  test('valid', () => {
    const actual = unsafeParse(obj, context, { num: 5 });
    const expected = { num: 5 };

    expect(actual).toEqual(expected);
  });

  test('invalid', () => {
    expect(() =>
      unsafeParse(obj, context, { num: -5 })
    ).toThrowErrorMatchingSnapshot();
  });
});
