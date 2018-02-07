import {Field} from './field';
import {Range} from './range';

export abstract class TaskField {

  public hint: string = null;

  constructor(public range: Range) {
  }

  abstract check(field: Field): boolean;

  public toString() {
    return this.range.toString();
  }
}
