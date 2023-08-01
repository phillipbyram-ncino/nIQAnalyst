import { NgModule } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MetricCardComponent } from "./metric-card.component";
import { MatInputModule } from '@angular/material/input';
import { AnalysisBoxComponent } from "./analysis-box.component";


@NgModule({
    declarations: [MetricCardComponent, AnalysisBoxComponent],
    exports: [MetricCardComponent, AnalysisBoxComponent],
    imports: [MatCardModule, MatInputModule]
})
export class ComponentsModule { }