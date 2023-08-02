import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { Metric, MetricCardComponent } from '../components/metric-card.component';
import { AppService, CallOptions } from '../app.service';
import { PeriodCard } from '../cards-service/period-card';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})
export class MetricsComponent {

  constructor(private readonly service: AppService) { }

  @Input() period?: PeriodCard;

  @ViewChildren('metric')
  metricsComponents?: QueryList<MetricCardComponent>;

  metrics: Map<string, Metric> = new Map<string, Metric>();

  async makeCall(): Promise<void> {

    this.updateMetricsMap();
    const options: CallOptions = {
      metrics: this.metrics,
      periodId: this.period?.title || ''
    }
    await this.service.makeCall(options);

  }


  private updateMetricsMap(): void {
    this.metricsComponents?.forEach((metric) => {
      this.metrics.set(metric.metricName, metric);
    })
  }

   async findAtRisk(): Promise<void> {

    this.updateMetricsMap();

    this.metricsComponents?.forEach(metricComponent => metricComponent.testThresholds())
   }

}
