
import {Field} from './field';
import {SubTask} from './subtask';
import {Range} from './range';
import {Matrix} from './matrix';

export class ValueSubTask extends SubTask {

  constructor(public range: Range, public values: Matrix) {
    super(range);
  }


  check(field: Field): boolean {
    this.hint = null;
    if (this.getValue(field) !== field.effectiveValue) {
      this.hint = this.getHint(field);
      return false;
    }
    return true;
  }

  private getValue(field: Field) {
    return this.values.get(field.column - this.range.column0, field.row - this.range.row0);
  }

  public getHint(field: Field): string {
    let result = `A(z) ${field} cellába a következő értéket kell megadni: ${this.getValue(field)}. `;
    if (field.effectiveValue) {
      result += `Most ez van benne: ${field.effectiveValue}`;
    }
    return result;
  }
}
