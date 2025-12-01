
Documents include:

- Title page
- Summary
- Sections & bullet lists
- Implementation plan
- Notes & disclaimers

All docs are fully editable by the user.

---

## 🛠 8. Adding New Kits

To add a new kit:

1. Add a new product object to `products.json`
2. Include:
   - slug
   - name
   - price
   - badge
   - description
   - checkoutUrl
3. Commit & push → site updates automatically.

---

## 🪬 9. Disclaimers (Important)

Comply-Desk is NOT:

- Legal advice  
- A law firm  
- A compliance certification  

All content is **best-practice aligned** but requires customization.

You *must* keep this disclaimer visible.

---

## 🐞 10. Troubleshooting

### **Word file won’t download**
Check:
- Netlify logs → deploy → functions
- Ensure `docx` is installed (`package.json`)
- Ensure OPENAI_API_KEY is set

### **Generator returning empty sections**
Ensure the OpenAI request didn’t rate-limit.  
Upgrade to paid OpenAI API usage if needed.

### **Stripe checkout not opening**
Double-check URLs in `products.json`.

---

## ✨ 11. Credits

Built for **Comply-Desk**, a streamlined compliance automation product.  
Founder: Maneesha Pandey.

This repo was auto-generated and refined with assistance from AI to support rapid deployment and iteration.

---

## 🏁 12. License

This project is proprietary.  
All rights reserved by the Founder.

