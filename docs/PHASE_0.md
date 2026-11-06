# Phase 0 — hisobot

**Sana:** 2026-10-26  
**Holat:** boshlang‘ich loyiha sozlandi. Native budilnik boshlanmadi.  
**Keyingi bosqich:** Phase 1, alohida topshiriq bilan.

Shu hisobot faqat Phase 0 ni yozadi. Ilova keyin davom ettirildi: interfeys, SQLite, native modul kodi va hujjatlar `ARCHITECTURE.md`, `ALARM_ARCHITECTURE.md`, `TEST_PLAN.md`, `BUILD_AND_RELEASE.md` da. Qurilma jiringlashi hali Not tested.

## Qaror

Expo SDK 58 `tabs` shabloni ishlatildi: TypeScript, Expo Router va Light/Dark uchun tayyor `userInterfaceStyle: automatic`.

Loyiha Cursor workspace ildizida turadi (`D:\S.C.P\APP 1`). Paket nomi `timeflow`, ko‘rinadigan nom `TimeFlow`. `APP 1` papka nomi URL-friendly emas, shu sababli Expo loyihani shu nom bilan yarata olmadi.

Expo shabloni fayllari o‘chirilmadi. TZ dagi `src/` va `modules/timeflow-alarm/` tuzilmasi Phase 1–3 da, mavjud fayllarni saqlagan holda kiritiladi.

## Muhit

| Tekshiruv | Natija |
| --- | --- |
| Node.js | v22.15.0 |
| npm | 10.9.2 |
| Git | 2.53.0.windows.2 |
| Expo SDK | 58.0.19 |
| Expo Router | 58.0.26 |
| React Native | 0.88.0 |
| React | 19.3.0 |
| TypeScript | 6.0.3, `strict: true` |
| Android SDK | `C:\Users\DUKE\AppData\Local\Android\Sdk` |
| SDK platform | android-35 |
| Build-tools | 35.0.0, 35.0.1, 36.0.0 |
| adb | SDK ichida bor, PATH da yo‘q |
| `ANDROID_HOME` | o‘rnatilmagan |
| PATH dagi Java | 1.8.0_471 |
| Android Studio JBR | OpenJDK 25.0.3 |

## Tekshiruvlar

| Test | Natija |
| --- | --- |
| `npx expo-doctor` | Pass. 20/20 |
| `npx tsc --noEmit` | Pass, shablon xatosi tuzatilgandan keyin |
| Android Gradle / APK | Not tested |
| Qurilma yoki emulyator | Not tested |
| Native budilnik | Boshlanmadi |

`components/Themed.tsx` dagi `DefaultText['props']` React 19 tiplarida yo‘q. Tip `ComponentProps<typeof DefaultText>` ga almashtirildi. `npm run typecheck` qo‘shildi.

`npm audit`: 5 high. Ular Expo CLI zanjiridagi `node-forge` va `zod` da. `npm audit fix --force` ishlatilmadi, chunki Expo versiyasini buzishi mumkin.

## Aniqlangan muammolar

1. `ANDROID_HOME` yo‘q va `adb` PATH da emas. `npm run android` hozir ishonchli ishlamaydi.
2. PATH dagi Java 8 Android build uchun yetarli emas. Android Studio dagi JDK 25 esa hozirgi Gradle uchun juda yangi bo‘lishi mumkin. Phase 3 dan oldin JDK 17 yoki 21 ni alohida tekshirish kerak. Bu hali build bilan tasdiqlanmagan.
3. Loyiha yo‘lida bo‘shliq bor: `D:\S.C.P\APP 1`. Ba’zi Android buildlari bunday yo‘lda yiqiladi. Hali sinovdan o‘tkazilmagan.
4. `app.json` da `android.package` yo‘q. Birinchi native builddan oldin, masalan `app.timeflow`, belgilanadi.
5. Hozirgi ekranlar shablon ekranlari: `/(tabs)/index` va `/(tabs)/two`. TZ dagi Bosh sahifa, Budilnik va Kalendar hali yo‘q.

## Phase 0 da qilinmagan ish

- UI, formalar, SQLite, bildirishnoma va Kotlin alarm moduli.
- `android/` va `ios/` generatsiyasi.
- APK.
