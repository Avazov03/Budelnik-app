# TIMEFLOW
## Software Requirements Specification (SRS) va Technical Specification (TZ)

**Loyiha:** TimeFlow — Smart Alarm & Calendar  
**Platforma:** Android, keyinchalik iOS uchun kengaytirish imkoniyati  
**Asosiy til:** O‘zbek tili  
**Dizayn:** Adaptive Light/Dark  
**Texnologiyalar:** React Native, Expo, TypeScript, zarur hollarda Kotlin native modul  
**Ishlab chiqish muhiti:** Windows 11, Cursor AI Agent, Android SDK  
**Hujjat versiyasi:** 1.0  
**Holat:** Ishlab chiqish uchun asosiy texnik talablar

---

# 1. LOYIHA HAQIDA

## 1.1. Loyihaning maqsadi

TimeFlow — foydalanuvchining kundalik vaqtini boshqarish uchun ishlab chiqiladigan mobil ilova. Ilova ikkita asosiy funksiyani birlashtiradi:

1. Ishonchli budilnik.
2. Shaxsiy kalendar va tadbirlar rejalashtirgichi.

Ilova foydalanuvchiga uyg‘onish vaqtlarini belgilash, budilniklarni takrorlash, muhim sanalarni rejalashtirish va tadbirlar uchun eslatmalar olish imkonini beradi.

TimeFlow internetga doimiy bog‘liq bo‘lmasdan, asosiy funksiyalarni qurilmaning o‘zida bajarishi kerak.

## 1.2. Asosiy mahsulot tamoyili

**UI chiroyli ko‘rinishi yetarli emas. Har bir asosiy funksiya real Android qurilmasida tekshirilishi kerak.**

Xususan, budilnik:
- Ilova ekranda ochiq turganda.
- Foydalanuvchi boshqa ilovaga o‘tganda.
- Ekran qulflanganda.
- Ilova oddiy usulda yopilganda.
- Qurilma qayta ishga tushirilganda.
- Telefonning ruxsatlari o‘zgartirilganda.

har bir holat uchun oldindan belgilangan va test qilingan xatti-harakatga ega bo‘lishi kerak.

Android operatsion tizimi ayrim holatlarda signal vaqtiga, bildirishnomalarga va fon jarayonlariga cheklov qo‘yishi mumkin. Shu sababli tizimning barcha holatlarda mutlaq kafolat bilan ishlashini da’vo qilish mumkin emas. Ilova bunday cheklovlarni aniqlashi, foydalanuvchini ogohlantirishi va ruxsat etilgan mexanizmlardan foydalanishi kerak.

## 1.3. Maqsadli foydalanuvchilar

- Kundalik uyg‘onish vaqtini boshqaradigan foydalanuvchilar.
- Ish, o‘qish va mashg‘ulotlar jadvalini tuzuvchilar.
- Muhim uchrashuv va tadbirlarni eslab qolishni istovchilar.
- Internetga ulanmagan holatda ham asosiy funksiyalardan foydalanishni xohlovchilar.

---

# 2. LOYIHA DOIRASI

## 2.1. Birinchi versiya — MVP

MVP quyidagi funksiyalarni qamrab oladi:

- Bosh sahifa.
- Budilniklarni yaratish, tahrirlash va o‘chirish.
- Haftalik takrorlanish.
- Budilnikni yoqish va o‘chirish.
- Jiringlash oynasi, Snooze va Dismiss.
- Kalendar va sana tanlash.
- Tadbirlarni yaratish, tahrirlash va o‘chirish.
- Tadbir eslatmalari.
- Mahalliy ma’lumotlarni saqlash.
- Light/Dark rejimi.
- Android ruxsatlarini boshqarish.
- Ilova qayta ochilganda ma’lumotlarni tiklash.
- APK yaratish va haqiqiy qurilmada sinash.

## 2.2. Birinchi versiyaga kirmaydigan funksiyalar

Quyidagilar keyingi versiyalarga qoldiriladi:

- Bulutli sinxronlash va akkaunt yaratish.
- Bir nechta qurilma orasida ma’lumot almashish.
- Google Calendar bilan integratsiya.
- AI rejalashtiruvchi.
- Obuna va pullik tariflar.
- Ijtimoiy funksiyalar.
- Murakkab statistika.
- iOS uchun native budilnik implementatsiyasi.

Arxitektura keyinchalik kengaytirishga imkon berishi kerak, lekin MVP uchun keraksiz murakkablik kiritilmaydi.

---

# 3. FOYDALANUVCHI INTERFEYSI VA NAVIGATSIYA

## 3.1. Asosiy navigatsiya

Ilovaning pastki qismida uchta asosiy bo‘lim bo‘ladi:

1. **Bosh sahifa**
2. **Budilnik**
3. **Kalendar**

Har bir bo‘limdan boshqa bo‘limlarga bir yoki ikki harakat bilan o‘tish mumkin bo‘lishi kerak.

Navigatsiya `Expo Router` asosida tashkil etiladi.

