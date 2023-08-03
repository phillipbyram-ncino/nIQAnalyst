import { Component, EventEmitter, Output, QueryList, ViewChildren, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Card, CardsService } from '../cards-service/cards.service';
import { BehaviorSubject, concat, from, fromEvent, merge } from 'rxjs';
import { MetricCardComponent } from '../components/metric-card.component';
import { PeriodCard } from '../cards-service/period-card';
import { AppService } from '../app.service';
import { MetricsComponent } from '../metrics/metrics.component';
import { ApprovalOptions, MetricsFormulaService } from '../cards-service/metrics-formula.service';


export interface FinancialApplication {
  isPassed?: boolean;
  periods: Array<PeriodCard>;
}
@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.scss'],
  providers: [CardsService]
})
export class AnalysisDashboardComponent {

  constructor(private cardsService: CardsService, private appService: AppService, private metricsService: MetricsFormulaService) {
  }
  private breakpointObserver = inject(BreakpointObserver);
  private addPeriodEvent = new EventEmitter<Array<Card>>()
  @Output() submitCall = new EventEmitter<void>()

  isApprovalChecked =false; 
  isWorking = false;
  hasAnalysis = false;

  showIcon: boolean = false;
  iconName: string = '';
  iconColor: string = 'primary';
  badgeName: string = 'remove_circle_outline';
  badgeColor: string = '';
  isSuccessful: boolean = false;
  approvalOptions: ApprovalOptions = {
    allowableFailedMetrics: 2,
    allowableFailedPeriodsRatio: 0.5
  }
  application?: FinancialApplication;



  handleEval(success: boolean): boolean {
    this.iconName = success ? 'checkmark' : 'error';
    this.iconColor = success ? 'primary' : 'accent';
    this.badgeName = success ? 'check_circle_outline' : 'error';
    this.badgeColor = success ? 'primary' : 'accent';

    this.isSuccessful = success;
    this.showIcon = true;
    return success;
  }

  @ViewChildren('metrics')
  metricsComponents?: QueryList<MetricsComponent>;

  /** Based on the screen size, switch from standard to one column per row */
  cards: BehaviorSubject<Array<Card>> = merge(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(({ matches }) => {
        if (matches) {
          return this.cardsService.getSingleViewCards();
        }

        return this.cardsService.getCards();
      })),
    this.addPeriodEvent
  ) as BehaviorSubject<Array<Card>>
  isPeriod(card: Card): card is PeriodCard {
    const p = (card as PeriodCard).isPeriod;

    return p || false
  }

  showQuestions(){

  }


  addPeriod() {
    const newNumPeriodCards = this.cardsService.getPeriodCardsLength() + 1;
    this.cardsService.addPeriod(`Period ${newNumPeriodCards}`);
    this.addPeriodEvent.next(this.cardsService.getCards());

  }
  async makeCall(): Promise<void> {
    this.isWorking = true;
    this.application && await this.appService.sendApplication(this.application);
    this.isWorking = false;
    this.hasAnalysis = true;
  }

  async findAtRisk(): Promise<void> {
    

    const failedPeriods = this.metricsComponents?.map(component => component.findAtRisk()) || [];

    const applicationResult = this.handleEval(this.metricsService.isApplicationFailure(undefined, this.approvalOptions, failedPeriods.filter(f => !!f).length, this.cardsService.getPeriodCardsLength()));


    const cards: Array<PeriodCard> = this.metricsComponents?.filter(p => !!p.period).map((c) => ({ ...c.period })) as Array<PeriodCard>
    const application: FinancialApplication = {
      isPassed: applicationResult,
      periods: cards

    }
    this.application = application;
    this.hasAnalysis = false;
    
    this.isApprovalChecked = true;
  }
}
