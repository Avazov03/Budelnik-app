# TimeFlow arxitekturasi

Ilova Expo SDK 58, Expo Router va TypeScript `strict` da yozilgan. Android birinchi platforma. Web va Expo Go budilnikni ishga tushirmaydi: ular faqat interfeys va mahalliy saqlashni ko‘rsatadi.

## Qatlamlar

| Qatlam | Joy | Vazifa |
| --- | --- | --- |
| Marshrutlar | `app/` | Tablar, formalar, jiringlash ekrani, sozlamalar |
| Interfeys | `src/components/` | Ekran, kartalar, formalar, kalendar |
| Holat | `src/data/AppData.tsx` | Budilnik, tadbir va mavzu navbati |
| Domen | `src/features/` | Keyingi jiringlash, tekshiruv, kalendar qoidalari |
| Saqlash | `src/services/storage/` | Android/iOS da SQLite, webda `localStorage` |
| Native | `modules/timeflow-alarm/` | Android `AlarmManager` moduli |
| Eslatma | `src/services/notifications/` | Tadbir eslatmalari (`expo-notifications`) |

`@/` yo‘li avval `src/`, keyin loyiha ildizidagi shablon fayllariga qaraydi. `baseUrl` ishlatilmaydi: TypeScript 6 uni eskirgan deb hisoblaydi.

## Ma’lumot

Android va iOS da manba `timeflow.db` (sxema versiyasi 1): `alarms`, `events`, `settings`, `schema_meta`.

Webda `expo-sqlite` WASM Metro orqali yuklanmaydi, shuning uchun `alarms.web.ts` va `events.web.ts` `localStorage` ishlatadi. Bu almashtirish faqat web platformaga tegishli. Android SQLite da qoladi.

Mavzu `system`, `light` yoki `dark`. Hafta dushanbadan boshlanadi. Sanalar mahalliy vaqt bilan yoziladi, UTC kun siljishi ishlatilmaydi.

## Oqim

1. `AppData` ochilishda yozuvlarni o‘qiydi va native qatlam bilan solishtiradi.
2. Saqlash, o‘chirish, yoqish, kechiktirish va to‘xtatish `src/services/platform/sync.ts` orqali o‘tadi.
3. Budilnik avval SQLite ga yoziladi, keyin native modulga JSON snapshot beriladi.
4. Tadbir eslatmasi `expo-notifications` DATE trigger bilan rejalashtiriladi. Webda eslatma rejalashtirilmaydi.

Native modul yo‘q bo‘lsa (web, Expo Go) budilnik saqlanadi va holati `permission_required` bo‘ladi. Bosh sahifadagi banner buni yashirmaydi.
