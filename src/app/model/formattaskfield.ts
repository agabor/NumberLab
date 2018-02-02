import {TaskField} from './taskfield';
import {Format} from './format';
import {Field} from './field';
import {Color} from './color';

export class FormatTaskField extends TaskField {

  constructor(public column: number, public row: number, public format: Format) {
    super(column, row);
  }


  check(field: Field): boolean {
    this.hint = null;
    if (field) {
      if (this.fits(field)) {
        return true;
      }
      this.hint = this.getHint(field.value, field.format);
    }
    return false;
  }

  public getHint(content: string, actual: Format): string {
    let result = `A(z) ${this} cellának így kellene kinéznie: ${this.getHTMLSample(this.format, content)}. `;
    if (actual) {
      result += `Most ilyen: ${this.getHTMLSample(actual, content)}`;
    }
    return result;
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

