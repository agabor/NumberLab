import {Field} from './field';
import {Range} from './range';

export class Formula {
  constructor(public parts: (string|Range)[]) {

  }

  render(field: Field): string {
    let result = '';

    for (const part of this.parts) {
      if (part instanceof Range) {
        const r = <Range>part;
        const column = field.range.column0;
        const row = field.range.row0;
        const rr = new Range(r.column0 + column, r.row0 + row,
          r.column1 + column, r.row1 + row);
        result += rr.toString();
      } else {
        result += part;
      }
    }

    return result;
  }
}
