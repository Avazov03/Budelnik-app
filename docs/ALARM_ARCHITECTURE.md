# Budilnik arxitekturasi

JavaScript taymer budilnikni jiringlatmaydi. Jiringlash faqat Android `AlarmManager.setAlarmClock` orqali rejalashtiriladi.

## Manba va snapshot

SQLite yozuvi asosiy manba. Native qatlam `timeflow_alarms` SharedPreferences ichida snapshot saqlaydi. Bu ikkinchi manba emas: qurilma o‘chib yonganda qayta rejalash uchun nusxa.

Agar snapshotdagi `updatedAt` SQLite dagi vaqtdan yangiroq bo‘lsa, native holat ustun keladi. Bu jiringlash paytida ilova yopiq bo‘lgan o‘zgarishni qaytarib olmaslik uchun.

Yoqilgan deb native ga yuboriladigan budilnik: `isEnabled` va holati `dismissed` yoki `disabled` emas. `permission_required` yozuv snapshotda yoqilgan qoladi, shunda ruxsat berilgach boot uni rejalaydi.

## Holatlar

`scheduled`, `ringing`, `snoozed`, `dismissed`, `disabled`, `permission_required`.

Takror `1` dushanbadan `7` yakshanbagacha. Bo‘sh takror — bir martalik. Bir martalik to‘xtatilsa, qayta rejalashtirilmaydi va o‘chadi. Takroriy to‘xtatilsa, keyingi jiringlash soat, daqiqa va hafta kunlaridan hisoblanadi, kechiktirish vaqtidan emas. Kechiktirish standart 5 daqiqa va millisoniya siljishi.

## Native zanjir

Modul: `TimeflowAlarm` (`modules/timeflow-alarm`).

- `AlarmScheduler` aniq budilnikni `setAlarmClock` bilan qo‘yadi. Noaniq zaxira yo‘q.
- `AlarmReceiver` jiringlashni qabul qiladi. Vaqt mintaqasi siljigan bo‘lsa va holat `snoozed` bo‘lmasa, mahalliy daqiqa farqi 2 dan katta bo‘lsa jiringlamay, qayta rejalaydi.
- `BootReceiver` `BOOT_COMPLETED`, `LOCKED_BOOT_COMPLETED` va `MY_PACKAGE_REPLACED` ni tinglaydi. Bootdan keyin 15 daqiqadan oshib ketgan bir martalik budilnik `dismissed` bo‘ladi. Takroriy budilnik keyingi devoriy vaqtga suriladi.
- `AlarmRingingService` `mediaPlayback` foreground xizmati: `USAGE_ALARM` ohangi, tebranish, 10 daqiqalik qisman wake lock, to‘liq ekran intenti. Amallar: Kechiktirish va To‘xtatish.
- Jiringlash ekrani: `timeflow://alarm/ringing?id=`.

Aniq budilnik ruxsati yo‘q bo‘lsa holat `permission_required` va reja qo‘yilmaydi. Bildirishnoma yoki to‘liq ekran ruxsati yo‘qligi ogohlantirish; aniq budilnik bor bo‘lsa reja baribir qo‘yiladi.

## Ruxsatlar

`USE_EXACT_ALARM` budilnik yadrosi uchun. `SCHEDULE_EXACT_ALARM` sozlama oynasini ochish uchun qo‘shilgan. Qolganlari: `POST_NOTIFICATIONS`, `USE_FULL_SCREEN_INTENT`, `VIBRATE`, `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`.

Batareya optimizatsiyasi so‘ralmaydi. Sozlamalar faqat tizim oynasini ochadi (`ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`).

## Kafolatlanmaydi

Jim rejim, majburiy to‘xtatish va ayrim ishlab chiqaruvchilarning batareya cheklovi jiringlashni to‘sishi mumkin. Ilova buni sozlamalarda ogohlantiradi va ishlaydi deb yozmaydi. Qurilmada jiringlash, qulflangan ekran, qayta yoqish va kechiktirish hali tekshirilmagan.
