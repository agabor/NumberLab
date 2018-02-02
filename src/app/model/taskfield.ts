
import {Hint} from './hint';
import {Format} from './format';
import {Field} from './field';
import {Color} from './color';

export abstract class TaskField {
  hints: Hint[] = [];

  constructor(public column: number, public row: number) {
  }

  abstract check(field: Field): boolean;


  public toString() {
    return String.fromCharCode('A'.charCodeAt(0) + this.column) + (this.row + 1);
  }
}

export class ValueTaskField extends TaskField {

  constructor(public column: number, public row: number, public value: string) {
    super(column, row);
  }


  check(field: Field): boolean {
    this.hints = [];
    if (!field) {
      this.hints.push(new Hint(this, this.value, null, 'értéket'));
      return false;
    }
    if (this.value !== field.value) {
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
      this.hints.push(new Hint(this, this.formulas[0], field.formula, 'formulák egyikét'));
    }
    this.hints.push(new Hint(this, this.formulas[0], null, 'formulák egyikét'));
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
      if (this.fits(field)) {
        return true;
      }
      this.hints.push(new Hint(this, this.getHTMLSample(this.format, field.value), this.getHTMLSample(field.format, field.value), '...'));
    }
    return false;
  }

  fits(field: Field): boolean {
    const actualBG = field.format.backgroundColor;
    const expectedBG = this.format.backgroundColor;
    if (expectedBG && !actualBG.isSimilarTo(expectedBG)) {
      return false;
    }
    const actualFG = field.format.backgroundColor;
    const expectedFG = this.format.backgroundColor;
    if (expectedFG && !actualFG.isSimilarTo(expectedFG)) {
      return false;
    }
    return true;
  }

  getHTMLSample(format: Format, content: string): string {
    return '<div class="color-sample" ' +
      'style="' +
      'background-color: ' + this.bgColorDisplay(format).html + '; ' +
      'color: ' + this.fgColorDisplay(format).html +
      '">' +
      content +
      '</div>';
  }



  bgColorDisplay(format: Format): Color {
    if (format.backgroundColor) {
      return format.backgroundColor;
    }
    return new Color(1, 1, 1);
  }
  fgColorDisplay(format: Format): Color {
    if (format.foregroundColor) {
      return format.foregroundColor;
    }
    return new Color(0, 0, 0);
  }

  get style(): string {
    const color = this.format.backgroundColor;
    const gray = color.red * 0.21 + color.green * 0.72 + color. blue * 0.07;
    return 'background-color: ' + color.html + '; color: ' + (gray > 0.5 ? '#000000' : '#ffffff') + ';';
  }
}

