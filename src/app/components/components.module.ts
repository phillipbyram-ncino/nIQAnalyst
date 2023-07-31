import { NgModule } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MetricCardComponent } from "./metric-card.component";

@NgModule({
    declarations:[MetricCardComponent],
    exports: [MetricCardComponent],
    imports: [
        MatCardModule
    ]
})
export class ComponentsModule { }