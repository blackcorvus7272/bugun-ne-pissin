# Bugün Ne Pişsin

Evdeki malzemeleri girip ne pişirebileceğini gösteren telefon uygulaması.
Türkçe arayüz, 97 tarif — ağırlık Türk mutfağında, yanında evde sık pişen
dünya klasikleri (pizza, lazanya, burger, köri, brownie). Kolay / orta / zor
olmak üzere üç zorluk modu ve sekiz yemek türü.

Kurulabilir bir web uygulaması (PWA). Ana ekrana eklendiğinde tarayıcı çubuğu
olmadan, tam ekran, kendi ikonuyla açılır ve **internet olmadan da çalışır**.
Uygulama mağazası, hesap, kurulum dosyası ya da ücret gerekmiyor.

## Telefona kurmak

**Android / Chrome** — adresi aç, üstte çıkan **Ana ekrana ekle** şeridindeki
*Ekle* düğmesine bas. Şerit görünmezse tarayıcının ⋮ menüsünden *Uygulamayı
yükle*.

**iPhone / Safari** — adresi aç, alt çubuktaki **Paylaş** düğmesine bas,
listeden **Ana Ekrana Ekle** seç.

Kurulduktan sonra ikon diğer uygulamaların yanında durur. İlk açılıştan sonra
tarifler telefonda saklandığı için internet olmadan da çalışır.

## Nasıl çalışıyor

- **Kiler** — üstteki kutuya malzeme yazıp Enter'a bas ya da sık kullanılanlardan
  dokunarak seç. Kiler telefonda `localStorage` içinde saklanır, hiçbir yere
  gönderilmez.
- **Eşleştirme** — her tarifin zorunlu malzemeleri kilerle karşılaştırılır.
  Tarifler önce eksiksiz yapılabilenler, sonra en fazla iki malzemesi eksik
  olanlar, en sonra daha uzak olanlar diye gruplanır.
- **Zorluk modları** — Kolay (35 tarif), Orta (43), Zor (19). Her düğmede o an
  eksiksiz yapılabilen tarif sayısı yazar.
- **Yemek türü** — tarifler sekiz ana başlıkta toplanır: Ana yemek (29), Çorba
  (8), Makarna & pilav (15), Salata & meze (14), Kahvaltı (7), Hamur işi (9),
  Tatlı (9), Atıştırmalık (6). Zorlukla birlikte çalışır: tür rozetindeki sayı
  seçili zorlukta, zorluk düğmesindeki sayı da seçili türde kaç tarifin hazır
  olduğunu gösterir. Seçim `localStorage` içinde saklanır.
- **Eş anlamlılar** — "salça" ile "domates salçası", "kaşar" ile "kaşar peyniri"
  aynı sayılır. Türkçe karakterler normalize edilir, "sogan" yazmak da "soğan"
  ile eşleşir. Öneri kutusu da bu listeyi arar: "labne" yazınca krem peynir,
  "noodle" yazınca erişte çıkar ve kilere malzemenin asıl adıyla girer.
- **Evde var sayılanlar** — tuz, yağ, su, un ve baharatlar iki anahtarla açılıp
  kapatılır.
- **Görünüm** — haki yeşili bir palet üzerine kurulu; renkler `:root` içindeki
  CSS değişkenlerinde (`--haki`, `--zeytin`, `--ink`, `--line` …) tanımlı, açık
  ve koyu tema için ayrı ayrı. Tek bir değişkeni değiştirmek arayüzün tamamını
  döndürür. Metin kontrastları WCAG AA eşiğinin (4.5:1) üzerinde tutuldu.

Telefona özel davranışlar: tarif alttan açılan panelde gelir, geri tuşu
uygulamadan çıkmak yerine tarifi kapatır, tarif açıkken ekran sönmez.

## Dosyalar

| Dosya | İşi |
|---|---|
| `index.html` | Uygulamanın tamamı: arayüz, tarifler, mantık |
| `manifest.webmanifest` | Uygulama adı, ikonları, tam ekran ayarı |
| `sw.js` | Çevrimdışı çalışma için önbellek katmanı |
| `icon.svg`, `icon-*.png` | Ana ekran ve sekme ikonları |
| `.github/workflows/pages.yml` | Her push'ta siteyi GitHub Pages'e yayınlar |

Derleme adımı ve bağımlılık yok. Yerelde denemek için klasörde
`python3 -m http.server` çalıştırıp `http://localhost:8000` adresini aç.
(Ana ekrana ekleme ve çevrimdışı çalışma HTTPS gerektirdiği için yerelde
sınırlıdır; `localhost` bu kuralın istisnasıdır.)

## Tarif eklemek

Tarifler `index.html` içindeki `TARIFLER` dizisinde duruyor:

```js
{i:"benzersiz-kimlik", ad:"Yemeğin Adı", zor:2, dk:45, kisi:4, kat:"Ana yemek",
 mlz:[["patlıcan","6 adet"],["kıyma","300 g"]],
 eks:[["pul biber","1 çay kaşığı"]],
 adim:["Birinci adım.","İkinci adım.","Üçüncü adım."],
 not:"Püf noktası."}
```

`mlz` ve `eks` birer `[malzeme adı, ölçü]` çifti listesidir. Ölçüyü tarifin kaç
kişilik olduğuna göre yaz; `kisi` alanı bunu söylüyor ve tarif kağıdının
"Malzemeler · 4 kişilik" başlığında görünüyor. Ölçü serbest metin — "300 g",
"2 su bardağı", "yarım demet", "kızartmak için 2 su bardağı" hepsi geçerli.

`zor` alanı 1 (kolay), 2 (orta) veya 3 (zor) olmalı. Malzeme adlarını `KAT`
sözlüğündeki yazımlarla aynı tut ki öneri listesinde doğru kategoride
görünsünler; eşleştirme de bu adlar üzerinden yapılıyor, ölçü metni
eşleştirmeye karışmıyor.

`kat` alanı tarifin kendi başlığı (`Çorba`, `Balık`, `Zeytinyağlı` gibi) ve
kartta rozet olarak görünüyor. Yeni bir `kat` uydurursan `ANA_KAT` sözlüğüne de
hangi ana başlığa gireceğini yaz — yoksa tarif "Diğer"e düşer ve tür
rozetlerinin hiçbirinde çıkmaz. Var olan bir `kat` kullanıyorsan yapacak bir
şey yok.

Tarif ekledikten sonra `sw.js` içindeki `SURUM` değerini artır (`bnp-v1` →
`bnp-v2`); kurulu telefonlar güncellemeyi böyle alır.
