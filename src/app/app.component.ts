import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppService, CallOptions } from './app.service';
import { MetricCardComponent } from './components/metric-card.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private readonly service: AppService) { }

  title = 'nIQAnalyst';
  api_key: string = '';
  responses: Array<string> = [];
  viewReady = false;

  ngOnInit(): void {
    const key = localStorage.getItem('API_KEY')
    this.api_key = !!key ? key : '';
    this.service.doSetup(this.api_key);

    this.service.latestResponse$.subscribe(
      (response) => this.responses.push(response));
  }
}
