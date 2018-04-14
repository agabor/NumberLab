import { Sheet } from './sheet';
import { Field } from './field';

describe('Sheet', () => {
  it('', () => {
    const sheet = new Sheet();
    for (let r = 0; r < 10; ++r) {
      const row: Field[] = [];
      for (let c = 0; c < 10; ++c) {
        const f = new Field(c, r);
        f.effectiveValue = c * r;
        row.push(f);
      }
      sheet.fields.push(row);
    }

    for (let r = 0; r < 10; ++r) {
      for (let c = 0; c < 10; ++c) {
        expect(sheet.getField(c, r).effectiveValue).toBe(c * r);
      }
    }
  });
});
