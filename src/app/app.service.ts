import { Injectable } from "@angular/core";
import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, OpenAIApi } from "openai";
import { BehaviorSubject, of, takeLast } from "rxjs";
import { Metric, MetricCardComponent } from "./components/metric-card.component";
import { FinancialApplication } from "./analysis-dashboard/analysis-dashboard.component";
import { PeriodCard } from "./cards-service/period-card";
import { MetricsComponent } from "./metrics/metrics.component";


export interface CallOptions {
    api_key?: string,
    metrics: Map<string, Metric>
    periodId: string
}
type ChatMessage = ChatCompletionResponseMessage | ChatCompletionRequestMessage | undefined
@Injectable({ providedIn: "root" })
export class AppService {

    static APPROVED: string = 'Approved';
    static DENIED: string = 'Denied';

    static AT_RISK: string = 'At-Risk';
    static NO_RISK: string = 'No Risk';

    static END_OF_CONTENT_WIGGLE_ROOM_LENGTH = 7;

    latestResponse$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    messages = new Array<ChatMessage>();

    approvals = new Map<string, boolean>();


    openai: OpenAIApi | undefined;
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

    async makeCall(options: CallOptions): Promise<boolean> {
        options.api_key && this.doSetup(options.api_key);
        if (!this.openai) {
            throw Error('api not initialized');
        }

        try {
            const chatCompletionRequest = this.buildCCR(options.metrics);
            const completion = await this.openai.createChatCompletion(chatCompletionRequest);
            this.messages.push(...chatCompletionRequest.messages, completion.data.choices[0]?.message);
            const fullContent = completion.data.choices[0]?.message?.content || 'There was an error with the response';
            console.log(completion);
            console.log(fullContent);
            const statusLength = Math.max(AppService.APPROVED.length, AppService.DENIED.length)
            const startPos = fullContent.length - AppService.END_OF_CONTENT_WIGGLE_ROOM_LENGTH - statusLength;
            const lastCharacters = fullContent.substring(startPos);

            const response = lastCharacters.includes(AppService.APPROVED) ? AppService.APPROVED : lastCharacters.includes(AppService.DENIED) ? AppService.DENIED : 'ERROR';
            this.latestResponse$.next(fullContent);
            this.approvals.set(options.periodId, lastCharacters.includes(AppService.APPROVED))
            return lastCharacters.includes(AppService.APPROVED);

        } catch (error) { }
        this.latestResponse$.next('hi');
        this.approvals.set(options.periodId, false);
        return false;
    }

    async followUpOnMetric(metric: Metric): Promise<boolean> {


        const message1: ChatCompletionRequestMessage = {
            role: 'user',
            content: `is ${metric.metricName} ${AppService.AT_RISK} or ${AppService.NO_RISK}?`
        }
        this.messages.push(message1);

        if (!this.openai) {
            throw Error('api not initialized');
        }
        console.log(this.messages)

        const completion = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: 0.0,
            messages: this.messages as Array<ChatCompletionRequestMessage>
        });

        this.messages.push(completion.data.choices[0]?.message);


        const fullContent = completion.data.choices[0]?.message?.content || 'There was an error with the response';

        console.log(fullContent);
        return fullContent.includes(AppService.AT_RISK);


    }
    followUp(metrics: Array<Metric>) {

        let metricsRangeInstructions = '';
        metrics.forEach((metric, index) => {
            metricsRangeInstructions +=
                `${index + 1}. "${metric.metricName}":
             a. “Lowest Value” = ${metric.min}
             b. "Highest Value” = ${metric.max}`;
        });

        const message1: ChatCompletionRequestMessage = {
            role: 'user',
            content: `is `
        }
        this.messages.push(message1)
        return {
            model: "gpt-3.5-turbo",
            temperature: 0.0,
            messages: this.messages
        }
    }

    private buildCCR(metrics: Map<string, Metric>): CreateChatCompletionRequest {

        let old = `

        You are a financial analyst trying to decide if a loan should be approved or not based on risk factors.
        I will be providing 7 key metrics of a business for a period of time. 

        Additionally I will provide a sliding scale from "Lowest Value" to "Highest Value" to measure each metric as "At-Risk" or "No Risk" for each metric.
        
        If the value for the metric is greater than or equal to its "Lowest Value", but less than or equal to its "Highest Value", provide me an "At-Risk" response.  If the value for one of the metrics does not fall within the sliding scale, provide me a "No Risk" response. 

        If all 7 of the metrics meet their benchmarks, I want you to provide an output of ${AppService.APPROVED} 

        If two or more of the metrics do not meet the benchmarks as defined above, I want you to provide an output of ${AppService.DENIED}

        When providing the answers, do not provide any additional text for outputs other than ${AppService.APPROVED} or ${AppService.DENIED}

        Each of the metric's values need to meet its respective benchmark with no margin of error. 

        For now, just provide if this entire 
        `;

        let template = `
        
            You are an analyst working at a financial institution creating a report for a business that is applying for a loan.
            this report will indicate your advice on whether or not to approve the business for a loan.
            You will be given a list of 7 ratios that should be used as risk factors. each ratio will have a value and a min/max threshhold. if the value falls inside of this threshhold the metric is considered low risk.

        `

        let table = '';
        Array.from(metrics.entries()).forEach(([name, metric]) => {
            table += `
             ${name}: ${metric.value as string}
             a. “Lowest Value” = ${metric.min}
             b. "Highest Value” = ${metric.max}
            `;
        });

        table += `
        provide an anlaysis on the given financial data along with an approve or deny rating:`

        console.log(table);
        const message0: ChatCompletionRequestMessage = {
            role: 'system',
            content: template
        }
        const message1: ChatCompletionRequestMessage = {
            role: 'user',
            content: table
        }

        const messages: Array<ChatCompletionRequestMessage> = [message0, message1];
        // console.log(messages);
        return {
            model: "gpt-3.5-turbo",
            temperature: 0.0,
            messages: messages
        }
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