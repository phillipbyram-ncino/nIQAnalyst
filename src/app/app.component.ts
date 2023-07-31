import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppService, CallOptions } from './app.service';
import { MetricCardComponent } from './components/metric-card.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(private readonly service: AppService) { }

  title = 'nIQAnalyst';
  api_key: string = '';
  latestResponse: string = 'No response yet';
  viewReady = false;

  @ViewChildren('metric')
  metricsComponents?: QueryList<MetricCardComponent>;


  metrics: Map<string, number> = new Map<string, number>();

  ngOnInit(): void {
    const key = localStorage.getItem('API_KEY')
    this.api_key = !!key ? key : '';
    this.service.doSetup(this.api_key);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.metricsComponents?.forEach((metric)=>{
      this.metrics.set(metric.metricName, metric.metricValue);

    })
  }

  async makeCall(): Promise<void> {

    const options: CallOptions = {
      api_key: this.api_key,
      metrics: this.metrics
    }
    this.latestResponse = await this.service.makeCall(options);


  }

}
