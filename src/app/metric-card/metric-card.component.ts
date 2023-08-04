import { Component, Input, ViewChild } from "@angular/core";
import { MatInput } from "@angular/material/input";
import { MetricsFormulaService } from "../cards-service/metrics-formula.service";

export interface Metric {
    value?: any
    metricName: string
    min: number
    max: number
    metricBounds: 'upper' | 'lower' | 'both' | 'neither'
    boundsMargin: number
    result?: 'no-risk' | 'at-risk' | 'fail'
}
@Component({
    templateUrl: './metric-card.component.html',
    selector: 'app-metric-card',
    styleUrls: ['./metric-card.component.scss']
})
export class MetricCardComponent implements Metric {

    constructor(private metricsService: MetricsFormulaService) { }

    @ViewChild(MatInput, { static: true })
    valueComponent?: MatInput

    @Input() metricValuePlaceholder: number = 1.09;
    @Input() metricName: string = 'Debt Ratio';
    @Input() min: number = 0
    @Input() max: number = 0
    @Input() metricBounds: 'upper' | 'lower' | 'both' | 'neither' = 'neither';
    @Input() boundsMargin: number = 0;

    value?: number;
    showIcon:boolean = false;
    iconName: string = 'succss';
    iconColor: string = 'primary';

    checkSuccess():boolean {
        if(!this.value){
            this.value = this.metricValuePlaceholder
        }

        const successful = this.metricsService.isMetricSuccessful(this);
        const isHighRisk = !this.metricsService.isMetricLowRisk(this);
        this.setIcon([successful,isHighRisk])
        return successful;
    }

    // TODO setIcon should be in an interface or Metric/Period/Dashboard interfaces should implement a new `Failable` interface
    setIcon([success, atRisk]:[boolean,boolean]){
        this.iconName = success? atRisk? 'error':'checkmark':'report_problem';
        this.iconColor = success? atRisk?'warn':'primary': 'accent';

        this.showIcon = true;
    }

}