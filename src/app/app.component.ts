import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Sheet} from './model/sheet';
import {Section} from './model/section';
import {Task} from './model/task';
import {SheetLoader} from './loader';
import {Color} from './model/color';
import {ValueSubTask} from './model/valuesubtask';
import {DisplayTaskField} from './model/displaytaskfield';
import {FormulaSubTask} from './model/formulasubtask';
import {FormatSubTask} from './model/formatsubtask';
import {Range} from './model/range';
import {Formula} from './model/formula';
import {SortedNumberColumn} from './model/sortedcolumn';
import {Matrix} from './model/matrix';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {


  hintsShown = false;
  loader: SheetLoader = new SheetLoader;
  section: Section;
  activeTask: Task = null;
  finishedTasks: Task[] = [];

  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    const data = new Matrix([
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
      ['Csongrád', 4516, 226, 86, 1400, 1539, 411, 1582]]);
    const numeric_data = data.sub(1, 1, 7, 19);
    const megyek = data.sub(0, 0, 0, 19);
    this.section = new Section('INFORMATIKA KÖZÉPSZINTŰ GYAKORLATI VIZSGA 2005', '', data, [
        new Task('A gyümölcsök termésmennyisége tonnában van megadva. Állítson be ezekre az értékekre ' +
      'ezres tagolású számformátumot, a számok után a „t” jelöléssel.', [
        new ValueSubTask(new Range(0, 0, 7, 19), data), new FormatSubTask(new Range(1, 1, 7, 19), '# ##0 t')]),
      new Task('Az első és második oszlop közé szúrjon be egy oszlopot. Az oszlop első sorába írja be az ' +
        '„Összes gyümölcstermés” szöveget! ',
        [new ValueSubTask(new Range(0, 0, 0, 19), megyek),
          new ValueSubTask(new Range(2, 1, 8, 19), numeric_data),
          new FormatSubTask(new Range(2, 2, 8, 19), '# ##0 t'),
          new ValueSubTask(new Range(1, 0), new Matrix([['Összes gyümölcstermés']]))]),
      new Task('Számítsa ki – függvény segítségével – a létrehozott oszlopba, a megyében termelt gyümölcsök mennyiségét!',
        [new ValueSubTask(new Range(0, 0, 0, 19), megyek),
          new ValueSubTask(new Range(2, 1, 8, 19), numeric_data),
          new FormatSubTask(new Range(2, 2, 8, 19), '# ##0 t'),
          new FormulaSubTask(new Range(1, 1, 1, 19), [new Formula(['=SUM(', new Range(1, 0, 7, 0), ')'])])]),
      new Task('A megyék után, egy sort hagyjon üresen, s a következő sorban számítsa ki – függvény segítségével – azt, ' +
        'hogy az egyes gyümölcsökből mennyi termett az országban összesen!',
        [new FormulaSubTask(new Range(1, 21, 8, 21), [new Formula(['=SUM(', new Range(0, -20, 0, -2), ')'])])]),
      new Task('Rendezze a megyéket az összes gyümölcstermés mennyisége szerinti csökkenő sorrendbe! ',
        [new SortedNumberColumn(new Range(1, 1, 1, 19), false),
          new ValueSubTask(new Range(0, 1, 1, 19), new Matrix([['Szabolcs-Szatmár-Bereg', 316680],
            ['Bács-Kiskun', 70598],
            ['Borsod-Abaúj-Zemplén', 49057],
            ['Pest', 48132],
            ['Zala', 37677],
            ['Hajdú-Bihar', 32600],
            ['Fejér', 18633],
            ['Somogy', 17739],
            ['Heves', 14585],
            ['Gyõr-Moson-Sopron', 12679],
            ['Veszprém', 10943],
            ['Vas', 9950],
            ['Csongrád', 9760],
            ['Tolna', 8538],
            ['Békés', 7828],
            ['Baranya', 6206],
            ['Nógrád', 4344],
            ['Jász-Nagykun-Szolnok', 3611],
            ['Komárom-Esztergom', 3323]]))]),
      new Task('Szúrjon be egy oszlopot az „Alma” oszlop elé! Az oszlop első sorába írja be a „Százalékos megoszlás” szöveget!',
        [new ValueSubTask(new Range(2, 0), new Matrix([['Százalékos megoszlás']]))],
        sanitizer),
      new Task('A beszúrt oszlopban – függvény segítségével kiszámítva – jelenítse meg, hogy az országban termett gyümölcsmennyiség' +
        'hány százalékát termelik az egyes megyék! A kiszámított értékeket százalék formátumban két tizedes jeggyel adja meg!',
        [new FormulaSubTask(new Range(2, 1, 2, 19), [new Formula(['=', new Range(-1, 0), '/B22'])]),
          new FormatSubTask(new Range(2, 1, 2, 19), '0.00%')],
        sanitizer),
      new Task('Színezd az A1 cella hátterét [zöldre] és a B1 cella hátterét [kékre]!',
        [new DisplayTaskField(new Range(0, 0), {backgroundColor: new Color(0, 1, 0)}),
          new DisplayTaskField(new Range(1, 0), {backgroundColor: new Color(0, 0, 1)})],
        sanitizer)
    ]);

    if (!AppComponent.TaskIndex) {
      AppComponent.TaskIndex = 0;
    }
  }

  /**
   *  On load, called to load the auth2 library and API client library.
   */
  handleClientLoad() {
    const self = this;
    console.log('handleClientLoad');
    gapi.load('client:auth2', function() {
      self.initClient();
    });
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    const self = this;
    // Client ID and API key from the Developer Console
    const CLIENT_ID = '8401109384-9vgun9cicdbbnasprfeeta92sq3k5vbm.apps.googleusercontent.com';
    const API_KEY = 'AIzaSyC4zMvcnbjNbbyfKgIw1Y2rvlIP_UKdl-4';

    // Array of API discovery doc URLs for APIs used by the quickstart
    const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
    console.log('initClient');
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      console.log('loaded');
      // Listen for sign-in state changes.
      const authInstance = gapi.auth2.getAuthInstance();
      console.log(authInstance);
      authInstance.isSignedIn.listen(status => self.updateSigninStatus(status));

      // Handle the initial sign-in state.
      self.updateSigninStatus(authInstance.isSignedIn.get());
    });
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
  ngOnInit() {
    console.log(gapi);
    this.handleClientLoad();

  }

  updateSigninStatus(isSignedIn) {
    const self = this;
    if (isSignedIn) {
      if (!AppComponent.SpreadsheetID) {
        this.section.create(gapi, function (id: string) {
          AppComponent.SpreadsheetID = id;
          self.setTasks();
          self.cdr.detectChanges();
        });
      } else {
        this.setTasks();
      }
    } else {
      gapi.auth2.getAuthInstance().signIn();
    }
  }

  private setTasks() {
    console.log('setTasks');
    this.finishedTasks = [];
    for (let i = 0; i < AppComponent.TaskIndex; ++i) {
      this.finishedTasks.push(this.section.tasks[i]);
    }
    this.activeTask = this.section.tasks[AppComponent.TaskIndex];
    this.cdr.detectChanges();
  }

  checkTask() {
    if (this.activeTask) {
      this.activeTask.attempted = true;
    }
    this.loader.onLoaded = (sheets) => this.checkTasks(sheets);
    this.loader.load(AppComponent.SpreadsheetID);
  }

  checkTasks(sheet: Sheet) {
    console.log('checkTasks');
    this.activeTask.attempted = true;
    if (this.activeTask.check(sheet)) {
      this.nextTask();
    }
    this.cdr.detectChanges();
  }


  private nextTask() {
    this.hintsShown = false;
    this.finishedTasks.unshift(this.activeTask);
    if (AppComponent.TaskIndex === this.section.tasks.length - 1) {
      this.activeTask = null;
    } else {
      AppComponent.TaskIndex += 1;
      this.activeTask = this.section.tasks[AppComponent.TaskIndex];
    }
  }

  sheetURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/spreadsheets/d/' +
      AppComponent.SpreadsheetID + '/edit?rm=embedded#gid=0');
  }
}
