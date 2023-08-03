import { Component } from "@angular/core";

@Component({
    templateUrl: './analysis-box.component.html',
    selector: 'app-analysis-box',
    styleUrls:['./analysis-box.component.scss']
})
export class AnalysisBoxComponent {

    analysisOutput: string = "The quick brown fox jumps over the lazy dog";

}