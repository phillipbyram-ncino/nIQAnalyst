import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { Metric, MetricCardComponent } from '../metric-card/metric-card.component';
import { PeriodCard } from '../cards-service/period-card';
import { ApprovalOptions, MetricsFormulaService } from '../cards-service/metrics-formula.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent{

  constructor(private readonly metricsService: MetricsFormulaService) { }

  @ViewChildren('metric')
  metricsComponents?: QueryList<MetricCardComponent>;

  @Input() period?: PeriodCard;
  @Input() approvalOptions?: ApprovalOptions;

  showIcon: boolean = false;
  iconName: string = '';
  iconColor: string = 'primary';

  private metrics: Map<string, Metric> = new Map<string, Metric>();

  findAtRisk(): boolean {

    this.updateMetricsMap();

    const successes = this.metricsComponents?.map(metricComponent => metricComponent.checkSuccess()) || [];

    const numfailures = successes.filter(success => !success).length

    return this.handleEval(!this.metricsService.isPeriodFailure(undefined,this.approvalOptions,numfailures));
   }

  // TODO setIcon should be in an interface or Metric/Period/Dashboard interfaces should implement a new `Failable` interface
  private handleEval(success: boolean):boolean {
    this.iconName = success ? 'checkmark' : 'error';
    this.iconColor = success ? 'primary' : 'accent';

    this.period = {
      ...this.period,
      metrics:this.metrics,
      isSuccessful: success
    } as PeriodCard
    this.showIcon = true;
    return success;
  }

  private updateMetricsMap(): void {
    this.metricsComponents?.forEach((metric) => {
      this.metrics.set(metric.metricName, metric);
    })
  }
}
