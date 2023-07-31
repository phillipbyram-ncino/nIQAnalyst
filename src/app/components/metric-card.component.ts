import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { MatInput } from "@angular/material/input";

@Component({
    templateUrl: './metric-card.component.html',
    selector: 'app-metric-card',
    styleUrls:['./metric-card.component.css']
})
export class MetricCardComponent implements AfterViewInit{

    @ViewChild(MatInput, {static:true})
    value?: MatInput

    @Input() metricValuePlaceholder: number = 1.09;
    @Input() metricName: string = 'Debt Ratio';

    ngAfterViewInit(): void {
        console.log(this.value?.value)

    }

}