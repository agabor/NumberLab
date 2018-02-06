import {TaskRange} from './taskrange';
import {Field} from './field';

export class FormatTaskRange extends TaskRange {

  constructor(public column0: number, public row0: number, public column1: number, public row1: number, public format: string) {
    super(column0, row0, column1, row1);
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
