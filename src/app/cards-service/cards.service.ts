import { Injectable } from "@angular/core";
import { PeriodCard } from "./period-card";

// export class Card implements ICard {
//     title: string = 'title';
//     cols: number = 1;
//     rows: number = 1;
//     constructor(title?:string, cols?:number,rows?:number){
//         this.title = title || this.title;
//         this.cols = cols || this.cols;
//         this.rows = rows || this.rows;
//     }
// }

export interface Card {
    title: string
    cols: number
    rows: number
}

@Injectable()
export class CardsService {


    private topCards: Array<Card> = [{ title: 'Decision Overview', cols: 1, rows: 2 }];
    private periodCards: Array<PeriodCard> = [{ title: 'Period 1', cols: 2, rows: 2, isPeriod: true }];
    // private bottomCards: Array<Card> = [{ title: 'Analysis Actions', cols: 3, rows: 1 }, { title: 'Memo', cols: 3, rows: 3 }];
    private bottomCards: Array<Card> =[];

    addPeriod(name: string) {
        const [cols, rows] = this.getColRowLength(this.periodCards.length);
        const periodCard = new PeriodCard(name, cols, rows);
        this.periodCards = this.periodCards.map(card => ({...card, cols, rows })).concat(periodCard);
    }
    getPeriodCardsLength(): number{
        return this.periodCards.length;
    }

    private getColRowLength(numPeriods: number): [number, number] {
        return numPeriods == 1 ? [1, 2] : [1, 1];
    }

    getCards(): Array<Card> {
        return this.topCards.concat(this.periodCards.concat(this.bottomCards));
    }


    getSingleViewCards(): Array<Card> {
        return this.getCards().map(c => (
            { ...c, cols: 1, rows: 1 }
        ));
    }

}