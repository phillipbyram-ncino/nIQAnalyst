import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppService, CallOptions } from './app.service';
import { MetricCardComponent } from './components/metric-card.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private readonly service: AppService) { }

  title = 'nIQAnalyst';
  api_key: string = '';
  responses: Array<string> = [];
  viewReady = false;

  private test = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut gravida est, eget gravida dolor. Nulla ultricies sed turpis nec hendrerit. Vivamus dolor lectus, finibus vitae vestibulum id, ultricies non nisl. Donec a mauris in nibh consectetur scelerisque id a leo. Fusce aliquet suscipit elit et maximus. Donec sagittis tortor ex, a ultricies neque volutpat at. Aenean aliquam nisl eu dolor tempus, non interdum lectus porta. Phasellus ut urna eu erat malesuada cursus non sed orci. Duis tristique nunc quis dolor lacinia cursus. Proin dignissim neque sed tortor pellentesque, ut interdum lacus pulvinar. Nunc id tortor dui.

Donec nec mi vel purus placerat rutrum non sed orci. Sed vitae nisi in dolor faucibus volutpat sit amet at justo. Maecenas rhoncus congue dolor quis ullamcorper. Cras rhoncus, tortor ac lacinia tristique, dolor magna gravida justo, vitae lacinia libero dui id mi. Aenean gravida lacus facilisis lorem dictum, id sodales velit scelerisque. Pellentesque sit amet turpis vel enim vulputate varius. Suspendisse fringilla lorem et velit cursus laoreet. Etiam a accumsan massa. Sed rhoncus sed nibh at ullamcorper. Proin non ligula bibendum, dapibus magna eget, fermentum est. Nam odio lectus, mollis vitae velit vitae, gravida finibus dolor.

Etiam rhoncus convallis ornare. Proin est lectus, pulvinar quis finibus vel, rutrum et purus. Vestibulum viverra, diam iaculis blandit laoreet, metus dolor tincidunt velit, vel tristique magna est id mi. Praesent a mi at neque dapibus vehicula ut ac velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Maecenas dictum, dui vitae sagittis condimentum, augue sapien viverra orci, eget tincidunt ex nulla in lacus. Nullam tincidunt egestas nunc et placerat. Aenean vel lorem non mauris sollicitudin ultrices ut nec risus. Fusce fermentum lobortis lorem. In vel nulla vitae libero molestie pulvinar nec quis quam. Maecenas ornare nisi eget egestas imperdiet. Cras libero est, fermentum quis faucibus vel, aliquam sed risus. Sed vitae molestie tellus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed convallis risus nisi, in lobortis enim maximus sit amet.

Vestibulum sit 
  
  `

  ngOnInit(): void {
    const key = localStorage.getItem('API_KEY')
    this.api_key = !!key ? key : '';
    this.service.doSetup(this.api_key);

    this.service.latestResponse$.subscribe(
      (response) => this.responses.push(response));

      // this.responses.push(this.test)
  }
}
