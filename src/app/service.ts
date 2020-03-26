import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class HomeService {

  convidBaseUrl = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series`;
  CovidDataTypes = {
    confirmed: {
      dataSourceUrl: `/time_series_covid19_confirmed_global.csv`
    },
    recovered: {
      dataSourceUrl: `/time_series_19-covid-Recovered.csv`
    },
    deaths: {
      dataSourceUrl: `/time_series_covid19_deaths_global.csv`
    }
  };
  headers = new HttpHeaders();
  options: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType: 'arraybuffer';
    withCredentials?: boolean;
  } = {
      responseType: 'arraybuffer'
    };
  constructor(private http: HttpClient) { }

  public getConfirmCase(): Observable<any> {
    const url = `${this.convidBaseUrl}${this.CovidDataTypes.confirmed.dataSourceUrl}`;
    return this.http
      .get(url, this.options)
      .pipe(
        map((file: ArrayBuffer) => {
          return file;
        })
      );
  }

  public getRecoveredCase(): Observable<any> {
    const url = `${this.convidBaseUrl}${this.CovidDataTypes.recovered.dataSourceUrl}`;
    return this.http
      .get(url, this.options)
      .pipe(
        map((file: ArrayBuffer) => {
          return file;
        })
      );
  }

  public getDeathsCase(): Observable<any> {
    const url = `${this.convidBaseUrl}${this.CovidDataTypes.deaths.dataSourceUrl}`;
    return this.http
      .get(url, this.options)
      .pipe(
        map((file: ArrayBuffer) => {
          return file;
        })
      );
  }
}
