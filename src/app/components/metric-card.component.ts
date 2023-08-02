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
}
@Component({
    templateUrl: './metric-card.component.html',
    selector: 'app-metric-card',
    styleUrls: ['./metric-card.component.css']
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

        const successful = this.metricsService.isMetricSuccessful(this)
        !successful && this.setIcon(!successful);
    
        this.setIcon(successful, this.metricsService.isMetricLowRisk(this));
        return successful;
    }
    setIcon(success:boolean, atRisk?:boolean){

        this.iconName = atRisk? 'warning': success? 'checkmark':'error';
        this.iconColor = atRisk? 'accent': success? 'primary':'accent';

        this.showIcon = true;
    }

}