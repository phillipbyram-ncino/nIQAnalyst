import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private readonly service: AppService){}
  title = 'nIQAnalyst';
  api_key:string = '';
  latestResponse: string = 'No response yet';
  
  ngOnInit(): void {

    const key = localStorage.getItem('API_KEY')
    this.api_key = !!key? key: '';
    this.service.doSetup(this.api_key);
  }

  async makeCall(): Promise<void>{
    this.latestResponse = await this.service.makeCall(this.api_key);
  }
  
}
