import {Matrix} from './matrix';
import {Range} from './range';
import {Field} from './field';
import { FormatTaskRange } from './formattaskrange';


describe('ValueSubTask', () => {
  it('should check a value sub task', () => {
    const m = new Matrix([
      [0, 1, 2, 3, 4, 5],
      [10, 11, 12, 13, 14, 15],
      [20, 21, 22, 23, 24, 25],
      [30, 31, 32, 33, 34, 35],
      [40, 41, 42, 43, 44, 45],
    ]);

    const st = new FormatTaskRange(new Range(5, 5, 10, 9),  '# ##0 t');

    const field = new Field(5, 6);
    field.effectiveValue = 10;
    expect(st.check(field)).toBe(false);
    field.format =  '# ##0 kg';
    expect(st.check(field)).toBe(false);
    field.format =  '# ##0 t';
    expect(st.check(field)).toBe(true);
  });
});