Tavsiya etilgan marshrutlar:

- `/(tabs)/index` — bosh sahifa.
- `/(tabs)/alarms` — budilniklar ro‘yxati.
- `/(tabs)/calendar` — kalendar.
- `/alarms/new` — yangi budilnik.
- `/alarms/[id]` — budilnikni tahrirlash.
- `/events/new` — yangi tadbir.
- `/events/[id]` — tadbirni tahrirlash.
- `/settings` — sozlamalar.
- `/alarm/ringing` — jiringlash interfeysi.

Marshrutlar haqiqiy Expo Router fayl tuzilmasiga mos yaratilishi kerak. Yuqoridagi nomlar arxitektura talabi bo‘lib, loyiha ichida izchil nomlash qoidasi qo‘llanadi.

## 3.2. Bosh sahifa

Bosh sahifada quyidagilar ko‘rsatiladi:

- Joriy vaqt.
- Joriy sana va hafta kuni.
- Keyingi faol budilnik.
- Keyingi budilnikkacha qolgan vaqt.
- Bugungi tadbirlar.
- Yaqinlashayotgan eslatmalar.
- Budilnik yaratish uchun tezkor tugma.
- Tadbir yaratish uchun tezkor tugma.

Agar faol budilnik mavjud bo‘lmasa, foydalanuvchiga yangi budilnik yaratish taklif qilinadi.

Agar bugun tadbirlar bo‘lmasa, bo‘sh holat dizayni ko‘rsatiladi.

Vaqt ma’lumotlari tizim vaqtiga asoslanadi. Ilova fon rejimidan qaytganda vaqt yangilanishi kerak.

## 3.3. Budilniklar ro‘yxati

Har bir budilnik kartasida quyidagilar bo‘ladi:

- Soat va daqiqa.
- Budilnik nomi.
- Takrorlanish kunlari.
- Faollik holati.
- Keyingi jiringlash vaqti.
- Tahrirlash imkoniyati.

Kartadagi yoqish/o‘chirish boshqaruvi faqat vizual holatni emas, Android tizimidagi rejalashtirilgan signalni ham boshqarishi kerak.

Budilnikni o‘chirish tasdiqlanganidan keyin:
1. Mahalliy yozuv yangilanadi.
2. Tegishli native alarm bekor qilinadi.
3. Kerak bo‘lsa, bog‘langan bildirishnoma bekor qilinadi.
4. UI yangi holatni ko‘rsatadi.

## 3.4. Budilnik yaratish va tahrirlash

Forma quyidagi maydonlardan iborat:

- Soat.
- Daqiqa.
- Budilnik nomi.
- Takrorlanish kunlari.
- Faollik holati.
- Snooze davomiyligi.
- Signal tovushi.
- Vibratsiya sozlamasi.

Dastlabki standart qiymatlar:
- Takrorlanish: bir martalik.
- Faollik: yoqilgan.
- Snooze: 5 daqiqa.
- Nom: “Budilnik”.
- Vibratsiya: qurilma imkoniyatlariga mos standart qiymat.

Foydalanuvchi vaqtni tanlamasdan saqlashga urinsa, forma xatoni ko‘rsatadi.

Takrorlanish kunlari belgilanmagan bo‘lsa, budilnik bir martalik hisoblanadi.

Takrorlanish kunlari tanlansa, tizim keyingi mos vaqtni hisoblaydi.

## 3.5. Jiringlash ekrani

Budilnik vaqti kelganda maxsus jiringlash interfeysi ochilishi kerak.

Interfeys quyidagilarni ko‘rsatadi:

- Belgilangan vaqt.
- Budilnik nomi.
- Sana.
- Snooze tugmasi.
- Dismiss tugmasi.

`Snooze` bosilganda:
- Joriy jiringlash to‘xtatiladi.
- Belgilangan muddatga yangi signal rejalashtiriladi.
- Snooze holati mahalliy saqlashga yoziladi.

`Dismiss` bosilganda:
- Jiringlash to‘xtatiladi.
- Joriy signal tugallangan deb belgilanadi.
- Takrorlanuvchi budilnik bo‘lsa, keyingi mos vaqt rejalashtiriladi.
- Bir martalik budilnik avtomatik qayta rejalashtirilmaydi.

Jiringlash ekrani oddiy navigatsiya ekrani sifatida emas, Android signal mexanizmi bilan integratsiyalangan holda ishlab chiqiladi.

---

# 4. KALENDAR VA TADBIRLAR

## 4.1. Kalendar interfeysi

Kalendar quyidagi funksiyalarni taqdim etadi:

- Oy ko‘rinishi.
- Oldingi va keyingi oyga o‘tish.
- Bugungi sanaga qaytish.
- Sana tanlash.
- Tanlangan sanadagi tadbirlarni ko‘rish.
- Tadbirlar mavjud sanalarni vizual belgilash.

MVP uchun oy ko‘rinishi yetarli. Hafta va kun ko‘rinishlari keyingi bosqichda qo‘shilishi mumkin.

