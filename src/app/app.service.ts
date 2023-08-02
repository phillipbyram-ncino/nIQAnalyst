import { Injectable } from "@angular/core";
import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, OpenAIApi } from "openai";
import { BehaviorSubject, of } from "rxjs";
import { Metric } from "./components/metric-card.component";


export interface CallOptions {
    api_key?: string,
    metrics: Map<string, Metric>
    periodId: string
}
type ChatMessage =ChatCompletionResponseMessage | ChatCompletionRequestMessage | undefined
@Injectable({ providedIn: "root" })
export class AppService {

    static APPROVED: string = 'approved';
    static DENIED: string = 'denied';
    static AT_RISK: string = 'At-Risk';
    static NO_RISK: string = 'No Risk';

    static END_OF_CONTENT_WIGGLE_ROOM_LENGTH = 7;

    latestResponse$: BehaviorSubject<string> = new BehaviorSubject<string>('No response yet');

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
        Array.from(metrics.entries()).forEach(([name,metric]) => {
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

}