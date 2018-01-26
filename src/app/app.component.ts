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
    new Task('Írj egy 1-est az A1 cellába, és egy 2-est a B1 cellába!', [new ValueTaskField(0, 0, '1'), new ValueTaskField(1, 0, '2')]),
    new Task('Számítsd ki az A1 és a B1 cella értékét a C1-es cellába!', [new FormulaTaskField(2, 0, ['=A1+B1', '=B1+A1'])])
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
  valueOk = false;
  formulaOk = false;
  get errorMessage(): string {
    let result = '';
    for (const field of this.fields) {
      if (field.errorMessage) {
        if (result.length > 0) {
          result += '\n';
        }
        result += field.errorMessage;
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

abstract class TaskField {
  errorMessage: string = null;

  constructor(public column: number, public row: number) {
  }

  abstract check(field: Field): boolean;
}

class ValueTaskField extends TaskField {

  constructor(public column: number, public row: number, public value: string) {
    super(column, row);
  }


  check(field: Field): boolean {
    if (this.value !== field.value) {
      this.errorMessage = '(' + this.column + ', ' + this.row + ') expected value: ' + this.value + ' actual: ' + field.value;
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
    let formula = field.formula;
    formula = formula.replace(/ /g, '');
    for (const f of this.formulas) {
      if (f === formula) {
        return true;
      }
    }
    this.errorMessage = '(' + this.column + ', ' + this.row + ') expected formula: ' + this.formulas + ' actual: ' + field.formula;
    return false;
  }

}

class Color {
  constructor(red: number, green: number, blue: number) {

  }
}

class Field {
  value: string;
  formula: string;
  backgroundColor: Color;
  foregroundColor: Color;
  bold: boolean;
  italic: boolean;
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
            const userEnteredValue = cell.userEnteredValue;
            if (userEnteredValue) {
              field.formula = userEnteredValue.stringValue
                || cell.userEnteredValue.formulaValue
                || String(userEnteredValue.numberValue)
                || '';
            } else {
              field.formula = '';
            }
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
