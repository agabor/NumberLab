import {Task} from './task';
import {Matrix} from './matrix';

export class Section {
  constructor(public title: string, public description: string, public values: Matrix, public tasks: Task[]) {

  }
}

