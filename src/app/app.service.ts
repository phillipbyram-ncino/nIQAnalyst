import { Injectable } from "@angular/core";
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, CreateCompletionRequest, OpenAIApi } from "openai";


export interface CallOptions {
    api_key?: string,
    metrics: Map<string, number>
}
@Injectable({ providedIn: "root" })
export class AppService {

    static APPROVED: string = 'approved';
    static DENIED: string = 'denied';

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

    async makeCall(options: CallOptions): Promise<string> {
        options.api_key && this.doSetup(options.api_key);
        if (!this.openai) {
            throw Error('api not initialized');
        }

        try {
            const completion = await this.openai.createChatCompletion(this.buildCCR(options.metrics));
            const fullContent = completion.data.choices[0]?.message?.content || 'There was an error with the response';

            return fullContent.endsWith(AppService.APPROVED)? AppService.APPROVED: fullContent.endsWith(AppService.DENIED)? AppService.DENIED: 'ERROR';

        } catch (error) { }
        return 'hi';
    }

    buildCCR(metrics: Map<string, number>): CreateChatCompletionRequest {

        let template = `
        add all the following numbers ignoring their names. 
        Reply with only one word depending on the following condition where TOTAL is the total of the numbers:
        If TOTAL > 20 then '${AppService.APPROVED}'
        If TOTAL <= 20 then '${AppService.DENIED}'
        here are the numbers and their names:
        `;

        Array.from(metrics.entries()).forEach(([name, value]) => {
            template += `name:${name} | value: ${value}
            `;
        });
        const message: ChatCompletionRequestMessage = {
            role: 'user',
            content: template
        }
        const messages:Array<ChatCompletionRequestMessage> = [message];
        return {
            model: "gpt-3.5-turbo",
            temperature: 0.0,
            messages:messages
        }
    }

}