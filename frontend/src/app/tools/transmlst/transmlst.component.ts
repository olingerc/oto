import { Component, ViewEncapsulation } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'my-transmlst',
  templateUrl: './transmlst.component.html',
  styleUrls: ['./transmlst.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransmlstComponent {
  public textareaContent: string;
  private output: string;
  public example: string;
  public tableData: Object;
  public groups: string[];
  public forDisplay: any = {};

  static transform(input): Object {
    const tableData = {};
    const bySample: any = {};
    const typhi = ['STTR9', 'STTR5', 'STTR6', 'STTR10', 'STTR3'];
    const enti = ['SENTR7', 'SENTR5', 'SENTR6', 'SENTR4', 'SE-3'];

    let alleleNames = [];
    let group = 'Scheme not recognized';

    // Check for correct input
    if (input === '' || !input) {
      console.log('NO INPUT');
      return null;
    }
    if (input.substring(0, 11) !== 'Sample Name') {
      return null;
    }

    // Collect sample and alleles
    let splitted = null;
    let sampleName = null;
    input.split('\n').forEach(function(line) {
      splitted = line.split('\t');
      sampleName = splitted[0].replace('-6', '');
      if (!bySample[sampleName]) {
        bySample[sampleName] = {};
      }
      bySample[sampleName][splitted[1]] = splitted[2];
      delete bySample['Sample Name'];
    });

    // Build output string
    Object.keys(bySample).forEach(sampleNameKey => {
      if (!sampleNameKey || sampleNameKey === '') {
        return;
      }

      let alleles = bySample[sampleNameKey];

      // Select serotype
      if (alleles.hasOwnProperty('STTR9')) {
        group = 'MLVA Typhimurium';
        alleleNames = typhi;
      }
      if (alleles.hasOwnProperty('SENTR7')) {
        group = 'MLVA Enteritidis';
        alleleNames = enti;
      }

      // Prepare tabledata
      if (!tableData[group]) {
        tableData[group] = {};
      }

      if (!tableData[group][sampleNameKey]) {
        tableData[group][sampleNameKey] = '';
      }

      alleleNames.forEach(function(allele) {
        let value;
        if (!alleles[allele] || alleles[allele] === '') {
          value = 'CHECK';
        } else {
          value = alleles[allele];
        }
        tableData[group][sampleNameKey] += value + '-';
      });
      // outputTyphi = outputTyphi.substring(0, outputTyphi.length -1) + "\n";
      // outputEnti = outputEnti.substring(0, outputEnti.length -1) + "\n";
    });

    return tableData;
  }

  constructor() {
    this.textareaContent = '';
    this.output = '';
    this.example = `Sample Name\tMarker\tAllele 1
      SSI14\tSTTR9\t2
      SSI14\tSTTR5\t7
      SSI14\tSTTR3\t3
      SSI14\tSTTR10\t26
      SSI14-6\tSTTR6\t10
      14054516\tSTTR9\t2
      14054516\tSTTR5\t5
      14054516\tSTTR3\t2
      14054516\tSTTR10
      14054516-6\tSTTR6\t20
      14056132\tSTTR9\t2
      14056132\tSTTR5\t7
      14056132\tSTTR3\t2
      14056132\tSTTR10
      14056132-6\tSTTR6\t5
      14057461\tSTTR9\t2
      14057461\tSTTR5\t6
      14057461\tSTTR3\t2
      14057461\tSTTR10
      14057461-6\tSTTR6\t6
      14057679\tSTTR9\t1
      14057679\tSTTR5\t6
      14057679\tSTTR3\t3
      14057679\tSTTR10\t?
      14057679-6\tSTTR6\t5`;
  }

  inputChanged(event): void {
    this.textareaContent = event;
    this.tableData = TransmlstComponent.transform(this.textareaContent);

    _.each(this.tableData, (data1, group) => {
      if (!this.forDisplay[group]) {
        this.forDisplay[group] = [];
      }
      _.each(data1, (data2, key) => {
        this.forDisplay[group].push({data2, key});
      });
    });

    if (this.tableData) {
      this.groups = Object.keys(this.tableData);
    } else {
      this.groups = null;
    }
  }
}
