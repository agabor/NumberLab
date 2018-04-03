import {Field} from './field';
import {SubTask} from './subtask';
import {Range} from './range';

export class FormatSubTask extends SubTask {

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
