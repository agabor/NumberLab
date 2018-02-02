import {ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import {Sheet} from './model/sheet';
import {Section} from './model/section';
import {Task} from './model/task';
import {SheetLoader} from './loader';
import {FormatTaskField, ValueTaskField, FormulaTaskField} from './model/taskfield';
import {Color} from './model/color';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  loaded = false;
  hintsShown = false;
  private _spreadsheetId = null;
  gapi: any = null;
  loader: SheetLoader = new SheetLoader;
  section: Section;
  activeTask: Task = null;
  finishedTasks: Task[] = [];
  index = 0;

  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.section = new Section('Alapok', 'Most megtanuljuk az alapokat', [
      new Task('Írd az A1-es cellába hogy "oszlop1" és a B1-es cellába hogy "oszlop2"',
        [new ValueTaskField(0, 0, 'oszlop1'), new ValueTaskField(1, 0, 'oszlop2')]),
      new Task('Színezd az A1 cella hátterét [zöldre] és a B1 cella hátterét [kékre]!',
        [new FormatTaskField(0, 0, {backgroundColor: new Color(0, 1, 0)}),
          new FormatTaskField(1, 0, {backgroundColor: new Color(0, 0, 1)})],
        sanitizer),
      new Task('Írj egy 1-est az A2 cellába, és egy 2-est a B2 cellába!', [new ValueTaskField(0, 1, '1'), new ValueTaskField(1, 1, '2')]),
      new Task('Számítsd ki az A1 és a B1 cella értékét a C2-es cellába!', [new FormulaTaskField(2, 1, ['=A1+B1', '=B1+A1'])])
    ]);
  }

  showHints() {
    this.hintsShown = true;
    this.cdr.detectChanges();
  }

  @HostListener('window:sheets-api-loaded', ['$event'])
  sheetsAPILoaded(event) {
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
      self._spreadsheetId = localStorage.getItem('spreadsheetId');
      if (!self._spreadsheetId) {
        this.gapi.client.sheets.spreadsheets.create({
          'properties': {'title': this.section.title}
        }).then(function (response) {
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
    this.finishedTasks = [];
    this.activeTask = null;
    for (const t of this.section.tasks) {
      if (!t.check(sheet)) {
        this.activeTask = t;
        break;
      } else {
        t.attempted = true;
        this.finishedTasks.unshift(t);
      }
    }
    this.cdr.detectChanges();
  }


  private nextTask() {
    this.hintsShown = false;
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
