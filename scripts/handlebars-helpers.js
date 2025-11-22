/**
 * Handlebars Helpers for FoundryBank
 */
export function registerHandlebarsHelpers() {
    // Equality helper
    if (!Handlebars.helpers.eq) {
        Handlebars.registerHelper('eq', (a, b) => {
            return a === b;
        });
    }
    // Format date helper
    if (!Handlebars.helpers.formatDate) {
        Handlebars.registerHelper('formatDate', (timestamp) => {
            if (!timestamp)
                return '';
            const date = new Date(timestamp);
            return date.toLocaleString();
        });
    }
    // Format currency helper
    if (!Handlebars.helpers.formatCurrency) {
        Handlebars.registerHelper('formatCurrency', (amount, currency) => {
            return `${amount.toFixed(2)} ${currency}`;
        });
    }
    // Multiply helper
    if (!Handlebars.helpers.multiply) {
        Handlebars.registerHelper('multiply', (a, b) => {
            return (a * b).toFixed(2);
        });
    }
    // Lookup helper (for nested data)
    if (!Handlebars.helpers.lookup) {
        Handlebars.registerHelper('lookup', (obj, key) => {
            return obj && obj[key] ? obj[key] : [];
        });
    }
}
