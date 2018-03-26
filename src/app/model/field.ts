
import {Display} from './display';
import {Range} from './range';

export class Field {

  constructor(public column: number, public row: number) {

  }
  effectiveValue: string|number;
  formattedValue: string;
  formula: string;
  display: Display;
  format: string;
  public toString() {
    return Range.stringCoords(this.column, this.row);
  }
}
