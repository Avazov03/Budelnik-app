# Yig‘ish va chiqarish

Android paketi `app.timeflow`, sxema `timeflow`. Ilova hali APK emas. Quyidagi holat 2026-10-26 da shu kompyuterda tekshirilgan.

## Muhit

| Tekshiruv | Holat |
| --- | --- |
| Android SDK | `%LOCALAPPDATA%\Android\Sdk`, platform android-35, build-tools 35 va 36 |
| `ANDROID_HOME` | o‘rnatilmagan. Yig‘ishdan oldin SDK yo‘liga qo‘yiladi |
| `adb` | SDK ichida bor, PATH da yo‘q |
| PATH dagi Java | JRE 1.8.0_471. Gradle buni qabul qilmaydi |
| Android Studio JBR | OpenJDK 25.0.3. Expo / AGP odatda 17 yoki 21 ni kutadi. 25 da yig‘ish sinab ko‘rilmagan |
| Loyiha yo‘li | `D:\S.C.P\APP 1` — bo‘shliq Gradle skriptlarini sindirishi mumkin |

`npx expo prebuild -p android` o‘tdi. `timeflow-alarm` moduli autolink bo‘ldi. JDK 25 va Gradle 9.4.1 konfiguratsiyani boshladi.

`assembleDebug` APK bermadi.

1. Birinchi urinish NDK ni `C:` ga yozolmadi: diskda taxminan 4.5 GB bo‘sh joy qolgan edi. NDK 27.1.12297006 keyin `D:\Android\Sdk` ga o‘rnatildi va SDK ichiga junction qilindi.
2. Ikkinchi urinish Reanimated C++ qismini yig‘ayotganda `clang++` yiqildi (`0xC0000005`). Loyiha yo‘li `D:\S.C.P\APP 1` — bo‘shliq bor. `D:\timeflow` junction ham haqiqiy yo‘lga qaytadi, shu sababli kompilyator buyrug‘ida bo‘shliq qoladi.

APK: **Not tested**. Qurilmada jiringlash ham Not tested.

## Keyingi yig‘ish

1. JDK 17 yoki 21 o‘rnating va `JAVA_HOME` ni shunga qo‘ying.
2. `ANDROID_HOME` ni SDK papkasiga qo‘ying.
3. Yo‘ldagi bo‘shliq xato bersa, loyihani bo‘shliqsiz yo‘lga ko‘chiring yoki junction yarating.
4. `npx expo prebuild -p android`
5. `cd android` va `.\gradlew assembleDebug`
6. `adb install` dan keyin qurilmada `docs/TEST_PLAN.md` dagi Android bandlarini bajaring.

Debug APK yig‘ilganda ham jiringlash “ishlaydi” deb yozilmaydi, toki qurilmada budilnik, qulf ekrani va qayta yoqish alohida tekshirilmaguncha.

## Web

`npm run web` interfeysni ochadi. `web.output` qiymati `single`: server rejimida `expo-sqlite` WASM bog‘lamasi yiqiladi. Web budilnik moduli emas.

## Tekshiruv buyruqlari

```
npm test
npm run typecheck
```

`npm audit` Expo zanjirida 5 ta high xabar beradi (`node-forge`, `zod`). `npm audit fix --force` ishlatilmaydi: u Expo versiyasini sindirishi mumkin.

## Chiqarish

Release imzosi, Play Console va iOS yig‘ishi bu bosqichda yo‘q. iOS keyinroq.