Hafta boshlanish kuni va sana formatlari lokalizatsiya sozlamalariga mos bo‘lishi kerak. O‘zbekcha interfeys uchun hafta dushanbadan boshlanadi.

## 4.2. Tadbir yaratish

Tadbir formasi quyidagilardan iborat:

- Tadbir nomi.
- Sana.
- Boshlanish vaqti.
- Tugash vaqti — ixtiyoriy.
- Izoh — ixtiyoriy.
- Eslatma vaqti.
- Eslatma faolligi.

Misol:

- Nomi: Ingliz tili darsi.
- Sana: 2026-11-02.
- Boshlanish: 18:00.
- Tugash: 19:00.
- Eslatma: 15 daqiqa oldin.

Eslatma faollashtirilgan bo‘lsa, mahalliy bildirishnoma rejalashtiriladi.

Tadbir vaqti o‘zgartirilganda avvalgi eslatma bekor qilinib, yangisi rejalashtiriladi.

Tadbir o‘chirilganda unga bog‘langan barcha kelajakdagi bildirishnomalar bekor qilinadi.

## 4.3. Sana va vaqt qoidalari

Tadbirlar mahalliy vaqtga asoslangan holda saqlanadi.

- Sana va vaqtni bir-biridan mustaqil noto‘g‘ri talqin qilishga yo‘l qo‘yilmaydi.
- Qurilmaning timezone sozlamasi o‘zgarsa, kelajakdagi eslatmalar qayta hisoblanadi.
- Yozgi vaqt o‘zgarishlari mavjud hududlarda tegishli qoidalar hisobga olinadi.
- Tugash vaqti boshlanish vaqtidan oldin bo‘lsa, validatsiya xatosi ko‘rsatiladi.
- Eski va o‘chirilgan tadbirlarning eslatmalari ishlamasligi kerak.

---

# 5. HAQIQIY ANDROID BUDILNIK ARXITEKTURASI

Bu loyiha uchun eng muhim texnik bo‘lim.

## 5.1. Asosiy talab

Budilnik React Native JavaScript timeriga bog‘liq bo‘lmasligi kerak.

JavaScript timerlari ilova to‘xtatilganda yoki operatsion tizim jarayonni yopganda ishonchli signal mexanizmi bo‘la olmaydi.

Android signalni native qatlamda rejalashtirishi kerak.

Tavsiya etilgan arxitektura:

- React Native + TypeScript — UI va biznes interfeysi.
- Expo — loyiha muhiti va build jarayoni.
- Native Android modul — haqiqiy budilnikni rejalashtirish va boshqarish.
- Android `AlarmManager` — aniq vaqtga signal rejalashtirish uchun.
- Android `BroadcastReceiver` — rejalashtirilgan signal hodisasini qabul qilish uchun.
- Android `Notification` va kerakli foreground komponentlari — platforma qoidalariga muvofiq jiringlash va foydalanuvchi bilan o‘zaro aloqani boshqarish uchun.
- Mahalliy saqlash — budilniklar va tadbirlar ma’lumotlarini saqlash uchun.

Native modul talab qilinsa, loyiha Expo development build bilan ishlaydi. Expo Go ichida mavjud bo‘lmagan native funksiyalar bor deb hisoblanmaydi.

## 5.2. AlarmManager

Android'da budilnikni rejalashtirish uchun mos `AlarmManager` API tanlanadi.

Talablar:
- Bir martalik signal.
- Takrorlanuvchi signal.
- Signalni bekor qilish.
- Snooze uchun yangi signal.
- Qurilma qayta ishga tushgandan keyin tiklash.
- Bir nechta budilnikni bir-biridan ajratish.

Har bir budilnik uchun barqaror identifikator ishlatiladi. Signalni bekor qilishda aynan shu identifikator va mos `PendingIntent` qayta tiklanishi kerak.

Bir budilnikni o‘chirish boshqa budilniklarning signallariga ta’sir qilmasligi shart.

## 5.3. Exact alarm ruxsatlari

Android versiyasi va ilovaning foydalanish holatiga qarab exact alarm ruxsatlari talab qilinishi mumkin.

Quyidagilar farqlanadi:
- `SCHEDULE_EXACT_ALARM`
- `USE_EXACT_ALARM`

Ularning mavjudligi va qo‘llanishi Android versiyasi, target SDK, ilova toifasi va Google Play siyosatiga bog‘liq.

Implementatsiyadan oldin amaldagi Android hujjatlari tekshirilishi kerak. Ruxsat turi shunchaki qulaylik uchun tanlanmaydi.

Agar ruxsat berilmagan bo‘lsa:
1. Ilova ruxsat holatini aniqlaydi.
2. Budilnikni ishonchli rejalashtirish imkoni bo‘lmasa, foydalanuvchiga tushunarli xabar beradi.
3. Foydalanuvchini tegishli tizim sozlamasiga olib borish imkoniyatini taklif qiladi.
4. Ruxsat qayta berilganda rejalashtirish holati tiklanadi.

