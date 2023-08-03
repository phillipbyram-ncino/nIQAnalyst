import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { Metric, MetricCardComponent } from '../components/metric-card.component';
import { AppService, CallOptions } from '../app.service';
import { PeriodCard } from '../cards-service/period-card';
import { ApprovalOptions, MetricsFormulaService } from '../cards-service/metrics-formula.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent{

  constructor(private readonly service: AppService,private readonly metricsService: MetricsFormulaService) { }


  @Input() period?: PeriodCard;
  isPeriod?: boolean;
  @Input() approvalOptions?: ApprovalOptions;

  showIcon: boolean = false;
  iconName: string = '';
  iconColor: string = 'primary';
  isSuccessful: boolean = false;

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


  private handleEval(success: boolean):boolean {
    this.iconName = success ? 'checkmark' : 'error';
    this.iconColor = success ? 'primary' : 'accent';

    this.isSuccessful = success;
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

  findAtRisk(): boolean {

    this.updateMetricsMap();

    const successes = this.metricsComponents?.map(metricComponent => metricComponent.checkSuccess()) || [];

    const numfailures = successes.filter(success => !success).length


    return this.handleEval(!this.metricsService.isPeriodFailure(undefined,this.approvalOptions,numfailures));
   }

}
