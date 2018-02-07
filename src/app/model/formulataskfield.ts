import {Field} from './field';
import {TaskField} from './taskfield';
import {Range} from './range';

export class FormulaTaskField extends TaskField {

  constructor(public range: Range, public formulas: string[]) {
    super(range);
  }

  check(field: Field): boolean {
    if (field) {
      let formula = field.formula;
      formula = formula.replace(/ /g, '');
      for (const f of this.formulas) {
        if (f === formula) {
          return true;
        }
      }
      this.hint = this.getHint(field.formula);
    }
    this.hint = this.getHint();
    return false;
  }


  public getHint(actual: string = null): string {
    let result = `A(z) ${this} cellába a következő formulát kell megadni: ${this.formulas[0]}. `;
    if (actual) {
      result += `Most ez van benne: ${actual}`;
    }
    return result;
  }

}
