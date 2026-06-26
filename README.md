# Cabinet Booking Studio

A localhost prototype for a custom furniture model selector and booking configurator.

The interface is inspired by premium product-series configurator patterns:

- Large "Select a Product Series" opening
- Clean product-series cards
- Image/preview area on each series card
- Product type, typical size and material-option specs
- Technical data and configure actions
- Separate product overview pages such as `/model-start/kitchen`
- Separate full configuration pages such as `/configure/kitchen/Kitchen%20Cabinet`
- Full-page material, finishing, color, size, and site visit configuration
- Copyable WhatsApp-style booking enquiry

There is no online payment flow. The customer selects materials and options first, then the team confirms measurements and payment offline after a technical site visit.

## Run

```powershell
npm start
```

Open:

```text
http://localhost:5173
```

## Files

- `index.html` - product-series selection page
- `product.html` - product overview page after selecting a series
- `configure.html` - full-page product configuration
- `styles.css` - responsive configurator styling
- `app.js` - homepage series-card logic
- `product.js` - product overview filters and model cards
- `configure.js` - full-page estimate and enquiry logic
- `assets/cabinet-showroom.png` - generated cabinet showroom visual
