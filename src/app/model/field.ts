
import {Display} from './display';
import {TaskRange} from './taskrange';

export class Field {

  constructor(private column: number, private row: number) {

  }

  value: string;
  formula: string;
  display: Display;
  format: string;
  public toString() {
    return TaskRange.stringCoords(this.column, this.row);
  }
}
