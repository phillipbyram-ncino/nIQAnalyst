import { Card } from "./cards.service";

export class PeriodCard implements Card {
    title: string = 'title';
    cols: number = 1;
    rows: number = 1;
    isPeriod? = true;
    constructor(title?:string, cols?:number,rows?:number){
        this.title = title || this.title;
        this.cols = cols || this.cols;
        this.rows = rows || this.rows;
    }

}