import {Field} from './field';
import {TaskField} from './taskfield';
import {Range} from './range';
import {Formula} from './formula';

export class FormulaTaskField extends TaskField {

  constructor(public range: Range, public formulas: Formula[]) {
    super(range);
  }

  check(field: Field): boolean {
    if (field) {
      let formula = field.formula;
      formula = formula.replace(/ /g, '');
      for (const f of this.formulas) {
        if (f.render(field) === formula) {
          return true;
        }
      }
      this.hint = this.getHint(field);
    }
    return false;
  }


  public getHint(field: Field): string {
    let result = `A(z) ${field} cellába a következő formulát kell megadni: ${this.formulas[0].render(field)}. `;
    if (field.formula) {
      result += `Most ez van benne: ${field.formula}`;
    }
    return result;
  }

}
