import {ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  loaded = false;
  private _spreadsheetId = null;
  gapi: any = null;
  loader: SheetLoader = new SheetLoader;
  section: Section = new Section('Alapok', 'Most megtanuljuk az alapokat', [
    new Task('Írd az A1-es cellába hogy "oszlop1" és a B1-es cellába hogy "oszlop2"',
      [new ValueTaskField(0, 0, 'oszlop1'), new ValueTaskField(1, 0, 'oszlop2')]),
    new Task('Színezd mindkét cella hátterét zöldre!',
      [new FormatTaskField(0, 0, {backgroundColor: new Color(0, 1, 0)}), new FormatTaskField(1, 0, {backgroundColor: new Color(0, 1, 0)})]),
    new Task('Írj egy 1-est az A2 cellába, és egy 2-est a B2 cellába!', [new ValueTaskField(0, 1, '1'), new ValueTaskField(1, 1, '2')]),
    new Task('Számítsd ki az A1 és a B1 cella értékét a C2-es cellába!', [new FormulaTaskField(2, 1, ['=A1+B1', '=B1+A1'])])
  ]);
  activeTask: Task = null;
  finishedTasks: Task[] = [];
  index = 0;

  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
  }

  @HostListener('window:sheets-api-loaded', ['$event'])
  sheetsAPILoaded(event) {
   console.log('loaded');
    this.gapi = window['gapi'];
    this.loader.gapi = this.gapi;
    // Listen for sign-in state changes.
    this.gapi.auth2.getAuthInstance().isSignedIn.listen(status => this.updateSigninStatus(status));

    // Handle the initial sign-in state.
    this.updateSigninStatus(this.gapi.auth2.getAuthInstance().isSignedIn.get());

  }

  updateSigninStatus(isSignedIn) {
    const self = this;
    if (isSignedIn) {
      console.log('signed in!');
      self._spreadsheetId = localStorage.getItem('spreadsheetId');
      console.log('spreadsheetId: ' + self._spreadsheetId);
      if (!self._spreadsheetId) {
        this.gapi.client.sheets.spreadsheets.create({
          'properties': {'title': this.section.title}
        }).then(function (response) {
          console.log(response);
          self._spreadsheetId = response.result.spreadsheetId;
          localStorage.setItem('spreadsheetId', self._spreadsheetId);
          self.checkTask();
          self.cdr.detectChanges();
        });
      } else {
        this.checkTask();
      }
    } else {
      this.gapi.auth2.getAuthInstance().signIn();
    }
  }

  checkTask() {
    if (this.activeTask) {
      this.activeTask.attempted = true;
    }
    this.loader.onLoaded = (sheets) => this.checkTasks(sheets);
    this.loader.load(this._spreadsheetId);
  }

  checkTasks(sheet: Sheet) {
    console.log('checkTasks');
    this.finishedTasks = [];
    this.activeTask = null;
    for (const t of this.section.tasks) {
      console.log('checking');
      console.log(t);
      if (!t.check(sheet)) {
        console.log('found');
        this.activeTask = t;
        break;
      } else {
        console.log('ok');
        this.finishedTasks.unshift(t);
      }
    }
    this.cdr.detectChanges();
  }


  private nextTask() {
    this.finishedTasks.unshift(this.activeTask);
    if (this.index === this.section.tasks.length - 1) {
      this.activeTask = null;
    } else {
      this.index += 1;
      this.activeTask = this.section.tasks[this.index];
    }
  }

  sheetURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/spreadsheets/d/' +
      this._spreadsheetId + '/edit?rm=embedded#gid=0');
  }
}

class Section {
  constructor(public title: string, public description: string, public tasks: Task[]) {

  }
}

class Task {
  attempted = false;
  get errorMessage(): string {
    let result = '';
    for (const field of this.fields) {
      for (const hint of field.hints) {
        if (result.length > 0) {
          result += '\n';
        }
        result += hint;
      }
    }
    return result;
  }

  constructor(public description: string, public fields: TaskField[]) {
  }

  check(sheet: Sheet): boolean {
    for (const field of this.fields) {
      if (!field.check(sheet.getField(field))) {
        return false;
      }
    }
    return true;
  }
}

class Hint {
  constructor(public field: TaskField, public expected: any, public actual: any, public type: string) {

  }

