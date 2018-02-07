
import {Display} from './display';
import {Range} from './range';

export class Field {

  constructor(private column: number, private row: number) {

  }

  value: string;
  formula: string;
  display: Display;
  format: string;
  public toString() {
    return new Range(this.column, this.row).toString();
  }
}
