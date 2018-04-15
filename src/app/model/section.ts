import {Task} from './task';
import {isNumber} from 'util';
import {Matrix} from './matrix';

export class Section {
  constructor(public title: string, public description: string, private values: Matrix, public tasks: Task[]) {

  }

  public create(gapi: any, callback: (id: string) => void) {
    const self = this;
    let spreadsheetId = '';
    gapi.client.sheets.spreadsheets.create({
      'properties': {'title': this.title}
    }).then(function (response) {
      spreadsheetId = response.result.spreadsheetId;
      self.initData(spreadsheetId, gapi, callback);
    });
  }

  private initData(spreadsheetId: string, gapi: any, callback: (id: string) => void) {
    gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requests: [{
        'updateCells': {
          'start': {
            'sheetId': 0,
            'rowIndex': 0,
            'columnIndex': 0
          },
          'rows': this.getData(),
          'fields': 'userEnteredValue,userEnteredFormat.backgroundColor'
        }
      }],
    }).then(function (r) {
        console.log(r);
        callback(spreadsheetId);
      }
    );
  }

  private getData(): object[] {
    const data = [];
    for (const row of this.values.data) {
      const rowData = {'values': []};
      for (const value of row) {
        if (isNumber(value)) {
          rowData.values.push({'userEnteredValue': {'numberValue': value}});
        } else {
          rowData.values.push({'userEnteredValue': {'stringValue': value}});
        }
      }
      data.push(rowData);
    }
    return data;
  }
}

