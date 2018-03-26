import {Field} from './field';
import {SubTask} from './subtask';
import {Range} from './range';
import {Formula} from './formula';

export class FormulaTaskField extends SubTask {

  constructor(public range: Range, public formulas: Formula[]) {
    super(range);
  }

  check(field: Field): boolean {
    let formula = field.formula || '';
    formula = formula.replace(/ /g, '');
    formula = formula.replace(/[$]/g, '');
    for (const f of this.formulas) {
      if (f.render(field) === formula) {
        return true;
      }
    }
    this.hint = this.getHint(field);
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
