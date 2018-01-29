
import {TaskField} from './taskfield';

export class Hint {
  constructor(public field: TaskField, public expected: any, public actual: any, public type: string) {

  }

  public toString(): string {
    let result = `Az ${this.field} cellába a következő ${this.type} kell megadni: ${this.expected}.`;
    if (this.actual) {
      result += `Most ez van benne: ${this.actual}`;
    }
    return result;
  }
}
