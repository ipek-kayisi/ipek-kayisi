# İpek Toptan Kuru Gıda

Angular 19 standalone e-commerce storefront for dried fruit, nuts and wholesale grocery products. The storefront is in Turkish and uses Firebase Web SDK for Firestore, Storage and Authentication.

## Run locally

```bash
npm install
npm start
```

## Firebase setup

1. Create a Firebase project and register a Web app.
2. Enable Firestore, Cloud Storage and Email/Password Authentication.
3. Replace the `YOUR_*` values in `src/app/core/firebase.ts` with the Web app configuration.
4. Create the initial categories and products in the `categories` and `products` collections, or use the built-in sample data until Firestore has records.
5. Create admin accounts in Firebase Authentication. The client-side guard is navigation UX only; never rely on it as a security boundary.
6. Select the Firebase project in the Firebase CLI and deploy the rules in `firestore.rules` and `storage.rules` with `firebase deploy --only firestore:rules,storage`.

The Firestore rules allow public reads of `contacts`, which includes the IBAN and account holder saved at `contacts/main`. They also treat any signed-in Firebase user as an admin for writes and order reads; only create accounts for trusted administrators, or replace this check with a server-managed admin role before enabling other user accounts.

Firebase configuration values are public client identifiers, not admin credentials. Do not put service-account keys or Telegram bot tokens in this app.

## Telegram order notifications

Order documents are written to the `orders` collection. To notify Telegram, configure a trusted server-side webhook (for example, a Firebase Cloud Function) and set its HTTPS URL as `TELEGRAM_ORDER_WEBHOOK` in `src/app/core/services/telegram.service.ts`. Keep the bot token and chat ID in server-side secrets. With no webhook URL configured, order creation still works and Telegram notification is skipped.

## Routes

- `/` — storefront home and featured products
- `/catalog` — category-filtered catalog
- `/product/:id` — product details
- `/cart` — cart and checkout
- `/contacts` — contact information and map
- `/admin/login` — Firebase email/password login
- `/admin` — protected sales overview
- `/admin/orders`, `/admin/products`, `/admin/categories` — order and catalog management

## Checks

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

The test command requires a locally installed Google Chrome binary for ChromeHeadless.