Foydalanuvchining ruxsatisiz tizim sozlamalarini majburan o‘zgartirishga urinilmaydi.

## 5.4. Qurilma qayta ishga tushishi

Qurilma qayta ishga tushganda oldindan rejalashtirilgan alarm'lar qayta tiklanishi kerak.

Buning uchun:
- Mahalliy ma’lumotlar qurilmada saqlanadi.
- `BOOT_COMPLETED` kabi tegishli tizim hodisasi uchun native receiver kerak bo‘lishi mumkin.
- Android manifest konfiguratsiyasi tekshiriladi.
- Qurilma ishga tushgandan keyin faol budilniklar qayta rejalashtiriladi.
- Ruxsatlar va platforma cheklovlari qayta tekshiriladi.

Android ilovani force-stop holatiga keltirganda yoki foydalanuvchi tizimdan majburan to‘xtatganda boshqa qoidalar amal qilishi mumkin. Bunday holatlar alohida hujjatlashtiriladi va mutlaq ishlash kafolati berilmaydi.

## 5.5. Jiringlash mexanizmi

Signal vaqti kelganda native qatlam:

1. Signal identifikatorini tekshiradi.
2. Budilnik ma’lumotlarini topadi.
3. Jiringlash jarayonini ishga tushiradi.
4. Kerakli bildirishnoma yoki tizim interfeysini ko‘rsatadi.
5. Ovoz va vibratsiyani qurilma imkoniyatlariga muvofiq boshqaradi.
6. Snooze yoki Dismiss harakatini qayta ishlaydi.
7. Mahalliy holatni yangilaydi.

Qulflangan ekranda signal ko‘rsatilishi uchun Android versiyasiga mos bildirishnoma va kerak bo‘lsa, full-screen intent qoidalari tekshiriladi. Bu imkoniyatlar avtomatik ravishda barcha qurilmalarda ruxsat etiladi deb hisoblanmaydi.

## 5.6. Ovoz va vibratsiya

Signal ovozi:
- Qurilma tomonidan qo‘llab-quvvatlanadigan standart signal bilan boshlanadi.
- Keyinchalik foydalanuvchi tanlaydigan tovushlar qo‘shilishi mumkin.
- Ovoz to‘xtatilganda tegishli audio resurslari bo‘shatiladi.
- Bir nechta signal bir vaqtda kelsa, ustuvorlik qoidasi aniq bo‘ladi.

Vibratsiya:
- Qurilma imkoniyatlariga mos ishlaydi.
- Tizim ruxsatlari va foydalanuvchi sozlamalarini hisobga oladi.
- Vibratsiya mavjud bo‘lmagan holatda ilova xato bilan to‘xtab qolmaydi.

Silent mode, Do Not Disturb va ishlab chiqaruvchining energiya tejash siyosati signalga ta’sir qilishi mumkin. Bular testlarda alohida ko‘rib chiqiladi.

## 5.7. Alarm holatlari

Har bir budilnik quyidagi mantiqiy holatlardan biriga ega bo‘lishi kerak:

- `scheduled` — rejalashtirilgan.
- `ringing` — jiringlayapti.
- `snoozed` — keyinga surilgan.
- `dismissed` — joriy signal tugatilgan.
- `disabled` — o‘chirilgan.
- `permission_required` — zarur ruxsat mavjud emas.

Bu holatlar ma’lumotlar modeli va real native holat bilan mos bo‘lishi kerak. UI'dagi holat native tizimdagi haqiqiy holatga zid bo‘lsa, qayta sinxronlash amalga oshiriladi.

---

# 6. MAHALLIY MA’LUMOTLAR VA SAQLASH

## 6.1. Saqlash talablari

TimeFlow'ning asosiy funksiyalari backend talab qilmasligi kerak.

Ma’lumotlar qurilmada saqlanadi. Saqlash texnologiyasi quyidagi talablarni bajarishi kerak:
- Ilova qayta ishga tushganda ma’lumotlar saqlanib qolishi.
- Budilnik va tadbirlar orasidagi bog‘liqlik yo‘qolmasligi.
- Ma’lumotlar versiyalash va migratsiyaga tayyor bo‘lishi.
- Native alarm mexanizmi kerakli ma’lumotlarni ishonchli o‘qiy olishi.

Oddiy sozlamalar uchun `AsyncStorage` ishlatilishi mumkin. Budilniklar va tadbirlarning asosiy ma’lumotlari uchun esa SQLite kabi strukturali saqlash yechimi afzal ko‘riladi.

Agar native modul SQLite ma’lumotlariga to‘g‘ridan-to‘g‘ri kira olmasa, TypeScript va native qatlamlar orasidagi sinxronizatsiya kontrakti aniq belgilanadi. Ikki xil mustaqil ma’lumotlar bazasi yaratilib, ular orasida noaniqlik yuzaga kelishiga yo‘l qo‘yilmaydi.

## 6.2. Budilnik ma’lumotlar modeli

`Alarm`:

