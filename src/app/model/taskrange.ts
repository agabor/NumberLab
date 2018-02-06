import {Field} from './field';

export abstract class TaskRange {

  public hint: string = null;

  constructor(public column0: number, public row0: number, public column1: number, public row1: number) {
  }


  public static stringCoords(column: number, row: number) {
    return String.fromCharCode('A'.charCodeAt(0) + column) + (row + 1);
  }

  abstract check(field: Field): boolean;


  public toString() {
    return TaskRange.stringCoords(this.column0, this.row0) + ':' + TaskRange.stringCoords(this.column1, this.row1);
  }
}
