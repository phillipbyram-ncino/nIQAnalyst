import { Injectable } from "@angular/core";
import { Configuration, OpenAIApi } from "openai";


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

    async makeCall(key?: string): Promise<string> {
        key && this.doSetup(key);
        if (!this.openai) {
            throw Error('api not initialized');
        }
        try {
            const completion = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: 'please repeat the following: hello world',
                temperature: 0.6,
            });
            return completion.data.choices[0]?.text || 'There was an error with the response';

        } catch (error) { }
        return 'hi';
    }

}