- `id`: barqaror noyob identifikator.
- `title`: budilnik nomi.
- `hour`: 0–23 oralig‘idagi soat.
- `minute`: 0–59 oralig‘idagi daqiqa.
- `isEnabled`: faollik holati.
- `repeatDays`: hafta kunlari.
- `snoozeMinutes`: keyinga surish muddati.
- `soundId`: signal tovushi identifikatori.
- `vibrationEnabled`: vibratsiya holati.
- `nextTriggerAt`: keyingi rejalashtirilgan vaqt.
- `createdAt`: yaratilgan vaqt.
- `updatedAt`: oxirgi o‘zgarish vaqti.

Vaqtlar uchun barqaror identifikatorlardan foydalaniladi. Vaqtning o‘zi budilnik identifikatori sifatida ishlatilmaydi, chunki bir vaqtda bir nechta budilnik bo‘lishi mumkin.

## 6.3. Tadbir ma’lumotlar modeli

`CalendarEvent`:

- `id`: noyob identifikator.
- `title`: tadbir nomi.
- `description`: ixtiyoriy izoh.
- `startAt`: boshlanish sanasi va vaqti.
- `endAt`: ixtiyoriy tugash vaqti.
- `reminderEnabled`: eslatma faolligi.
- `reminderOffsetMinutes`: tadbirdan oldingi eslatma muddati.
- `createdAt`: yaratilgan vaqt.
- `updatedAt`: oxirgi o‘zgarish vaqti.

Tadbir vaqti o‘zgarganda eski eslatma identifikatori bekor qilinib, yangi eslatma rejalashtiriladi.

## 6.4. Ma’lumotlar yaxlitligi

- Bir yozuvni tahrirlash boshqa yozuvni tasodifan o‘zgartirmasligi kerak.
- O‘chirilgan tadbirlar uchun bildirishnomalar qolib ketmasligi kerak.
- Faol bo‘lmagan budilnik qayta ishga tushishdan keyin avtomatik faollashmasligi kerak.
- Ma’lumotlarni o‘qish yoki yozishda xatolik bo‘lsa, foydalanuvchiga tushunarli xabar ko‘rsatiladi.
- Saqlashdagi xatolar yashirilmaydi.

---

# 7. LIGHT/DARK DIZAYN TIZIMI

## 7.1. Dizayn tamoyillari

TimeFlow minimal, zamonaviy va foydalanishga qulay ko‘rinishga ega bo‘lishi kerak.

Dizayn:
- Ortiqcha bezaklardan xoli.
- Vaqt va asosiy harakatlarga urg‘u beruvchi.
- Bir qo‘l bilan ishlatishga qulay.
- Turli Android ekranlariga moslashadigan.
- Light va Dark rejimlarida bir xil vizual ierarxiyani saqlaydigan bo‘lishi kerak.

## 7.2. Ranglar

Light rejim:
- Och neytral fon.
- To‘q asosiy matn.
- Bitta asosiy aksent rang.
- Yengil ajratuvchi chiziqlar.
- Xatolar uchun aniq, lekin haddan tashqari yorqin bo‘lmagan ranglar.

Dark rejim:
- To‘q fon.
- O‘qilishi oson och matn.
- Aksent rangning moslashtirilgan varianti.
- Kartalar va modal oynalar uchun yetarli kontrast.

Ranglar komponentlar ichiga alohida-alohida yozilmaydi. Markazlashgan theme tokenlari ishlatiladi.

## 7.3. UI komponentlari

Quyidagi komponentlar qayta ishlatiladigan tarzda ishlab chiqiladi:

- `ScreenContainer`
- `AppHeader`
- `BottomTabBar`
- `PrimaryButton`
- `IconButton`
- `AlarmCard`
- `TimePickerField`
- `WeekdaySelector`
- `CalendarMonthView`
- `EventCard`
- `EmptyState`
- `PermissionBanner`
- `ConfirmationDialog`
- `ThemeProvider`

Komponent nomlari mavjud Expo Router va loyiha tuzilmasiga moslashtirilishi mumkin, lekin qayta ishlatish tamoyili saqlanadi.

## 7.4. Accessibility

- Tugmalar bosish uchun yetarli o‘lchamga ega bo‘lishi.
- Icon tugmalarida accessibility label bo‘lishi.
- Rangning o‘zi yagona ma’no tashuvchisi bo‘lmasligi.
- Matn o‘lchami kattalashtirilganda UI buzilmasligi.
- Fokus, klaviatura va ekran o‘quvchi bilan ishlash imkon qadar tekshirilishi.

---

# 8. TEXNIK ARXITEKTURA

## 8.1. Texnologiyalar

- React Native — mobil interfeys.
- Expo — ishlab chiqish muhiti va build jarayoni.
- TypeScript — tiplar va statik tekshiruv.
- Expo Router — navigatsiya.
- SQLite yoki mos strukturali mahalliy saqlash.
- Android Kotlin — haqiqiy budilnik uchun zarur native implementatsiya.
- Android SDK — build va qurilmada test.
- Git — versiya nazorati.

