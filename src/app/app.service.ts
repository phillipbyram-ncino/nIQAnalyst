import { Injectable } from "@angular/core";
import { Configuration, CreateCompletionRequest, OpenAIApi } from "openai";


export interface CallOptions {
    api_key?: string,
    metrics: Map<string, number>
}
@Injectable({ providedIn: "root" })
export class AppService {


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
            const completion = await this.openai.createCompletion(this.buildCCR(options.metrics));
            return completion.data.choices[0]?.text || 'There was an error with the response';

        } catch (error) { }
        return 'hi';
    }

    buildCCR(metrics: Map<string, number>): CreateCompletionRequest {

        let template = `
        Repeat the following numbers back to me along with their names:
        `;

        Array.from(metrics.entries()).forEach(([name, value]) => {
            template += `name:${name} | value: ${value}
            `;
        });
        return {
            model: "text-davinci-003",
            prompt: template,
            temperature: 0.6,
        }
    }

}