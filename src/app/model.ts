
export class ResponseData {
  regionName: string = null;
  confirmed: number = null;
  percentage: number = null;
  deaths: number = null;
  selectedCountry: boolean = null;
  constructor(dataList?: DataList) {
    Object.assign(this, dataList);
  }
}

export class DataList {

  public mergeData = (data: any) => {
    let result = [];
    const data1 = data[0];
    if (data1.name === 'confirmed') {
      data1.data.forEach((x, index) => {
        result = [...result, { regionName: `${x["Country/Region"]} ${x["Province/State"]}` }];
        result[index][data1.name] = +x[Object.keys(x)[Object.keys(x).length - 1]];
      });
    }
    const data3 = data[1];
    if (data3.name === 'deaths') {
      data3.data.forEach((x, index) => {
        result[index][data3.name] = +x[Object.keys(x)[Object.keys(x).length - 1]];

      });
    }
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
