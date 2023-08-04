import { Component, OnInit } from '@angular/core';
import { AppService,  } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private readonly service: AppService) { }

  private api_key: string = '';
  private responses: Array<string> = [];
  lastResponse: string = '';

  ngOnInit(): void {
    const key = localStorage.getItem('API_KEY')
    this.api_key = !!key ? key : '';
    this.service.doSetup(this.api_key);

    this.service.latestResponse$.subscribe(
      (response) => {
        this.responses.push(response)
        this.lastResponse = response;
      }
    );
  }
}
