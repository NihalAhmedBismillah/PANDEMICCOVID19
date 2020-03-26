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
  dataList: DataList = new DataList();
  responseData: Array<ResponseData> = [];
  confirmGraphData = [];
  deathsGraphData = [];
  allData = [];
  originalResponseData = [];
  confirmArrow = 'UP';
  percentageArrow = 'UP';
  deathsArrow = 'UP';
  regionName = '';
  constructor(private homeService: HomeService) { }
  ngOnInit() {
    this.dataList = new DataList();
    this.originalResponseData = this.deathsGraphData = this.confirmGraphData = this.responseData = this.allData = [];
    Promise.all([this.getConfirmedData(),
    this.getDeathsData()
    ]).then((data) => {
      const data1 = data[0];
      const data2 = data[1];
      if (data1.name === 'confirmed') {
        this.confirmGraphData = JSON.parse(JSON.stringify(data1.data));
      }
      if (data2.name === 'deaths') {
        this.deathsGraphData = JSON.parse(JSON.stringify(data2.data));
      }
      this.responseData = this.dataList.mergeData(data);
      this.responseData.forEach((x) => x.percentage = +Number((x.deaths * 100) / x.confirmed).toFixed(2));
      this.responseData.forEach((x) => x.selectedCountry = false);

      this.originalResponseData = JSON.parse(JSON.stringify(this.responseData));
      this.createConfirmedChart(this.dataList.getGraphData(this.confirmGraphData), 'Total Confirmed Cases Till Now ');
      this.createDeathsChart(this.dataList.getGraphData(this.deathsGraphData), 'Total Deaths Cases Till Now');
    });
  }

  selectedCountry(data: ResponseData) {
    this.responseData.forEach((x) => x.selectedCountry = false);
    data.selectedCountry = true;
    const countryWiseConfirmGraphData = [];
    const countryWiseDeathsGraphData = [];
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
        this.confirmedChart.options.title.text = `Total Confirmed Cases In ${countryName} Till Now`;
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
      }

      let dataPoints = countryWiseDeathsGraphData.map((element) => {
        return {
          y: +element.value,
          label: element.key
        };
      });
      this.deathChart.options.title.text = `Total Deaths Cases In ${countryName} Till Now`;
      this.deathChart.options.data[0].dataPoints = dataPoints;
      this.deathChart.render();
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
  getConfirmedData(): Promise<any> {
    return new Promise<any>((res) => {
      this.homeService.getConfirmCase().subscribe((data) => {
        this.dataList.readCSVFile(data).then((result: Array<any>) => {
          res({ name: 'confirmed', data: result });
          this.allData.push({ name: 'confirmed', data: result });
        });
      });
    });
  }
  getRecoveredData(): Promise<any> {
    return new Promise<any>((res) => {
      this.homeService.getRecoveredCase().subscribe((data) => {
        this.dataList.readCSVFile(data).then((result: Array<any>) => {
          res({ name: 'recovered', data: result });
          this.allData.push({ name: 'confirmed', data: JSON.parse(JSON.stringify(result)) });
        });
      });
    });
  }

  getDeathsData(): Promise<any> {
    return new Promise<any>((res) => {
      this.homeService.getDeathsCase().subscribe((data) => {
        this.dataList.readCSVFile(data).then((result: Array<any>) => {
          res({ name: 'deaths', data: result });
          this.allData.push({ name: 'deaths', data: JSON.parse(JSON.stringify(result)) });
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
            if (a.percentage > b.percentage) return 1;
            if (b.percentage > a.percentage) return -1;
            return 0;
          });
        } else {
          this.percentageArrow = 'UP';
          this.responseData.sort((a, b) => {
            if (a.percentage < b.percentage) return 1;
            if (b.percentage < a.percentage) return -1;
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
      }
    }
  }
}
