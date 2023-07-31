import { Component, Input } from "@angular/core";

@Component({
    templateUrl: './metric-card.component.html',
    selector: 'app-metric-card',
    styleUrls:['./metric-card.component.css']
})
export class MetricCardComponent {

    @Input() metricValue: number = 1.09;
    @Input() metricName: string = 'Debt Ratio';

}