import { Injectable } from "@angular/core";
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, CreateCompletionRequest, OpenAIApi } from "openai";
import { BehaviorSubject, of } from "rxjs";


export interface CallOptions {
    api_key?: string,
    metrics: Map<string, number>
}
@Injectable({ providedIn: "root" })
export class AppService {

    static APPROVED: string = 'approved';
    static DENIED: string = 'denied';

    static END_OF_CONTENT_WIGGLE_ROOM_LENGTH = 7;

    latestResponse$: BehaviorSubject<string> = new BehaviorSubject<string>('No response yet');

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

    async makeCall(options: CallOptions): Promise<void> {
        options.api_key && this.doSetup(options.api_key);
        if (!this.openai) {
            throw Error('api not initialized');
        }

        try {
            const completion = await this.openai.createChatCompletion(this.buildCCR(options.metrics));
            const fullContent = completion.data.choices[0]?.message?.content || 'There was an error with the response';
            console.log(completion);
            console.log(fullContent);
            const statusLength = Math.max(AppService.APPROVED.length, AppService.DENIED.length)
            const startPos = fullContent.length - AppService.END_OF_CONTENT_WIGGLE_ROOM_LENGTH - statusLength;
            const lastCharacters = fullContent.substring(startPos);

            this.latestResponse$.next(lastCharacters.includes(AppService.APPROVED)? AppService.APPROVED: lastCharacters.includes(AppService.DENIED)? AppService.DENIED: 'ERROR');
            return;

        } catch (error) { }
        this.latestResponse$.next('hi');
    }

    buildCCR(metrics: Map<string, number>): CreateChatCompletionRequest {

        let template = `

        You are a financial analyst. I will be providing 7 key metrics. 
        These key metrics will have a minimum or maximum benchmark. Here are the 7 key metrics:
       
        1. Debt Ratio: To meet the benchmark, the debt ratio should be equal to 3.0 or lower. If the debt ratio is less than or equal to 3.0, it meets this benchmark.

        2. Inventory Turnover: To meet the benchmark, the inventory turnover ratio should be greater than or equal to 5.0 and less than or equal to 10.0. If the inventory turnover ratio falls within this range, it meets this benchmark.

        3. Debt Service Coverage Ratio (DSCR): To meet the benchmark, DSCR should be equal to 1.25 or higher. If DSCR equals 1.25 or above, it meets this benchmark.

        4. Loan-to-Value Ratio (LTV): To meet the benchmark, LTV should be equal to or less than 75. If LTV is equal to or less than 75, it meets this benchmark.

        5. Current Ratio: To meet the benchmark, the current ratio should be equal to or greater than 1.2. If the current ratio is equal to or greater than 1.2, it meets this benchmark.

        6. Profit Margin: To meet the benchmark, the profitability ratio should be equal to or greater than 1.5. If the profitability ratio is equal to or greater than 1.5, it meets this benchmark.

        7. Fixed Charge Coverage Ratio: To meet the benchmark, the fixed charge coverage ratio should be equal to or greater than 1.25. If the fixed charge coverage ratio is equal to or greater than 1.25, it meets this benchmark.


        In each scenario, the User will provide the values for each of the 7 metrics above. 

        If all 7 of the metrics meet their benchmarks, I want you to provide an output of ${AppService.APPROVED} 

        If two or more of the metrics do not meet the benchmarks as defined above, I want you to provide an output of ${AppService.DENIED}

        When providing the answers, do not provide any additional text for outputs other than ${AppService.APPROVED} or ${AppService.DENIED}

        Each of the metric's values need to meet its respective benchmark with no margin of error. 

        `;

        let table = '';
        Array.from(metrics.entries()).forEach(([name, value]) => {
            table += `${name}: ${value}, `;
        });
  
        const message0: ChatCompletionRequestMessage = {
            role: 'system',
            content: template
        }
        const message1: ChatCompletionRequestMessage = {
            role: 'user',
            content: table
        }

        const messages:Array<ChatCompletionRequestMessage> = [message0, message1];
        // console.log(messages);
        return {
            model: "gpt-3.5-turbo",
            temperature: 0.0,
            messages:messages
        }
    }

}