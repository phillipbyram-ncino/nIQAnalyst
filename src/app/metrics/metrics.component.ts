import { Component, QueryList, ViewChildren } from '@angular/core';
import { MetricCardComponent } from '../components/metric-card.component';
import { AppService, CallOptions } from '../app.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})
export class MetricsComponent {

  constructor(private readonly service: AppService) { }

  @ViewChildren('metric')
  metricsComponents?: QueryList<MetricCardComponent>;

  metrics: Map<string, number> = new Map<string, number>();

  async makeCall(): Promise<void> {

    this.updateMetricsMap();
    const options: CallOptions = {
      metrics: this.metrics
    }
    await this.service.makeCall(options);

  }


  private updateMetricsMap(): void {
    this.metricsComponents?.forEach((metric) => {
      this.metrics.set(metric.metricName, (metric.value?.value || 0) as number);
    })
  }

}
