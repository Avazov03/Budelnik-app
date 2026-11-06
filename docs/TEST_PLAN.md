# Sinov rejasi

Natija faqat haqiqatdan bajarilgan tekshiruv uchun `Pass`. Qurilma yoki APK da bajarilmagan band `Not tested`.

## Avtomatik

| Tekshiruv | Natija |
| --- | --- |
| `npm test` — budilnik jadvali va kalendar qoidalari | Pass, 2026-10-26, 18/18 |
| `npm run typecheck` | Pass, 2026-10-26 |

Qamrov: keyingi jiringlash, bir martalik va takroriy to‘xtatish, kechiktirish, hafta dushanbadan, tugash boshlanishdan oldin bo‘lmasligi, eslatma ofseti.

## Web interfeys

Brauzer: `npx expo start --web`, 2026-10-26.

| Tekshiruv | Natija |
| --- | --- |
| Bosh sahifa, uch tab, bo‘sh holatlar, Android banner | Pass |
| Budilnik vaqtsiz saqlansa “Vaqtni tanlang.” | Pass |
| Budilnik saqlanadi, ro‘yxatda ko‘rinadi, holat `permission_required` | Pass |
| Yorug‘ mavzu sozlamada tanlanadi va saqlanadi | Pass |
| Tanlangan kun katakchasi qatorni buzmaydi va tadbir kartasi ko‘rinadi | Pass. 2 noyabr, “Ingliz tili darsi”, 13:28 |
| Hafta dushanbadan, bugungi sana belgilangan | Pass |
| To‘g‘ridan-to‘g‘ri ochilgan formadan saqlagach `GO_BACK` xatosi chiqmasligi | Pass. `/alarms/new` dan saqlangach `/alarms` ochildi, xato chiqmadi |
| Tugash boshlanishdan oldin bo‘lsa xato | Not tested brauzerda. Qoida unit testda Pass |
| O‘chirish va yoqish/o‘chirish kaliti | Not tested |
| Qayta yuklashdan keyin yozuv va mavzu | Not tested |

Webda native budilnik yo‘q. `permission_required` va “Yo‘q” ruxsatlar shu sababli to‘g‘ri.

## Android qurilma

| Tekshiruv | Natija |
| --- | --- |
| Development build yoki APK yig‘ilishi | Fail. `prebuild` o‘tdi. `assembleDebug` Reanimated `clang++` yiqilishi bilan to‘xtadi. APK yo‘q |
| Aniq budilnik ruxsati bilan jiringlash | Not tested |
| Qulflangan ekran va to‘liq ekran intenti | Not tested |
| Kechiktirish va to‘xtatish | Not tested |
| Bir martalik qayta jiringlamasligi | Not tested |
| Qayta yoqishdan keyin tiklash | Not tested |
| Bildirishnoma, batareya va jim rejim ogohlantirishlari | Not tested |
| Tadbir eslatmasi | Not tested |
