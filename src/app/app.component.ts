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
  section: Section = new Section('Alapok', 'Most megtanuljuk az alapokat', [
    new Task('Írj egy 1-est az A1 cellába, és egy 2-est a B1 cellába!', [new Field(0, 0, '1', '1'), new Field(1, 0, '2', '2')]),
    new Task('Számítsd ki az A1 és a B1 cella értékét a C1-es cellába!', [new Field(2, 0, '3', '=A1+B1')])
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
    console.log('checking');
    const self = this;
    let values: string[][] = null;
    let formulas: string[][] = null;
    this.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this._spreadsheetId,
      range: 'Sheet1!A1:E10'
    }).then(function (response) {
      console.log('got values');
      values = response.result.values;
      if (formulas) {
        self.checkTasks(values, formulas);
      }
    }, function (response) {
      console.log(response.result.error.message);
    });
    this.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this._spreadsheetId,
      range: 'Sheet1!A1:E10',
      valueRenderOption: 'FORMULA'
    }).then(function (response) {
      console.log('got formulas');
      formulas = response.result.values;
      if (values) {
        self.checkTasks(values, formulas);
      }
    }, function (response) {
      console.log(response.result.error.message);
    });
  }

  checkTasks(values: string[][], formulas: string[][]) {
    this.finishedTasks = [];
    for (const t of this.section.tasks) {
      if (!t.check(values, formulas)) {
        this.activeTask = t;
        return;
      } else {
        this.finishedTasks.unshift(t);
      }
    }
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

  check(values: string[][], formulas: string[][]): boolean {
    this.valueOk = this.checkValues(values);
    this.formulaOk = this.checkFormulas(formulas);
    return this.valueOk && this.formulaOk;
  }

  checkValues(values: string[][]): boolean {
      for (const field of this.fields) {
        const value = String(values[field.row][field.column]);
        if (value !== field.value) {
          this.errorMessage = 'Hiba!';
          return false;
        }
      }
      return true;
  }

  checkFormulas(values: string[][]): boolean {
    for (const field of this.fields) {
      const formula = String(values[field.row][field.column]);
      if (formula.replace(/ /g, '') !== field.formula) {
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
  constructor(public column: number, public row: number, public value: string, public formula: string) {
  }
}
