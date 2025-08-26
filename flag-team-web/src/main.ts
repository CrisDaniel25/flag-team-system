import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app';

import { Chart, registerables } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
Chart.register(...registerables);
bootstrapApplication(App, { providers: [provideCharts(withDefaultRegisterables()), provideAnimations(), ...appConfig.providers] })
  .catch(err => console.error(err));