import { Component, EventEmitter, Output, QueryList, ViewChildren, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Card, CardsService } from '../cards-service/cards.service';
import { concat, from, fromEvent, merge } from 'rxjs';
import { MetricCardComponent } from '../components/metric-card.component';
import { PeriodCard } from '../cards-service/period-card';
import { AppService } from '../app.service';
import { MetricsComponent } from '../metrics/metrics.component';

@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.css'],
  providers: [CardsService]
})
export class AnalysisDashboardComponent {

  constructor(private cardsService: CardsService, private appService:AppService) {
  }
  private breakpointObserver = inject(BreakpointObserver);
  private addPeriodEvent = new EventEmitter<Array<Card>>()
  @Output() submitCall = new EventEmitter<void>()

  @ViewChildren('metrics')
  metricsComponents?: QueryList<MetricsComponent>;

  /** Based on the screen size, switch from standard to one column per row */
  cards = merge(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(({ matches }) => {
        if (matches) {
          return this.cardsService.getSingleViewCards();
        }

        return this.cardsService.getCards();
      })),
    this.addPeriodEvent
  )
  isPeriod(card: Card):card is PeriodCard {
    const v = (card as PeriodCard).isPeriod;

    return v || false
  }


  addPeriod() {
    const newNumPeriodCards = this.cardsService.getPeriodCardsLength() + 1;
    this.cardsService.addPeriod(`Period ${newNumPeriodCards}`);
    console.log('did thing')
    this.addPeriodEvent.next(this.cardsService.getCards());

  }
  async makeCall():Promise<void>{
    await Promise.all([this.metricsComponents?.map(component => component.makeCall())]);
    this.submitCall.next();
  }

  async findAtRisk(): Promise<void>{
    await Promise.all( [this.metricsComponents?.map(component => component.findAtRisk())])
  }
}
