# Yapinci.az — Texniki Yol Xəritəsi

Tapşırıqları ardıcıl icra et. Hər tapşırıqdan sonra `npm run build` ilə yoxla,
uğurludursa mənalı mesajla git commit et və növbətiyə keç. Problem çıxsa dayan
və məndən soruş.

## Tapşırıq 1 — PM2 avtostart
`pm2 save` və `pm2 startup` ilə server restartından sonra saytın avtomatik
qalxmasını təmin et.

## Tapşırıq 2 — Bazanın gündəlik backup-ı
PostgreSQL üçün gündəlik dump alan skript yaz (`/opt/backups/` qovluğuna,
7 günlük rotasiya ilə), cron-a əlavə et. Docker-də işləyirsə `docker compose
exec` ilə al.

## Tapşırıq 3 — Məhsulların çoxdilliliyi
Prisma sxemində Product və Category modellərinə EN/RU sahələri əlavə et
(nameEn, nameRu, descriptionEn, descriptionRu — nullable). Migration yarat və
tətbiq et. Admin paneldə məhsul/kateqoriya formalarına bu sahələri əlavə et.
Storefront-da aktiv dilə görə müvafiq sahəni göstər, tərcümə boşdursa
Azərbaycanca əsas sahəyə düş (fallback).

## Tapşırıq 4 — Çoxdilli SEO
generateMetadata funksiyalarında aktiv dilə görə title/description ver.
Product səhifələrinə schema.org Product JSON-LD markup əlavə et
(qiymət, valyuta, mövcudluq).

## Tapşırıq 5 — Server təhlükəsizliyi
ufw qur: yalnız 22, 80, 443 portları açıq. fail2ban quraşdır (sshd jail).
Dəyişikliklərdən əvvəl mövcud SSH sessiyasını kəsməyəcəyinə əmin ol və
mənə təsdiq üçün göstər.

## Tapşırıq 6 — Yekun
Bütün işi main branch-a merge et, GitHub-a push et, v1.2.0 tag-ı qoy.
