import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatInput } from "@angular/material/input";
import { AppService } from "../app.service";
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
export class MetricCardComponent implements AfterViewInit, Metric {

    constructor(private metricsService: MetricsFormulaService) { }


    @ViewChild(MatInput, { static: true })
    valueComponent?: MatInput

    @Input() metricValuePlaceholder: number = 1.09;
    @Input() metricName: string = 'Debt Ratio';

    @Input() min: number = 0
    @Input() max: number = 0
    @Input() metricBounds: 'upper' | 'lower' | 'both' | 'neither' = 'neither';
    @Input() boundsMargin: number = 0;

    isAtRisk?:boolean;
    isSuccessful?:boolean;
    result?: 'no-risk' | 'at-risk' | 'fail';

    value?: number;


    showIcon:boolean = false;
    iconName: string = 'succss';
    iconColor: string = 'primary';

    ngAfterViewInit(): void {
        console.log(this.value)

    }

    checkSuccess():boolean {
        if(!this.value){
            this.value = this.metricValuePlaceholder
        }

        const successful = this.metricsService.isMetricSuccessful(this);
        const isHighRisk = !this.metricsService.isMetricLowRisk(this);
        this.setIcon([successful,isHighRisk])

        this.isAtRisk = isHighRisk;
        this.isSuccessful = successful;
        this.result = !successful? 'fail':isHighRisk? 'at-risk':'no-risk';
    
        return successful;
    }
    setIcon([success, atRisk]:[boolean,boolean]){
        console.log([success,atRisk]);

        this.iconName = success? atRisk? 'error':'checkmark':'report_problem';
        this.iconColor = success? atRisk?'warn':'primary': 'accent';

        this.showIcon = true;
    }

}