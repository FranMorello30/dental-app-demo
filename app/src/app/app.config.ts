import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    LOCALE_ID,
    importProvidersFrom,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    PreloadAllModules,
    provideRouter,
    withHashLocation,
    withInMemoryScrolling,
    withPreloading,
} from '@angular/router';
import { provideFuse } from '@fuse';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { DatePipe, registerLocaleData } from '@angular/common';
import localcl from '@angular/common/locales/es-CL';

registerLocaleData(localcl);

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter(
            appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
            withHashLocation()
        ),

        // Material Date Adapter

        // {
        //     provide: MAT_DATE_FORMATS,
        //     useValue: {
        //         parse: {
        //             dateInput: 'D',
        //         },
        //         display: {
        //             dateInput: 'DDD',
        //             monthYearLabel: 'LLL yyyy',
        //             dateA11yLabel: 'DD',
        //             monthYearA11yLabel: 'LLLL yyyy',
        //         },
        //     },
        // // },

        {
            provide: LOCALE_ID,
            useValue: 'es-CL',
        },
        // DecimalPipe,
        // CurrencyPipe,
        DatePipe,
        //provideNativeDateAdapter(),
        provideEnvironmentNgxMask(),
        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            fuse: {
                layout: 'empty',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-teal',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default',
                    },
                    {
                        id: 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id: 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id: 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id: 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id: 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),

        importProvidersFrom(
            CalendarModule.forRoot({
                provide: DateAdapter,
                useFactory: adapterFactory,
            })
        ),
    ],
};

// export type Layout =
//     | 'empty'
//     // Horizontal
//     | 'centered'
//     | 'enterprise'
//     | 'material'
//     | 'modern'
//     // Vertical
//     | 'classic'
//     | 'classy'
//     | 'compact'
//     | 'dense'
//     | 'futuristic'
//     | 'thin';
