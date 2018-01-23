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
    new Task('Írj egy 1-est az A1 cellába, és egy 2-est a B1 cellába!', [new Field(0, 0, '1', ['1']), new Field(1, 0, '2', ['2'])]),
    new Task('Számítsd ki az A1 és a B1 cella értékét a C1-es cellába!', [new Field(2, 0, '3', ['=A1+B1', '=B1+A1'])])
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
    this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

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
          this.checkTask();
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
      this._spreadsheetId + '/edit?rm=minimal#gid=0');
  }
}

class Section {
  constructor(public title: string, public description: string, public tasks: Task[]) {

  }
}

class Task {
  valueOk = false;
  formulaOk = false;
  errorMessage: string = null;

  constructor(public description: string, public fields: Field[]) {
  }

  check(sheet: Sheet): boolean {
    console.log('checking task');
    this.valueOk = this.checkValues(sheet);
    this.formulaOk = this.checkFormulas(sheet);
    return this.valueOk && this.formulaOk;
  }

  checkValues(sheet: Sheet): boolean {
      for (const field of this.fields) {
        const value = String(sheet.getValue(field.column, field.row));
        if (value !== field.value) {
          this.errorMessage = 'Hiba!';
          return false;
        }
      }
      return true;
  }

  checkFormulas(sheet: Sheet): boolean {
    for (const field of this.fields) {
      const formula = String(sheet.getFormula(field.column, field.row));
      if (!field.checkFormula(formula)) {
        if (formula === field.value) {
          this.errorMessage = 'Próbáld meg képlettel megoldani!';
        } else {
          this.errorMessage = 'Hiba!';
        }
        return false;
      }
    }
    return true;
  }
}

class Field {
  constructor(public column: number, public row: number, public value: string, public formulas: string[]) {
  }

  public checkFormula(formula: string) {
    formula = formula.replace(/ /g, '');
    for (const f of this.formulas) {
      if (f === formula) {
        return true;
      }
    }
    return false;
  }
}

class Sheet {
  values: string[][];
  formulas: string[][];
  getValue(column: number, row: number): string {
    if (this.values) {
      return this.values[row][column];
    }
  }
  getFormula(column: number, row: number): string {
    if (this.values) {
      return this.formulas[row][column];
    }
  }
}

class SheetLoader {
  gapi: any = null;
  onLoaded: (sheet: Sheet) => void;

  load(spreadsheetId: string) {
    const sheet = new Sheet();
    const self = this;

    let valuesLoaded = false;
    let fromulasLoaded = false;

    this.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1:E10'
    }).then(function (response) {
      sheet.values = response.result.values;
      valuesLoaded = true;
      if (fromulasLoaded) {
        self.onLoaded(sheet);
      }
    }, function (response) {
      console.log(response.result.error.message);
    });
    this.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1:E10',
      valueRenderOption: 'FORMULA'
    }).then(function (response) {
      sheet.formulas = response.result.values;
      fromulasLoaded = true;
      if (valuesLoaded) {
        self.onLoaded(sheet);
      }
    }, function (response) {
      console.log(response.result.error.message);
    });
  }
}
