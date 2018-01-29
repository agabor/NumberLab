
import {Hint} from './hint';
import {Format} from './format';
import {Field} from './field';

export abstract class TaskField {
  hints: Hint[] = [];

  constructor(public column: number, public row: number) {
  }

  abstract check(field: Field): boolean;


  public toString() {
    return String.fromCharCode('A'.charCodeAt(0) + this.column) + this.row;
  }
}

export class ValueTaskField extends TaskField {

  constructor(public column: number, public row: number, public value: string) {
    super(column, row);
  }


  check(field: Field): boolean {
    this.hints = [];
    if (!field || this.value !== field.value) {
      this.hints.push(new Hint(this, this.value, field.value, 'értéket'));
      return false;
    }
    return true;
  }

}

export class FormulaTaskField extends TaskField {

  constructor(public column: number, public row: number, public formulas: string[]) {
    super(column, row);
  }


  check(field: Field): boolean {
    this.hints = [];
    if (field) {
      let formula = field.formula;
      formula = formula.replace(/ /g, '');
      for (const f of this.formulas) {
        if (f === formula) {
          return true;
        }
      }
      this.hints.push(new Hint(this, this.formulas, field.formula, 'formulák egyikét'));
    }
    this.hints.push(new Hint(this, this.formulas, null, 'formulák egyikét'));
    return false;
  }

}


export class FormatTaskField extends TaskField {

  constructor(public column: number, public row: number, public format: Format) {
    super(column, row);
  }


  check(field: Field): boolean {
    this.hints = [];
    if (field) {
      const actualBG = field.format.backgroundColor;
      const expectedBG = this.format.backgroundColor;
      if (expectedBG && !actualBG.isSimilarTo(expectedBG)) {
        this.hints.push(new Hint(this, expectedBG, actualBG, 'háttérszínt'));
        return false;
      }
      const actualFG = field.format.backgroundColor;
      const expectedFG = this.format.backgroundColor;
      if (expectedFG && !actualFG.isSimilarTo(expectedFG)) {
        this.hints.push(new Hint(this, expectedFG, actualFG, 'szövegszínt'));
        return false;
      }
      return true;
    }
    return false;
  }

  get style(): any {
    return {'background-color': this.format.backgroundColor.html};
  }
}

