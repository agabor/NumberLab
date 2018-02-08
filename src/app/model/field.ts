
import {Display} from './display';
import {Range} from './range';

export class Field {

  constructor(public range: Range) {

  }
  effectiveValue: string|number;
  formattedValue: string;
  formula: string;
  display: Display;
  format: string;
  public toString() {
    return this.range.toString();
  }
}
