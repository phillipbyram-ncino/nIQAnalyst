import { NgModule } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MetricCardComponent } from "./metric-card.component";
import { MatInputModule } from '@angular/material/input';
import { AnalysisBoxComponent } from "./analysis-box.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";


@NgModule({
    declarations: [MetricCardComponent, AnalysisBoxComponent],
    exports: [MetricCardComponent, AnalysisBoxComponent],
    imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule, FormsModule,CommonModule]
})
export class ComponentsModule { }