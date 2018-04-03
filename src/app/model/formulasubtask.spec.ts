import { Formula } from './formula';
import { Range } from './range';
import { Field } from './field';
import { FormatSubTask } from './formatsubtask';
import { FormulaSubTask } from './formulasubtask';

describe('FormulaSubTask', () => {
  it('should check a formula sub task', () => {
    const st = new FormulaSubTask(new Range(0, 0, 0, 10), [new Formula(['=SUM(', new Range(1, 0, 3, 0), ')'])]);

    let field = new Field(0, 0);
    field.effectiveValue = 10;
    field.formula = '=SUM(B1:E1)';
    expect(st.check(field)).toBe(false);
    field.formula = '=SUM(B1:D1)';
    expect(st.check(field)).toBe(true);
    field = new Field(0, 3);
    field.effectiveValue = 10;
    field.formula = '=SUM(B4:D4)';
    expect(st.check(field)).toBe(true);
  });
});
