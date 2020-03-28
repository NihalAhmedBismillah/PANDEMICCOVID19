
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
      if (y.name === 'recovered') {
        y.data.forEach((x, index) => {
          result[index][y.name] = Math.ceil(+x[Object.keys(x)[Object.keys(x).length - 1]]);
        });
      }
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

  getGraphData(data: Array<any>, countryList: Array<any>) {
    let uniqueData = [];
    countryList.forEach((x) => {
      data.forEach((y) => {
        const yRegionName = `${y["Country/Region"]} ${y["Province/State"]}`;
        if (x.regionName === yRegionName) {
          uniqueData = [...uniqueData, JSON.parse(JSON.stringify(y))];
        }
      });
    });
    let result = [];
    const keys = Object.keys(uniqueData[0]);
    keys.splice(0, 4);
    for (const key of keys) {
      const obj = { key, value: null };
      let total = 0;
      uniqueData.forEach((x) => {
        total = +total + +x[key];
      });
      obj.value = Math.ceil(total);
      result = [...result, obj];
    }
    return result;
  }
}
