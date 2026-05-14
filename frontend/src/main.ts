import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Ensure Ionicons web components are defined (register custom elements)
// Use dynamic import to avoid CommonJS `require` in a TS environment
import('ionicons/dist/loader')
  .then(loader => {
    if (loader && typeof (loader as any).defineCustomElements === 'function') {
      (loader as any).defineCustomElements(window);
    }
  })
  .catch(() => {
    // If dynamic import fails, fall back to script tags included in index.html
  });

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
