# LINGUA PRO

## Ishga tushirish
1. `npm install`
2. `.env.example` → `.env` nusxa oling va Firebase kalitlarini kiriting
3. Firebase Console: Authentication → Email/Password va Google yoqing; Firestore va Storage yarating
4. `firestore.rules` va `storage.rules` ni Rules bo'limiga joylang
5. `npm run dev` / `npm run build`

## Admin qilish
Ro'yxatdan o'tgach, Firestore → `users/{uid}` hujjatida `role` ni `admin` ga o'zgartiring (Console orqali).

## Render
`render.yaml` tayyor. Render'da Static Site yarating va `VITE_FIREBASE_*` o'zgaruvchilarini kiriting.
Authentication → Settings → Authorized domains ga Render domenini qo'shing.
