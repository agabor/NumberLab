import {ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import {Sheet} from './model/sheet';
import {Section} from './model/section';
import {Task} from './model/task';
import {SheetLoader} from './loader';
import {Color} from './model/color';
import {ValueTaskField} from './model/valuetaskfield';
import {DisplayTaskField} from './model/displaytaskfield';
import {FormulaTaskField} from './model/formulataskfield';
import {FormatTaskRange} from './model/formattaskrange';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  loaded = false;
  hintsShown = false;
  gapi: any = null;
  loader: SheetLoader = new SheetLoader;
  section: Section;
  activeTask: Task = null;
  finishedTasks: Task[] = [];
  index = 0;

  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.section = new Section('INFORMATIKA KÖZÉPSZINTŰ GYAKORLATI VIZSGA 2005', '', [
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
        new Task('A gyümölcsök termésmennyisége tonnában van megadva. Állítson be ezekre az értékekre ' +
      'ezres tagolású számformátumot, a számok után a „t” jelöléssel.', [new FormatTaskRange(1, 1, 7, 19, '# ##0 t')]),
      new Task('Az első és második oszlop közé szúrjon be egy oszlopot. Az oszlop első sorába írja be az ' +
        '„Összes gyümölcstermés” szöveget! ',
        [new ValueTaskField(1, 0, 'Összes gyümölcstermés'), new FormatTaskRange(1, 1, 7, 19, '# ##0 t')]),
      new Task('Színezd az A1 cella hátterét [zöldre] és a B1 cella hátterét [kékre]!',
        [new DisplayTaskField(0, 0, {backgroundColor: new Color(0, 1, 0)}),
          new DisplayTaskField(1, 0, {backgroundColor: new Color(0, 0, 1)})],
        sanitizer),
      new Task('Írj egy 1-est az A2 cellába, és egy 2-est a B2 cellába!', [new ValueTaskField(0, 1, '1'), new ValueTaskField(1, 1, '2')]),
      new Task('Számítsd ki az A1 és a B1 cella értékét a C2-es cellába!', [new FormulaTaskField(2, 1, ['=A1+B1', '=B1+A1'])])
    ]);

    if (!AppComponent.TaskIndex) {
      AppComponent.TaskIndex = 0;
    }
  }


  get SpreadsheetID(): string {
    return AppComponent.SpreadsheetID;
  }


  static get SpreadsheetID(): string {
    return localStorage.getItem('spreadsheetId');
  }


  static set SpreadsheetID(value: string) {
    localStorage.setItem('spreadsheetId', value);
  }


  static get TaskIndex(): number {
    return +localStorage.getItem('taskidx');
  }


  static set TaskIndex(value: number) {
    localStorage.setItem('taskidx', value.toString());
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
      if (!AppComponent.SpreadsheetID) {
        this.section.create(this.gapi, function (id: string) {
          AppComponent.SpreadsheetID = id;
          self.setTasks();
          self.cdr.detectChanges();
        });
      } else {
        this.setTasks();
      }
    } else {
      this.gapi.auth2.getAuthInstance().signIn();
    }
  }

  private setTasks() {
    this.finishedTasks = [];
    for (let i = 0; i < AppComponent.TaskIndex; ++i) {
      this.finishedTasks.push(this.section.tasks[i]);
    }
    this.activeTask = this.section.tasks[AppComponent.TaskIndex];
  }

  checkTask() {
    if (this.activeTask) {
      this.activeTask.attempted = true;
    }
    this.loader.onLoaded = (sheets) => this.checkTasks(sheets);
    this.loader.load(AppComponent.SpreadsheetID);
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
      AppComponent.SpreadsheetID + '/edit?rm=embedded#gid=0');
  }
}
