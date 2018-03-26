import {Matrix} from './matrix';
import {Range} from './range';
import {ValueSubTask} from './valuesubtask';
import {Field} from './field';


describe('Matrix', () => {
  it('should split a matrix', () => {
    const m = new Matrix([
      [0, 1, 2, 3, 4, 5],
      [10, 11, 12, 13, 14, 15],
      [20, 21, 22, 23, 24, 25],
      [30, 31, 32, 33, 34, 35],
      [40, 41, 42, 43, 44, 45],
    ]);

    const st = new ValueSubTask(new Range(5, 5, 10, 9), m);

    const field = new Field(5, 6);
    field.effectiveValue = 10;
    expect(st.check(field)).toBe(true);
    field.row += 1;
    expect(st.check(field)).toBe(false);
  });
});

