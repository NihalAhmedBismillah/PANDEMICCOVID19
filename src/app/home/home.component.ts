import { Component, OnInit } from '@angular/core';
import { HomeService } from '../service';
import { DataList, ResponseData } from '../model';
declare var CanvasJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  confirmedChart: any;
  deathChart: any;
  recoveryChart: any;
  dataList: DataList = new DataList();
  responseData: Array<ResponseData> = [];
  confirmGraphData = [];
  deathsGraphData = [];
  recoveryGraphData = [];
  allData = [];
  originalResponseData = [];
  confirmArrow = 'UP';
  percentageArrow = 'UP';
  deathsArrow = 'UP';
  activeArrow = 'UP';
  recoveredArrow = 'UP';
  recoveredPercentageArrow = 'UP';
  regionName = '';
  constructor(private homeService: HomeService) { }
  ngOnInit() {
    this.dataList = new DataList();
    this.recoveryGraphData = this.originalResponseData =
      this.deathsGraphData = this.confirmGraphData = this.responseData = this.allData = [];

    Promise.all([this.getConfirmedData(),
    this.getDeathsData(),
    this.getRecoveredData()
    ]).then((data) => {
      data.forEach((y) => {
        if (y.name === 'confirmed') {
          this.confirmGraphData = JSON.parse(JSON.stringify(y.data));
        }
        if (y.name === 'deaths') {
          this.deathsGraphData = JSON.parse(JSON.stringify(y.data));
        }
        if (y.name === 'recovered') {
          this.recoveryGraphData = JSON.parse(JSON.stringify(y.data));
        }
      });

      this.responseData = this.dataList.mergeData(data);
      const cloneData = this.responseData.filter((z) => +z.confirmed !== 0 || +z.deaths !== 0 || +z.recovered !== 0);
      this.responseData = JSON.parse(JSON.stringify(cloneData));
      this.responseData.forEach((x: ResponseData) => {
        x.recoveredPercentage = 0;
        x.deathsPercentage = 0;
        if (+x.deaths > 0 && +x.confirmed > 0) {
          x.deathsPercentage = +Number((x.deaths * 100) / x.confirmed).toFixed(2);
        }
        if (+x.recovered > 0 && +x.confirmed > 0) {
          x.recoveredPercentage = +Number((x.recovered * 100) / x.confirmed).toFixed(2);
        }
        x.activeCase = 0;
        const active = +Number(x.confirmed - (+x.deaths + +x.recovered)).toFixed(0);
        x.activeCase = active >= 0 ? active : 0;
      });

      console.log('this.responseData', this.responseData);
      this.responseData.forEach((x) => x.selectedCountry = false);
      this.originalResponseData = JSON.parse(JSON.stringify(this.responseData));
      this.createRecoveryChart(this.dataList.getGraphData(this.recoveryGraphData, this.responseData), 'Total recovered cases in world ');
      this.createConfirmedChart(this.dataList.getGraphData(this.confirmGraphData, this.responseData), 'Total confirmed cases in world ');
      this.createDeathsChart(this.dataList.getGraphData(this.deathsGraphData, this.responseData), 'Total death cases in world ');
    });
  }

  getConfirmedData(): Promise<any> {
    return new Promise<any>((res) => {
      this.homeService.getConfirmCase().subscribe((data) => {
        this.dataList.readCSVFile(data).then((result: Array<any>) => {
          this.allData.push({ name: 'confirmed', data: result });
          res({ name: 'confirmed', data: result });
        });
      });
    });
  }
  getRecoveredData(): Promise<any> {
    return new Promise<any>((res) => {
      this.homeService.getRecoveredCase().subscribe((data) => {
        this.dataList.readCSVFile(data).then((result: Array<any>) => {
          this.allData.push({ name: 'recovered', data: JSON.parse(JSON.stringify(result)) });
          res({ name: 'recovered', data: result });
        });
      });
    });
  }

  getDeathsData(): Promise<any> {
    return new Promise<any>((res) => {
      this.homeService.getDeathsCase().subscribe((data) => {
        this.dataList.readCSVFile(data).then((result: Array<any>) => {
          this.allData.push({ name: 'deaths', data: JSON.parse(JSON.stringify(result)) });
          res({ name: 'deaths', data: result });
        });
      });
    });
  }

  searchRegion(regionName: string) {
    let dataList = [];
    this.originalResponseData.forEach((region: any) => {
      const myReg = new RegExp(regionName.toLowerCase() + '.*');
      if (region.regionName.toLowerCase().match(myReg)) {
        dataList = [...dataList, region];
      }
    });
    this.responseData = dataList;
    this.responseData.forEach((x) => x.selectedCountry = false);
  }

  compare(a, b) {
    const regionNameA = a.regionName.toUpperCase();
    const regionNameB = b.regionName.toUpperCase();
    let comparison = 0;
    if (regionNameA > regionNameB) {
      comparison = 1;
    } else if (regionNameA < regionNameB) {
      comparison = -1;
    }
    return comparison;
  }
  toggleSorting(type: string) {

    switch (type) {
      case 'REGIONS': {
        this.responseData.sort(this.compare);
        break;
      }
      case 'CONFIRMED': {
        if (this.confirmArrow === 'UP') {
          this.confirmArrow = 'DOWN';
          this.responseData.sort((a, b) => {
            if (a.confirmed > b.confirmed) return 1;
            if (b.confirmed > a.confirmed) return -1;
            return 0;
          });
        } else {
          this.confirmArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.confirmed < b.confirmed) return 1;
            if (b.confirmed < a.confirmed) return -1;
            return 0;
          });
        }
        break;
      }
      case 'PERCENTAGE': {
        if (this.percentageArrow === 'UP') {
          this.percentageArrow = 'DOWN';
          this.responseData.sort((a, b) => {
            if (a.deathsPercentage > b.deathsPercentage) return 1;
            if (b.deathsPercentage > a.deathsPercentage) return -1;
            return 0;
          });
        } else {
          this.percentageArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.deathsPercentage < b.deathsPercentage) return 1;
            if (b.deathsPercentage < a.deathsPercentage) return -1;
            return 0;
          });
        }
        break;
      }
      case 'DEATHS': {
        if (this.deathsArrow === 'UP') {
          this.deathsArrow = 'DOWN';
          this.responseData.sort((a, b) => {
            if (+a.deaths > b.deaths) return 1;
            if (b.deaths > a.deaths) return -1;
            return 0;
          });
        } else {
          this.deathsArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.deaths < b.deaths) return 1;
            if (b.deaths < a.deaths) return -1;
            return 0;
          });
        }
        break;
      }
      case 'RECOVEREDPERCENTAGE': {
        if (this.recoveredPercentageArrow === 'UP') {
          this.recoveredPercentageArrow = 'DOWN';
          this.responseData.sort((a, b) => {
            if (+a.recoveredPercentage > b.recoveredPercentage) return 1;
            if (b.recoveredPercentage > a.recoveredPercentage) return -1;
            return 0;
          });
        } else {
          this.recoveredPercentageArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.recoveredPercentage < b.recoveredPercentage) return 1;
            if (b.recoveredPercentage < a.recoveredPercentage) return -1;
            return 0;
          });
        }
        break;
      }
      case 'ACTIVE': {
        if (this.activeArrow === 'UP') {
          this.activeArrow = 'DOWN';
          this.responseData.sort((a, b) => {
            if (+a.activeCase > b.activeCase) return 1;
            if (b.activeCase > a.activeCase) return -1;
            return 0;
          });
        } else {
          this.activeArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.activeCase < b.activeCase) return 1;
            if (b.activeCase < a.activeCase) return -1;
            return 0;
          });
        }
        break;
      }
      case 'RECOVERED': {
        if (this.recoveredArrow === 'UP') {
          this.recoveredArrow = 'DOWN';
          this.responseData.sort((a, b) => {
            if (+a.recovered > b.recovered) return 1;
            if (b.recovered > a.recovered) return -1;
            return 0;
          });
        } else {
          this.recoveredArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.recovered < b.recovered) return 1;
            if (b.recovered < a.recovered) return -1;
            return 0;
          });
        }
        break;
      }
    }
  }
  selectedCountry(data: ResponseData) {
    this.responseData.forEach((x) => x.selectedCountry = false);
    data.selectedCountry = true;
    const countryWiseConfirmGraphData = [];
    const countryWiseDeathsGraphData = [];
    const countryWiseRecoveredGraphData = [];
    const countryName = data.regionName;
    this.allData.forEach((x: { name: null, data: Array<any> }) => {
      if (x.name === 'confirmed') {
        const countryData = x.data.filter((y) => countryName === `${y["Country/Region"]} ${y["Province/State"]}`)[0] || null;
        const keys = Object.keys(countryData);
        const values = Object.values(countryData);
        keys.splice(0, 4);
        values.splice(0, 4);
        let index = 0;
        for (const key of keys) {
          const obj = { key, value: +values[index] };
          countryWiseConfirmGraphData.push(obj);
          index++;
        }
        let dataPoints = countryWiseConfirmGraphData.map((element) => {
          return {
            y: +element.value,
            label: element.key
          };
        });
        this.confirmedChart.options.title.text = `Total confirmed cases in  ${countryName}`;
        this.confirmedChart.options.data[0].dataPoints = dataPoints;
        this.confirmedChart.render();
      }
      if (x.name === 'deaths') {
        const countryData = x.data.filter((y) => countryName === `${y["Country/Region"]} ${y["Province/State"]}`)[0] || null;
        const keys = Object.keys(countryData);
        const values = Object.values(countryData);
        keys.splice(0, 4);
        values.splice(0, 4);
        let index = 0;
        for (const key of keys) {
          const obj = { key, value: +values[index] };
          countryWiseDeathsGraphData.push(obj);
          index++;
        }
        let dataPoints = countryWiseDeathsGraphData.map((element) => {
          return {
            y: +element.value,
            label: element.key
          };
        });
        this.deathChart.options.title.text = `Total death case in ${countryName}`;
        this.deathChart.options.data[0].dataPoints = dataPoints;
        this.deathChart.render();
      }

      if (x.name === 'recovered') {
        const countryData = x.data.filter((y) => countryName === `${y["Country/Region"]} ${y["Province/State"]}`)[0] || null;
        const keys = Object.keys(countryData);
        const values = Object.values(countryData);
        keys.splice(0, 4);
        values.splice(0, 4);
        let index = 0;
        for (const key of keys) {
          const obj = { key, value: +values[index] };
          countryWiseRecoveredGraphData.push(obj);
          index++;
        }
        let dataPoints = countryWiseRecoveredGraphData.map((element) => {
          return {
            y: +element.value,
            label: element.key
          };
        });
        this.recoveryChart.options.title.text = `Total recovered cases in ${countryName}`;
        this.recoveryChart.options.data[0].dataPoints = dataPoints;
        this.recoveryChart.render();
      }

    });
  }
  refresh() {
    this.ngOnInit();
  }
  createDeathsChart(dataSource: Array<any>, heading: string) {
    let dataPoints = dataSource.map((x) => {
      return {
        y: x.value,
        label: x.key
      };
    });
    this.deathChart = new CanvasJS.Chart("chartDeathsContainer", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: heading
      },
      data: [{
        type: "column",
        dataPoints
      }]
    })
    this.deathChart.render();
  }

  createConfirmedChart(dataSource: Array<any>, heading: string) {
    this.confirmedChart = new CanvasJS.Chart("chartConfirmedContainer", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: heading
      },
      data: [{
        type: "column",
        dataPoints: dataSource.map((x) => {
          return {
            y: x.value,
            label: x.key
          };
        })
      }]
    });
    this.confirmedChart.render();
  }


  createRecoveryChart(dataSource: Array<any>, heading: string) {
    this.recoveryChart = new CanvasJS.Chart("chartRecoveryContainer", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: heading
      },
      data: [{
        type: "column",
        dataPoints: dataSource.map((x) => {
          return {
            y: x.value,
            label: x.key
          };
        })
      }]
    });
    this.recoveryChart.render();
  }
}