  public toString(): string {
    let result = `Az ${this.field} cellába a következő ${this.type} kell megadni: ${this.expected}.`;
    if (this.actual) {
      result += `Most ez van benne: ${this.actual}`;
    }
    return result;
  }
}

abstract class TaskField {
  hints: Hint[] = [];

  constructor(public column: number, public row: number) {
  }

  abstract check(field: Field): boolean;


  public toString() {
    return String.fromCharCode('A'.charCodeAt(0) + this.column) + this.row;
  }
}

class ValueTaskField extends TaskField {

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

class FormulaTaskField extends TaskField {

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


class FormatTaskField extends TaskField {

  constructor(public column: number, public row: number, public format: Format) {
    super(column, row);
  }

  private static colorDistance(color1: Color, color2: Color) {
    function sqr(x: number) { return x * x; }
    return Math.sqrt(sqr(color1.red - color2.red)
      + sqr(color1.green - color2.green)
      + sqr(color1.blue - color2.blue));
  }

  check(field: Field): boolean {
    this.hints = [];
    if (field) {
      const actualBG = field.format.backgroundColor;
      const expectedBG = this.format.backgroundColor;
      if (expectedBG && FormatTaskField.colorDistance(actualBG, expectedBG) > 0.5) {
        this.hints.push(new Hint(this, expectedBG, actualBG, 'háttérszínt'));
        return false;
      }
      const actualFG = field.format.backgroundColor;
      const expectedFG = this.format.backgroundColor;
      if (expectedFG && FormatTaskField.colorDistance(actualFG, expectedFG) > 0.5) {
        this.hints.push(new Hint(this, expectedFG, actualFG, 'szövegszínt'));
        return false;
      }
      return true;
    }
    return false;
  }
}

class Color {
  constructor(public red: number, public green: number, public blue: number) {

  }

  public toString = (): string => {
    return `(r: ${this.red}, g: ${this.green}, b: ${this.blue})`;
  }
}

class Format {
  backgroundColor?: Color = null;
  foregroundColor?: Color = null;
  bold?: boolean = null;
  italic?: boolean = null;
  underline?: boolean = null;
  strikethrough?: boolean = null;
}

class Field {
  value: string;
  formula: string;
  format: Format;
}

class Sheet {
  fields: Field[][] = [];


  getField(field: TaskField): Field {
    if (this.fields) {
      const row = this.fields[field.row];
      if (row) {
        return row[field.column];
      }
    }
  }

}

class SheetLoader {
  gapi: any = null;
  onLoaded: (sheet: Sheet) => void;

  private static parseFormula(cell): string {
    const userEnteredValue = cell.userEnteredValue;
    if (userEnteredValue) {
      return userEnteredValue.stringValue
        || cell.userEnteredValue.formulaValue
        || String(userEnteredValue.numberValue)
        || '';
    }
    return '';
  }


  private static parseFormat(effectiveFormat: any) {
    const format = new Format;
    if (effectiveFormat) {
      const bgcolor = effectiveFormat.backgroundColor;
      format.backgroundColor = new Color(bgcolor.red || 0, bgcolor.green || 0, bgcolor.blue || 0);
      const fgcolor = effectiveFormat.textFormat.foregroundColor;
      format.foregroundColor = new Color(fgcolor.red || 0, fgcolor.green || 0, fgcolor.blue || 0);
      format.bold = effectiveFormat.textFormat.bold;
      format.italic = effectiveFormat.textFormat.italic;
      format.underline = effectiveFormat.textFormat.underline;
      format.strikethrough = effectiveFormat.textFormat.strikethrough;
    }
    return format;
  }
  load(spreadsheetId: string) {
    const sheet = new Sheet();
    const self = this;

    this.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      ranges: ['Sheet1!A1:E10'],
      includeGridData: true
    }).then(function (response) {
      console.log(response.result.sheets[0].data[0].rowData);
      for (const data of response.result.sheets[0].data[0].rowData) {
        const row: Field[] = [];
        if (data.values) {
          for (const cell of data.values) {
            const field = new Field();
            field.value = cell.formattedValue || '';
            field.formula = SheetLoader.parseFormula(cell);
            field.format = SheetLoader.parseFormat(cell.effectiveFormat);
            row.push(field);
          }
        }
        sheet.fields.push(row);
      }
      console.log(sheet);
      self.onLoaded(sheet);
    }, function (response) {
      console.log(response.result.error.message);
    });
  }

}
