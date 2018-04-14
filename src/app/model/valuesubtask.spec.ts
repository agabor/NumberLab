import {Matrix} from './matrix';
import {Range} from './range';
import {ValueSubTask} from './valuesubtask';
import {Field} from './field';
import { Sheet } from './sheet';
import { Task } from './task';


describe('ValueSubTask', () => {
  it('should check a value sub task', () => {
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

    const sheet = new Sheet();
    for (let r = 0; r < 5; ++r) {
      const row: Field[] = [];
      for (let c = 0; c < 6; ++c) {
        const f = new Field(c, r);
        f.effectiveValue = m.get(c, r);
        row.push(f);
      }
      sheet.fields.push(row);
    }
    const task = new Task('', [new ValueSubTask(new Range(0, 0, 5, 4), m)]);
    expect(task.check(sheet)).toBe(true);
    expect(task.errorMessage).toBe('');
  });
});

