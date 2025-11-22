/**
 * Handlebars Helpers for FoundryBank
 */

export function registerHandlebarsHelpers(): void {
  // Equality helper
  if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });
  }

  // Format date helper
  if (!Handlebars.helpers.formatDate) {
    Handlebars.registerHelper('formatDate', (timestamp: number) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    });
  }

  // Format currency helper
  if (!Handlebars.helpers.formatCurrency) {
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string) => {
      return `${amount.toFixed(2)} ${currency}`;
    });
  }

  // Multiply helper
  if (!Handlebars.helpers.multiply) {
    Handlebars.registerHelper('multiply', (a: number, b: number) => {
      return (a * b).toFixed(2);
    });
  }

  // Lookup helper (for nested data)
  if (!Handlebars.helpers.lookup) {
    Handlebars.registerHelper('lookup', (obj: any, key: string) => {
      return obj && obj[key] ? obj[key] : [];
    });
  }
}

