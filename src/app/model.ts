
export class TotalCases {

  totalConfirmed: number = null;
  totalRecovered: number = null;
  totalDeath: number = null;
  totalConfirmedNew: number = null;
  totalRecoveredNew: number = null;
  totalDeathNew: number = null;

}

export class ResponseData {
  regionName: string = null;
  confirmed: number = null;
  deathsPercentage: number = null;
  recovered: number = null;
  recoveredPercentage: number = null;
  activeCase: number = null;
  deaths: number = null;
  selectedCountry: boolean = null;
  constructor(dataList?: DataList) {
    Object.assign(this, dataList);
  }
}

export class DataList {

  public mergeData = (data: Array<any>) => {
    let result = [];
    const recoveredData = <Array<any>>data.filter((x) => x.name === 'recovered')[0].data;
    data.forEach((y) => {
      if (y.name === 'confirmed') {
        y.data.forEach((x, index) => {
          result = [...result, { regionName: `${x["Country/Region"]} ${x["Province/State"]}` }];
          result[index][y.name] = Math.ceil(+x[Object.keys(x)[Object.keys(x).length - 1]]);
        });
      }
      if (y.name === 'deaths') {
        y.data.forEach((x, index) => {
          result[index][y.name] = Math.ceil(+x[Object.keys(x)[Object.keys(x).length - 1]]);
        });
      }
    });
    result.forEach((item: ResponseData) => {
      const filterRecoveredData = recoveredData.filter((x) =>
        item.regionName === `${x["Country/Region"]} ${x["Province/State"]}`)[0] || null;
      item.recovered = filterRecoveredData ?
        Math.ceil(+filterRecoveredData[Object.keys(filterRecoveredData)[Object.keys(filterRecoveredData).length - 1]])
        : 0;
    });
    return result;
  }
  public csv2Array = (csv) => {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) {
        continue;
      }
      const obj = {};
      const currentLine = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }
      result.push(obj);
    }
    return result;
  }

  public readCSVFile = async (data) => {
    return new Promise((res) => {
      const blb = new Blob([data], { type: "text/plain" });
      const reader = new FileReader();
      reader.addEventListener('loadend', (e: any) => {
        res(this.csv2Array(e.srcElement.result));
      });
      reader.readAsText(blb);
    });
  }

  getGraphData(data) {
    let result = [];
    const keys = Object.keys(data[0]);
    keys.splice(0, 4);
    for (const key of keys) {
      const obj = { key, value: null };
      let total = 0;
      data.forEach((x) => {
        total = +total + +x[key];
      });
      obj.value = total;
      result = [...result, obj];
    }
    return result;
  }
}
