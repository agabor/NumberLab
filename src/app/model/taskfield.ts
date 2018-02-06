import {TaskRange} from './taskrange';

export abstract class TaskField extends TaskRange {

  public hint: string = null;

  constructor(public column: number, public row: number) {
    super(column, row, column, row);
  }

  public toString() {
    return TaskRange.stringCoords(this.column, this.row);
  }
}