Aniq dependency versiyalari loyiha yaratilgan paytdagi Expo SDK bilan mosligi tekshirilgandan keyin tanlanadi.

## 8.2. Qatlamlar

**Presentation layer**
- Ekranlar.
- UI komponentlari.
- Navigatsiya.
- Foydalanuvchi harakatlari.

**Domain layer**
- Budilnik biznes qoidalari.
- Keyingi signal vaqtini hisoblash.
- Takrorlanish qoidalari.
- Tadbirlar va eslatmalar mantiqi.
- Validatsiya.

**Data layer**
- Mahalliy ma’lumotlar bazasi.
- Repository interfeyslari.
- Ma’lumotlarni tiklash.
- Versiyalash va migratsiyalar.

**Platform layer**
- Native Android alarm API.
- Ruxsatlarni tekshirish.
- Bildirishnomalar.
- Jiringlash interfeysi.
- Qurilma qayta ishga tushish hodisalari.

UI komponentlari to‘g‘ridan-to‘g‘ri Android API'larini boshqarmasligi kerak. Buning uchun alohida xizmatlar va interfeyslar yaratiladi.

## 8.3. Tavsiya etilgan papkalar tuzilmasi

```text
TimeFlow/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── alarms.tsx
│   │   └── calendar.tsx
│   ├── alarms/
│   │   ├── new.tsx
│   │   └── [id].tsx
│   ├── events/
│   │   ├── new.tsx
│   │   └── [id].tsx
│   ├── alarm/
│   │   └── ringing.tsx
│   ├── settings.tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   ├── features/
│   │   ├── alarms/
│   │   └── calendar/
│   ├── services/
│   │   ├── storage/
│   │   ├── notifications/
│   │   └── native-alarm/
│   ├── theme/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── modules/
│   └── timeflow-alarm/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ALARM_ARCHITECTURE.md
│   ├── TEST_PLAN.md
│   └── BUILD_AND_RELEASE.md
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

Bu tuzilma tavsiya etilgan boshlang‘ich arxitektura. Expo tomonidan avtomatik yaratilgan fayllar tekshirilmasdan o‘chirib yuborilmaydi. `modules/timeflow-alarm/` native modul haqiqatan zarur bo‘lganda tegishli Expo Modules API bilan tashkil etiladi.

---

# 9. XAVFSIZLIK VA ISHONCHLILIK

TimeFlow serverga ega bo‘lmasa ham, mobil ilova uchun xavfsizlik talablari mavjud.

- Keraksiz ruxsatlar so‘ralmaydi.
- Foydalanuvchining kalendar ma’lumotlari uchinchi tomonlarga yuborilmaydi.
- Shaxsiy ma’lumotlarni yig‘ish talab qilinmaydi.
- Debug loglarida maxfiy ma’lumotlar chiqarilmaydi.
- Ilova xatolikdan keyin imkon qadar ma’lumotlarni saqlab qoladi.
- Native modulga kelgan identifikatorlar va argumentlar tekshiriladi.
- Noto‘g‘ri ma’lumotlar tizimni ishdan chiqarmasligi kerak.
- Bildirishnomalar va exact alarm ruxsatlari foydalanuvchi nazoratida bo‘ladi.

Ilova telefonning vaqt zonasi, vaqt sozlamasi va ruxsatlaridagi o‘zgarishlarni kuzatishi kerak. Bu o‘zgarishlar signal va eslatmalarni qayta hisoblashni talab qilishi mumkin.

---

# 10. TEST STRATEGIYASI

## 10.1. Unit testlar

Quyidagi biznes qoidalari unit testlar bilan tekshiriladi:

- Bir martalik budilnikning keyingi vaqtini hisoblash.
- Takrorlanish kunlarini hisoblash.
- Yarim tundan keyingi vaqt.
- Hafta oxiridan keyingi signal.
- Snooze vaqtini hisoblash.
- Tadbir boshlanishi va tugash vaqtini tekshirish.
- O‘chirilgan tadbir eslatmalarini bekor qilish.
- Bir xil vaqtdagi bir nechta budilnik.

## 10.2. Integratsion testlar

- Budilnik yaratish → saqlash → ilovani qayta ochish.
- Budilnikni o‘chirish → native signal bekor qilinganini tekshirish.
- Budilnikni tahrirlash → eski signal bekor qilinganini tekshirish.
- Tadbir yaratish → eslatma rejalashtirilishi.
- Tadbirni tahrirlash → eski eslatma bekor qilinishi.
- Qurilma qayta ishga tushishi → kelajakdagi budilniklarning tiklanishi.
- Ruxsatni o‘chirish → ilova holati to‘g‘ri yangilanishi.

## 10.3. Haqiqiy qurilmadagi testlar

Quyidagi holatlar haqiqiy Android telefonda tekshiriladi:

1. Ilova ochiq va ekran faol.
2. Ilova fon rejimida.
3. Ekran qulflangan.
4. Ilova oddiy usulda yopilgan.
5. Telefon qayta ishga tushirilgan.
6. Exact alarm ruxsati berilmagan.
7. Bildirishnoma ruxsati berilmagan.
8. Telefonning timezone sozlamasi o‘zgartirilgan.
9. Batareya tejash rejimi yoqilgan.
10. Ikki budilnik bir-biriga yaqin vaqtda rejalashtirilgan.
11. Snooze va Dismiss ishlatilgan.
12. Bir martalik budilnik tugaganidan keyin qayta jiringlamagan.

Force-stop, ayrim ishlab chiqaruvchilarning fon cheklovlari va Do Not Disturb holatlari ham alohida tekshiriladi.

## 10.4. Test natijalarini qayd etish

Har bir test quyidagilar bilan hujjatlashtiriladi:

- Test ID.
- Dastlabki holat.
- Amalga oshirilgan harakat.
- Kutilgan natija.
- Haqiqiy natija.
- Pass/Fail.
- Qurilma va Android versiyasi.
- Xatolik qaydlari.

Test bajarilmagan bo‘lsa, `Not tested` deb belgilanadi. Taxmin asosida `Pass` yozilmaydi.

---

# 11. APK BUILD VA RELEASE

## 11.1. Development build

Native Android funksiyalari qo‘shilgach, Expo Go o‘rniga development build ishlatiladi.

Development build:
- Native modulni o‘z ichiga oladi.
- Android ruxsatlarini sinash imkonini beradi.
- Haqiqiy qurilmada native signal mexanizmini tekshirishga yordam beradi.

## 11.2. APK olish

APK yaratishdan oldin:
- TypeScript tekshiruvi.
- Lint va unit testlar.
- Expo konfiguratsiyasi.
- Native modul build'i.
- Android manifest ruxsatlari.
- Haqiqiy qurilmadagi asosiy testlar.

tekshiriladi.

APK lokal Android SDK orqali yoki Expo EAS Build orqali yaratilishi mumkin.

Development APK va release APK bir xil maqsadga ega emas. Release build alohida sozlanishi, imzolanishi va tekshirilishi kerak.

## 11.3. Release qabul mezonlari

- Ilova toza o‘rnatishda ishga tushadi.
- Ma’lumotlar saqlanadi.
- Budilniklar to‘g‘ri rejalashtiriladi.
- Ruxsatlar aniq boshqariladi.
- Ilova qayta ochilganda ma’lumotlar tiklanadi.
- Budilnikni tahrirlash va o‘chirish native holatni yangilaydi.
- Kalendar eslatmalari to‘g‘ri ishlaydi.
- Xatoliklar yashirilmaydi.
- APK haqiqiy Android qurilmada sinovdan o‘tgan.

---

# 12. CURSOR AI AGENT UCHUN ISHLASH PROTOKOLI

Cursor Agent ushbu loyihada senior engineer nazorati ostida implementatsiya qiluvchi agent sifatida ishlaydi.

## 12.1. Majburiy qoidalar

1. Avval repository va mavjud konfiguratsiyani tekshir.
2. Ishni bosqichlarga ajrat.
3. Har bir bosqichdan oldin maqsad va o‘zgarishlarni aniqlashtir.
4. Mavjud kodni sababsiz qayta yozma.
5. Keraksiz dependency qo‘shma.
6. TypeScript strict mode talablarini saqla.
7. Android native funksiyalari uchun rasmiy platforma API'laridan foydalan.
8. Ishlamaydigan placeholder funksiyani tayyor funksiya sifatida ko‘rsatma.
9. Test natijalarini aniq qayd et.
10. Production deployment va ma’lumotlarni o‘chiruvchi buyruqlarni ruxsatsiz bajarma.
11. Har bir yakunlangan bosqichdan keyin o‘zgartirilgan fayllar va keyingi vazifalarni hisobot qil.
12. Git commitlarni kichik va mantiqiy bosqichlarga ajrat.

## 12.2. Agentning qaror qabul qilish tartibi

Agar texnik qaror noaniq bo‘lsa:

- Avval mavjud kod va rasmiy hujjatlarni tekshir.
- Muqobil yechimlarni bahola.
- Xavfsizlik va platforma cheklovlarini hisobga ol.
- Zarur bo‘lsa, qaror va uning sababini hujjatlashtir.
- Destruktiv yoki katta arxitektura o‘zgarishlaridan oldin foydalanuvchi tasdig‘ini ol.

## 12.3. Qabul qilinmaydigan natijalar

Quyidagilar muvaffaqiyat hisoblanmaydi:

- Faqat chiroyli UI yaratilishi.
- Budilnik faqat ilova ochiq paytda ishlashi.
- Ma’lumotlar ilova yopilganda yo‘qolishi.
- Ruxsatlar so‘ralmasdan signal ishlaydi deb da’vo qilish.
- Qurilma qayta ishga tushganda budilniklar tiklanmasligi.
- Test qilinmagan funksiyalarni tayyor deb e’lon qilish.
- TypeScript xatolarini yashirish.
- Build xatosini tekshirmasdan APK tayyor deb hisoblash.

---

# 13. ISHLAB CHIQISH BOSQICHLARI

## Phase 0 — Environment va loyiha poydevori

- Node.js, npm, Git va Android SDK tekshiruvi.
- Expo loyihasini yaratish.
- TypeScript konfiguratsiyasini tekshirish.
- Git repository va boshlang‘ich commit.
- Expo Doctor va boshlang‘ich build tekshiruvi.

**Natija:** ishlaydigan boshlang‘ich loyiha.

## Phase 1 — UI va navigatsiya

- Light/Dark theme.
- Bosh sahifa.
- Budilniklar ro‘yxati.
- Kalendar interfeysi.
- Navigatsiya.
- Formalar va validatsiya.

**Natija:** barcha asosiy ekranlari ishlaydigan UI.

## Phase 2 — Mahalliy ma’lumotlar

- Storage qatlami.
- Budilniklar CRUD.
- Tadbirlar CRUD.
- Ma’lumotlarni qayta tiklash.
- Biznes qoidalari va unit testlar.

**Natija:** ilova qayta ochilganda ma’lumotlar saqlanadi.

## Phase 3 — Native budilnik

- Native modul.
- AlarmManager.
- Exact alarm ruxsatlari.
- Jiringlash va ovoz.
- Snooze va Dismiss.
- Takrorlanish.
- Qayta ishga tushganda tiklash.

**Natija:** haqiqiy Android budilnikning asosiy mexanizmi.

## Phase 4 — Kalendar eslatmalari

- Mahalliy bildirishnomalar.
- Eslatmalarni qayta rejalashtirish.
- Vaqt zonasi o‘zgarishlarini boshqarish.
- Ruxsat holatlarini tekshirish.

**Natija:** tadbirlar uchun ishlaydigan eslatmalar.

## Phase 5 — Integratsion va qurilma testlari

- Android qurilmasida test.
- Ekran qulflangan holat.
- Ilova yopilgan holat.
- Qayta ishga tushirish.
- Ruxsatlar va batareya tejash holatlari.
- Xatolarni tuzatish.

**Natija:** tekshirilgan MVP.

## Phase 6 — APK va release

- Development build.
- Release konfiguratsiyasi.
- APK yaratish.
- O‘rnatish va smoke test.
- Release hisobot.

**Natija:** telefonga o‘rnatish mumkin bo‘lgan, testdan o‘tgan APK.

---

# 14. YAKUNIY QABUL MEZONLARI

TimeFlow MVP tayyor deb hisoblanishi uchun quyidagi talablar bajarilishi shart:

- [ ] Ilova Android telefonida ishga tushadi.
- [ ] Light/Dark rejimi ishlaydi.
- [ ] Budilnik yaratish, tahrirlash va o‘chirish ishlaydi.
- [ ] Haftalik takrorlanish to‘g‘ri ishlaydi.
- [ ] Native alarm rejalashtiriladi va bekor qilinadi.
- [ ] Snooze va Dismiss ishlaydi.
- [ ] Kalendar sanalarni to‘g‘ri ko‘rsatadi.
- [ ] Tadbirlar saqlanadi.
- [ ] Eslatmalar rejalashtiriladi va tahrirlanganda yangilanadi.
- [ ] Ilova qayta ochilganda ma’lumotlar saqlanadi.
- [ ] Qurilma qayta ishga tushgandan keyin alarm tiklanishi tekshirilgan.
- [ ] Ruxsatlar yo‘q holatdagi xatti-harakatlar tekshirilgan.
- [ ] TypeScript va mavjud testlar muvaffaqiyatli.
- [ ] APK haqiqiy qurilmada sinovdan o‘tgan.
- [ ] Test natijalari va ma’lum cheklovlar hujjatlashtirilgan.

**Yakuniy tamoyil:** TimeFlow'ning tayyorligi faqat kod yozilgani bilan emas, funksiyalar haqiqiy Android qurilmasida kutilgan natijani bergani bilan belgilanadi.

---

# 15. CURSOR UCHUN BIRINCHI TOPSHIRIQ

Ushbu TZ'ni loyiha ildizidagi `docs/TZ.md` fayliga saqlash va keyin Cursor Agent'ga quyidagi topshiriqni berish tavsiya qilinadi.

**Agent topshirig‘i:**

> `docs/TZ.md` faylini TimeFlow loyihasining asosiy texnik talablari manbasi sifatida qabul qil. Avval repository, Node.js/npm, Expo SDK, TypeScript va Android SDK holatini tekshir. Mavjud loyiha tuzilmasini o‘rgan. Keyin Phase 0 uchun aniq reja va aniqlangan muammolarni chiqar. Tasdiqlangan rejaga muvofiq boshlang‘ich loyihani sozla, tekshiruvlarni bajar va natijalarni hujjatlashtir. Hozircha haqiqiy budilnik native implementatsiyasiga o‘tma. Phase 0 qabul mezonlari bajarilgandan keyin to‘xta va hisobot ber. Keyingi bosqichni alohida topshiriq bilan boshlaymiz.

**TZ yakuni.**
