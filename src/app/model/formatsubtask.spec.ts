import {Matrix} from './matrix';
import {Range} from './range';
import {Field} from './field';
import { FormatSubTask } from './formatsubtask';


describe('FormatSubTask', () => {
  it('should check a format sub task', () => {
    const st = new FormatSubTask(new Range(5, 5, 10, 9),  '# ##0 t');

    const field = new Field(5, 6);
    field.effectiveValue = 10;
    expect(st.check(field)).toBe(false);
    field.format =  '# ##0 kg';
    expect(st.check(field)).toBe(false);
    field.format =  '# ##0 t';
    expect(st.check(field)).toBe(true);
  });
});

