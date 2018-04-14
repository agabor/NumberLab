import { Matrix } from './matrix';
import { Range } from './range';
import { Field } from './field';
import { FormatSubTask } from './formatsubtask';
import { SortedNumberColumn } from './sortedcolumn';

describe('SortedNumberColumn', () => {
  it('should check a sorted column', () => {
    const ascCol = new SortedNumberColumn(new Range(1, 0, 1, 5), true);
    const descCol = new SortedNumberColumn(new Range(1, 0, 1, 5), false);
    const ascCol2 = new SortedNumberColumn(new Range(1, 0, 1, 5), true);
    const descCol2 = new SortedNumberColumn(new Range(1, 0, 1, 5), false);

    for (let i = 0; i <= 5; ++i) {
      const field = new Field(1, i);
      field.effectiveValue = i;
      expect(ascCol.check(field)).toBe(true);
      if (i === 0) {
        expect(descCol.check(field)).toBe(true);
      } else {
        expect(descCol.check(field)).toBe(false);
      }
      field.effectiveValue = 100 - i;
      expect(descCol2.check(field)).toBe(true);
      if (i === 0) {
        expect(ascCol2.check(field)).toBe(true);
      } else {
        expect(ascCol2.check(field)).toBe(false);
      }
    }

    ascCol.reset();
    descCol.reset();
    ascCol2.reset();
    descCol2.reset();

    for (let i = 5; i >= 0; --i) {
      const field = new Field(1, i);
      field.effectiveValue = i;
      expect(ascCol.check(field)).toBe(true);
      if (i === 5) {
        expect(descCol.check(field)).toBe(true);
      } else {
        expect(descCol.check(field)).toBe(false);
      }
      field.effectiveValue = 100 - i;
      expect(descCol2.check(field)).toBe(true);
      if (i === 5) {
        expect(ascCol2.check(field)).toBe(true);
      } else {
        expect(ascCol2.check(field)).toBe(false);
      }
    }
  });
});
