import { Injectable } from "@angular/core";
import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { BehaviorSubject } from "rxjs";
import { Metric } from "./metric-card/metric-card.component";
import { FinancialApplication } from "./analysis-dashboard/analysis-dashboard.component";
import { PeriodCard } from "./cards-service/period-card";


export interface CallOptions {
    api_key?: string,
    metrics: Map<string, Metric>
    periodId: string
}
@Injectable({ providedIn: "root" })
export class AppService {

    private static APPROVED: string = 'Approved';
    private static DENIED: string = 'Denied';

    private openai: OpenAIApi | undefined;
    
    latestResponse$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    doSetup(key: string): OpenAIApi {
        if (this.openai) {
            return this.openai;
        }
        const configuration = new Configuration({
            apiKey: key
        });
        this.openai = new OpenAIApi(configuration);
        return this.openai;
    }

    async sendApplication(application: FinancialApplication): Promise<void> {
        if (!this.openai) {
            throw Error('api not initialized');
        }

        const message: ChatCompletionRequestMessage = {
            role: 'user',
            content: this.createPrompt(application)
        }

        const chatCompletionRequest = {
            model: "gpt-3.5-turbo",
            temperature: 0.0,
            messages: [message]
        }
        const completion = await this.openai.createChatCompletion(chatCompletionRequest);


        this.latestResponse$.next(completion.data.choices[0]?.message?.content || '');

    }

    private createPrompt(application: FinancialApplication): string {

        const SUCCESS: string = 'Success ';
        const FAIL: string = 'Fail    ';
        const DIVIDER: string = '------------------------------------' + application.periods.map(() => '-------------------').join('') + '-';
        const table = `
            Overall Rating                      | ${application.isPassed ? AppService.APPROVED : AppService.DENIED}
            ${DIVIDER}
            Period Rating                       | ${application.periods.map((p) => `${p.isSuccessful ? SUCCESS : FAIL}         | `).join('')}
            ${DIVIDER}
            Metric                              | ${application.periods.map(p => `${p.title}         | `).join('')}
            ${this.createMetricRows(application.periods)}`;

        console.log(table)

        const prompt = `
        You are a financial analyst and will be given a table providing metrics, values for the metrics, an "at-risk", "no risk" or "fail" for each metric, multiple financial periods of information, a "pass" or "fail" for each of the financial period(s), and finally an overall "Approved" or "Denied" disposition for the request.  

        I want you to take that information and provide me a period-over-period risk-assessment of the data focusing primarily on the higher numbered periods, while bringing attention to any obvious outliers. Specifically if metrics that were previously not passing are now failing for later periods, call that out.
        The risk assessment should provide specific value examples for "at-risk" and "fail" metrics only.  

        Additionally, I want you to provide me 5 questions to ask the customer about their data to potentially mitigate any risk associated with the financial information. Here is the table:
        ${table}
        `
        return prompt;

    }

    private createMetricRows(periods: Array<PeriodCard>): string {

        const metricNames = Array.from(periods[0].metrics?.keys() || [])
        const rows = metricNames.map((name) => {
            const padding = 36 - name.length;
            const metrics = periods.map(p => p.metrics?.get(name));
            return `
            ${name}${new Array(padding + 1).join(' ')}|${metrics.map(m => this.createMetricCell(m)).join('')}`

        });
        return rows.join('\n');
    }
    private createMetricCell(metric?: Metric): string {

        if (!metric) {
            return new Array(20 + 1).join(' ');
        }

        const metricValue = '' + metric.value;
        const metricResult = '' + metric.result;
        const padding = 19 - 5 - (metricValue.length + metricResult.length);
        const metricCell = ` ${metricValue} (${metricResult})${new Array(padding + 1).join(' ')}|`;


        return metricCell;
    }


    /*

    Ovrall Rating | Approved
    ----------------------------------------------------------------------------------------------------------------
    Period Rating                       | Fail              | Success           | Success           | Fail
    ----------------------------------------------------------------------------------------------------------------
    Metric                              | Period 1          | Period 2          | Period 3          | Period 4      
    Debt Ratio                          | 1.20 (no risk)    | 1.5 (no risk)     | 2.65 (at-risk)    | 3.0 (at-risk) 
    Inventory Turnover                  | 5.5 (at-risk)     | 8.0 (no-risk      | 9.0 (at-risk)     | 9.9 (at-risk)

    */
}