// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  VAAS_BASE_URL: 'https://gstools2pvn.gl.COMPANY.com:8443/vaas/',
  // VAAS_BASE_URL: 'https://pwgstvmap01.COMPANY.com/vaas/',
  GS_SESSION_IDLE_TIMEOUT: 900000, //15 min-15*60*1000,
  GS_GRID_UPDATE_TIMEOUT: 180000,
  SERVICE: 'Visualization'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
