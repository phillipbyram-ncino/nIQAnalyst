import { NgModule } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MetricCardComponent } from "./metric-card.component";
import { MatInputModule } from '@angular/material/input';


@NgModule({
    declarations: [MetricCardComponent],
    exports: [MetricCardComponent],
    imports: [MatCardModule, MatInputModule]
})
export class ComponentsModule { }