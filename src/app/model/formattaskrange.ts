import {Field} from './field';
import {TaskField} from './taskfield';
import {Range} from './range';

export class FormatTaskRange extends TaskField {

  constructor(public range: Range, public format: string) {
    super(range);
  }

  check(field: Field): boolean {
    if (field.format !== this.format) {
      this.hint = `A(z) ${field} mezőn a következő formátumot kell beállítani: ${this.format}`;
      if (field.format) {
        this.hint += `, ehelyett a következő van megadva: ${field.format}`;
      }
      return false;
    }
    return true;
  }

}
