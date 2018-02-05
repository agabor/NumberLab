import {ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import {Sheet} from './model/sheet';
import {Section} from './model/section';
import {Task} from './model/task';
import {SheetLoader} from './loader';
import {Color} from './model/color';
import {ValueTaskField} from './model/valuetaskfield';
import {FormatTaskField} from './model/formattaskfield';
import {FormulaTaskField} from './model/formulataskfield';

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
      ['Megyék', 'Alma', 'Körte', 'Cseresznye', 'Meggy', 'Szilva', 'Kajszi', 'Õszibarack'],
      ['Pest', 25066, 659, 1026, 3951, 4470, 4212, 8748],
      ['Fejér', 4932, 706, 857, 2208, 2245, 2335, 5350],
      ['Komárom-Esztergom', 1345, 87, 152, 190, 453, 560, 536],
      ['Veszprém', 6060, 310, 441, 3198, 289, 367, 278],
      ['Gyõr-Moson-Sopron', 7024, 1077, 574, 1146, 1805, 745, 308],
      ['Vas', 8700, 502, 85, 288, 348, 22, 5],
      ['Zala', 31479, 5500, 123, 70, 382, 22, 101],
      ['Baranya', 1822, 174, 134, 1148, 1082, 336, 1510],
      ['Somogy', 9438, 853, 430, 1756, 928, 1114, 3220],
      ['Tolna', 2832, 420, 489, 555, 522, 1659, 2061],
      ['Borsod-Abaúj-Zemplén', 28105, 2510, 312, 1864, 4658, 11059, 549],
      ['Heves', 6290, 479, 359, 2644, 1310, 1601, 1902],
      ['Nógrád', 2800, 245, 130, 400, 580, 120, 69],
      ['Hajdú-Bihar', 25400, 750, 187, 2434, 2684, 349, 796],
      ['Jász-Nagykun-Szolnok', 116, 376, 451, 1020, 1276, 158, 214],
      ['Szabolcs-Szatmár-Bereg', 286000, 1100, 340, 16870, 11000, 155, 1215],
      ['Bács-Kiskun', 50174, 1970, 332, 6314, 4365, 5100, 2343],
      ['Békés', 1106, 356, 420, 676, 5110, 20, 140],
      ['Csongrád', 4516, 226, 86, 1400, 1539, 411, 1582]], [
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
        this.section.create(this.gapi, function (id: string) {
          self._spreadsheetId = id;
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
