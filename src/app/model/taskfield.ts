
import {Format} from './format';
import {Field} from './field';
import {Color} from './color';

export abstract class TaskField {

  public hint: string = null;

  constructor(public column: number, public row: number) {
  }

  abstract check(field: Field): boolean;


  public toString() {
    return String.fromCharCode('A'.charCodeAt(0) + this.column) + (this.row + 1);
  }
}
