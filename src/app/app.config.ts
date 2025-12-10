import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, 
  PieChart, 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent, 
  LabelLayout, 
  CanvasRenderer, 
  BarChart, 
  GridComponent, 
  DataZoomComponent]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEchartsCore({ echarts })
  ]
};
