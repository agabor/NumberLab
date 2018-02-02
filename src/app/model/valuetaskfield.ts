
import {Field} from './field';
import {TaskField} from './taskfield';

export class ValueTaskField extends TaskField {

  constructor(public column: number, public row: number, public value: string) {
    super(column, row);
  }


  check(field: Field): boolean {
    this.hint = null;
    if (!field) {
      this.hint = this.getHint();
      return false;
    }
    if (this.value !== field.value) {
      this.hint = this.getHint(field.value);
      return false;
    }
    return true;
  }

  public getHint(actual: string = null): string {
    let result = `A(z) ${this} cellába a következő értéket kell megadni: ${this.value}. `;
    if (actual) {
      result += `Most ez van benne: ${actual}`;
    }
    return result;
  }
}
